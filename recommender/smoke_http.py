"""Exercise the real Java -> Python -> model chain. No account credentials or writes."""
import json
import math
from pathlib import Path
import statistics
import time
import httpx


def main():
    rows=[]
    with httpx.Client(timeout=20) as client:
        assert client.get("http://127.0.0.1:8091/health").status_code==200
        for intent in ["", "Find Taylor Swift songs, with some variety.", "Recommend Rock songs from different artists.", "Find tracks from the album 1989."]:
            start=time.perf_counter()
            response=client.post("http://127.0.0.1:8080/song/discover",json={"intent":intent})
            assert response.status_code==200, response.status_code
            result=response.json(); assert result["code"]==0
            data=result["data"]; songs=data["songs"]
            assert len(songs)==10
            assert len({s["songId"] for s in songs})==10
            assert all(s["audioUrl"] and s["recommendationReason"] for s in songs)
            if intent in {"Find Taylor Swift songs, with some variety.", "Recommend Rock songs from different artists."}:
                assert data["mode"]=="agent", data["mode"]
            rows.append({"intent":intent,"mode":data["mode"],"cached":data["cached"],"elapsed_ms":round((time.perf_counter()-start)*1000,2),"song_ids":[s["songId"] for s in songs]})
        cached_times=[]
        for _ in range(20):
            start=time.perf_counter()
            data=client.post("http://127.0.0.1:8080/song/discover",json={"intent":"Find Taylor Swift songs, with some variety."}).json()["data"]
            assert data["cached"] is True
            cached_times.append((time.perf_counter()-start)*1000)
        assert client.post("http://127.0.0.1:8080/song/discover",json={"intent":"x"*201}).status_code==400
        assert client.post("http://127.0.0.1:8080/song/discover",json={"intent":""},headers={"Authorization":"invalid"}).status_code==401
        assert client.post("http://127.0.0.1:8080/song/listening-event",json={"songId":1,"eventId":"0"*32,"listenedSeconds":30}).status_code==401
        audio_status=client.head(songs[0]["audioUrl"]).status_code
        assert audio_status==200
        report={"scope":"Real localhost Java/Python/DeepSeek/MySQL/Redis HTTP chain; anonymous intent queries; not browser or load testing.","cases":rows,"cache_requests":20,"cache_p50_ms":statistics.median(cached_times),"cache_p95_ms":sorted(cached_times)[math.ceil(.95*len(cached_times))-1],"media_head_status":audio_status,"invalid_intent_rejected":True,"invalid_token_rejected":True,"anonymous_history_write_rejected":True}
        path=Path(__file__).with_name("reports")/"http-smoke.json"
        path.write_text(json.dumps(report,indent=2),encoding="utf-8")
        print(json.dumps(report,indent=2))


if __name__=="__main__": main()
