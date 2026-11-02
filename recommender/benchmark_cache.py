"""Paired real-HTTP cache-miss/hit benchmark. No cache deletion or account writes."""
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import platform
import statistics
import time
import uuid
import httpx

HERE = Path(__file__).parent
INTENTS = [
    "Find Taylor Swift songs, with some variety.",
    "Recommend Rock songs from different artists.",
    "Find Pop songs from different artists.",
    "Recommend songs by Coldplay and related catalog artists.",
    "Find Electronic songs, with some variety.",
]


def percentile95(values):
    return sorted(values)[math.ceil(.95 * len(values)) - 1]


def main():
    run_id = uuid.uuid4().hex[:10]
    rows = []
    report_path = HERE / "reports" / f"cache-benchmark-{run_id}.json"
    with httpx.Client(timeout=25, trust_env=False) as client:
        health = client.get("http://127.0.0.1:8091/health")
        health.raise_for_status()
        # Warm Java/DB/index initialization, without calling a model.
        warmup = client.post("http://127.0.0.1:8080/song/discover", json={"intent": ""})
        warmup.raise_for_status()

        def fetch(intent):
            started = time.perf_counter()
            response = client.post("http://127.0.0.1:8080/song/discover", json={"intent": intent})
            ms = (time.perf_counter() - started) * 1000
            response.raise_for_status()
            result = response.json()
            assert result["code"] == 0
            return result["data"], ms

        for i in range(10):
            # A recorded unique reference ensures a miss without flushing other users' Redis keys.
            intent = INTENTS[i % len(INTENTS)] + f" Request reference: {run_id}-{i}."
            cold, elapsed = fetch(intent)
            assert cold["cached"] is False, "Expected a fresh cache key"
            assert len(cold["songs"]) == len({s["songId"] for s in cold["songs"]}) == 10
            row = {"case": i+1, "intent": intent, "miss_ms": round(elapsed, 3), "mode": cold["mode"], "hits_ms": []}
            if cold["mode"] == "agent":
                signature = [(s["songId"], s["recommendationReason"]) for s in cold["songs"]]
                for _ in range(3):
                    hit, elapsed = fetch(intent)
                    assert hit["cached"] is True and hit["mode"] == "agent"
                    assert signature == [(s["songId"], s["recommendationReason"]) for s in hit["songs"]]
                    row["hits_ms"].append(round(elapsed, 3))
                row["same_output"] = True
            # Fallbacks stay in the report, never silently counted as successful cache hits.
            rows.append(row)
            report_path.write_text(json.dumps({"run_id": run_id, "status": "in_progress", "rows": rows}, indent=2), encoding="utf-8")
            print(f"Case {i+1}/10: {cold['mode']}, miss {row['miss_ms']:.1f} ms, hits {row['hits_ms']}", flush=True)
    paired = [r for r in rows if r["hits_ms"]]
    assert paired, "No valid AI cache pairs; no speedup claim available"
    misses = [r["miss_ms"] for r in paired]
    paired_hits = [statistics.median(r["hits_ms"]) for r in paired]
    hit_median = statistics.median(paired_hits)
    miss_median = statistics.median(misses)
    source = HERE.parent / "server/src/main/java/com/discovify/service/DiscoveryService.java"
    report = {
        "status": "complete", "timestamp_utc": datetime.now(timezone.utc).isoformat(), "run_id": run_id,
        "protocol": "10 fresh AI-intent requests, each followed by 3 identical requests if agent mode succeeded; persistent local HTTP connection; default-content warmup; no cache deletion; no parallel load. Paired aggregate uses median of three hits per query. Includes HTTP, Java, MySQL, Redis and uncached Python/model time. Unique references are part of the recorded query.",
        "scope": "Local repeated-request cache benefit, not global site latency, production traffic, model speedup or measured database-load reduction.",
        "platform": platform.platform(), "python": platform.python_version(),
        "service_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "attempted_queries": 10, "paired_queries": len(paired), "fallback_queries": 10-len(paired),
        "hit_requests": sum(len(r["hits_ms"]) for r in rows),
        "miss_median_ms": miss_median, "paired_hit_median_ms": hit_median,
        "median_latency_reduction_percent": 100*(1-hit_median/miss_median),
        "miss_p95_ms": percentile95(misses), "paired_hit_p95_ms": percentile95(paired_hits),
        "all_paired_outputs_identical": all(r["same_output"] for r in paired), "rows": rows,
    }
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k!="rows"}, indent=2))
    print(f"Evidence: {report_path}")


if __name__ == "__main__":
    main()
