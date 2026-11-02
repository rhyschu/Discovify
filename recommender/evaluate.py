"""Playlist-completion proxy, not a user A/B test. Fixed seed, disjoint observed/held-out IDs."""
import argparse
import asyncio
from collections import defaultdict, Counter
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import platform
import random
import statistics
import time
from dotenv import load_dotenv
from agent import recommend, ModelGateway, VERSION
from schemas import Song, Event, RecommendRequest
from retrieval import profile, retrieve, tags

HERE=Path(__file__).parent


def metrics(ids, held):
    dcg=sum((1 if sid in held else 0)/math.log2(i+2) for i,sid in enumerate(ids[:10]))
    ideal=sum(1/math.log2(i+2) for i in range(min(10,len(held))))
    return {"ndcg10":dcg/ideal if ideal else 0,"recall10":len(set(ids[:10])&held)/len(held)}


def baseline(req, seed):
    # Legacy-style genre filter, latest 80 releases, seeded shuffle at the same K.
    # IDs break release-date ties; legacy SQL does not specify tie order.
    rng=random.Random(seed)
    observed={e.song_id for e in req.events}
    genres=set().union(*(tags(s) for s in req.catalog if s.id in observed))
    ordered=sorted(req.catalog,key=lambda s:(s.release_date,-s.id),reverse=True)
    matching=[s.id for s in ordered if s.id not in observed and tags(s)&genres][:80]
    rng.shuffle(matching)
    remaining=[s.id for s in req.catalog if s.id not in observed and s.id not in matching]
    rng.shuffle(remaining)
    return (matching+remaining)[:10]


async def main():
    p=argparse.ArgumentParser(); p.add_argument("--live",type=int,default=0); args=p.parse_args()
    load_dotenv(HERE.parent/".env.local")
    raw=(HERE/"data/catalog.json").read_bytes()
    songs=[Song.model_validate(s) for s in json.loads(raw)]
    valid={s.id for s in songs}
    groups=defaultdict(set)
    for b in json.loads((HERE/"data/playlists.json").read_text()):
        if b["song_id"] in valid: groups[b["playlist_id"]].add(b["song_id"])
    cases=[]
    for pid,ids in sorted(groups.items()):
        if len(ids)<6: continue
        shuffled=sorted(ids); random.Random(2026+pid).shuffle(shuffled)
        split=max(3,int(len(shuffled)*.6))
        if split>=len(shuffled): continue
        observed,held=shuffled[:split],set(shuffled[split:])
        cases.append((pid,RecommendRequest(catalog=songs,events=[Event(song_id=sid,kind="favorite") for sid in observed]),held))
    if not cases: raise RuntimeError("No eligible playlists; no quality metric can be reported")
    rows=[]
    for ix,(pid,req,held) in enumerate(cases):
        t=time.perf_counter(); candidates=retrieve(req,profile(req)); ms=(time.perf_counter()-t)*1000
        ids=[c["id"] for c in candidates[:10]]
        legacy=[metrics(baseline(req,2026+pid+s),held) for s in range(20)]
        row={"case":ix,"playlist_id":pid,"observed":len(req.events),"held_out":len(held),
             "legacy":{k:statistics.mean(x[k] for x in legacy) for k in ("ndcg10","recall10")},
             "content":metrics(ids,held),"content_ms":ms,
             "candidate_recall40":len({c["id"] for c in candidates}&held)/len(held)}
        observed={e.song_id for e in req.events}
        artists=Counter(s.artist for s in songs if s.id in observed)
        artist_ids=[s.id for s in sorted((s for s in songs if s.id not in observed),key=lambda s:(-artists[s.artist],s.id))[:10]]
        row["artist_only"]=metrics(artist_ids,held)
        if ix<args.live:
            result=await recommend(req, ModelGateway(rerank_profile=True))
            row["live"]={**metrics([c["song_id"] for c in result["recommendations"]],held),
                         "mode":result["mode"],"elapsed_ms":result["elapsed_ms"],"trace":result["trace"],"usage":result["usage"],"fallback_reason":result["fallback_reason"]}
            print(f"Live case {ix+1}/{min(args.live,len(cases))}: {result['mode']} ({result['elapsed_ms']} ms)",flush=True)
        rows.append(row)
    summary={"timestamp":datetime.now(timezone.utc).isoformat(),"version":VERSION,"python":platform.python_version(),
             "platform":platform.platform(),"catalog_size":len(songs),"catalog_sha256":hashlib.sha256(raw).hexdigest(),
             "cases":len(cases),"protocol":"Seeded 60/40 playlist completion; >=6 unique playable tracks; binary held-out relevance; legacy-style latest-80 genre baseline averaged over 20 seeded shuffles, ID tie-break; fixed retrieval weights; development benchmark, not production testing, user preference labels or online uplift. Live runs force profile reranking for comparison; deployed default uses content ranking unless an intent is supplied.",
             "legacy":{k:statistics.mean(r["legacy"][k] for r in rows) for k in ("ndcg10","recall10")},
             "content":{k:statistics.mean(r["content"][k] for r in rows) for k in ("ndcg10","recall10")},
             "artist_only":{k:statistics.mean(r["artist_only"][k] for r in rows) for k in ("ndcg10","recall10")},
             "source_sha256":hashlib.sha256((HERE/"agent.py").read_bytes()+(HERE/"retrieval.py").read_bytes()).hexdigest(),
             "content_ms_p50":statistics.median(r["content_ms"] for r in rows),
             "content_ms_p95":sorted(r["content_ms"] for r in rows)[max(0,math.ceil(.95*len(rows))-1)],
             "candidate_recall40":statistics.mean(r["candidate_recall40"] for r in rows),"rows":rows}
    live=[r for r in rows if "live" in r]
    if live:
        summary["live_subset"]={"count":len(live),"model":ModelGateway().model,"modes":dict(Counter(r["live"]["mode"] for r in live)),
            "ndcg10":statistics.mean(r["live"]["ndcg10"] for r in live),
            "paired_content_ndcg10":statistics.mean(r["content"]["ndcg10"] for r in live),
            "p50_ms":statistics.median(r["live"]["elapsed_ms"] for r in live),
            "p95_ms":sorted(r["live"]["elapsed_ms"] for r in live)[math.ceil(.95*len(live))-1],
            "tool_calls":sum(sum(t["node"]=="tool" and t.get("ok",False) for t in r["live"]["trace"]) for r in live)}
    output=HERE/"reports"; output.mkdir(exist_ok=True)
    (output/("live-evaluation.json" if args.live else "offline-evaluation.json")).write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print(json.dumps({k:v for k,v in summary.items() if k!="rows"},indent=2))


if __name__=="__main__": asyncio.run(main())
