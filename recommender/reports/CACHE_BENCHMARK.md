# Repeated recommendation requests: local cache benchmark

Measured September 23, 2026, using the real Java -> Python -> model API path, MySQL and Redis on Windows 11 / Python 3.13.14. The existing caching implementation was measured; serving code was not modified to manufacture a speedup.

## User problem and mechanism

Repeatedly requesting the same AI-curated Discover selection need not wait for another model generation. Successful results have a five-minute Redis TTL. The key hashes the user, listening/favorite profile, catalog contents and requested intent. New activity or catalog changes select a different key. This is exact-request caching, not semantic caching. Java still reads MySQL to construct the current key; no reduction in database reads was measured or claimed.

## Protocol

After one default-content warmup, issue 10 fresh AI requests from five distinct prompts, with unique recorded request references to guarantee cache misses. Immediately repeat each exact request three times over the same persistent HTTP connection. All requests run sequentially. Do not flush Redis or alter real accounts. Count model fallbacks separately rather than treating them as cache successes. For each query, take the median of its three cache-hit timings; then compare the median across the ten pairs. Timing covers client-observed end-to-end HTTP latency.

## Results

| Measurement | Result |
|---|---:|
| Attempted / successful Agent queries | 10 / 10 |
| Fallbacks | 0 |
| Validated cache-hit requests | 30 |
| Uncached median | 3,989.2685 ms |
| Median of per-query cache-hit medians | 10.301 ms |
| Reduction between those medians | 99.7418% |
| Uncached descriptive P95 | 4,490.693 ms |
| Per-query cache-hit median descriptive P95 | 12.901 ms |
| Cached song IDs and reasons equal to first output | 30 / 30 |

Raw observations, exact prompts, timestamp, source hash and machine metadata: [cache-benchmark-8d9d11b07f.json](cache-benchmark-8d9d11b07f.json).

Four focused Java integration tests also passed: playable/unique cache reuse; idempotent playback and changed-profile results; user isolation and token validation; and changed favorites selecting updated results. The new favorite test uses a rolled-back transaction, leaving no durable favorite changes.

This result applies to cache hits for repeated requests, not all recommendation requests, model inference speed, production traffic or concurrent load. No frontend rendering time is included. Cold requests still take seconds. Small-sample tail values are descriptive and are not SLOs. The exact-query references ensure misses but also form part of model input, as recorded in the raw report.

## Reproduce

Start MySQL, Redis, Spring Boot with its local profile and `recommender/start.ps1`. Then run from `recommender`:

```powershell
..\.venv\Scripts\python.exe benchmark_cache.py
```

This makes 10 billable AI requests, with bounded tool calls/repair per request, and 30 cache-hit requests when all 10 succeed. Each run creates a uniquely named report without overwriting previous measurements.

From `server`, run the focused correctness checks:

```powershell
.\mvnw.cmd -q test '-Dspring.profiles.active=local' '-Dtest=DiscoveryIntegrationTest'
```
