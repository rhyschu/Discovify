# Local verification: September 22, 2026 (US Eastern)

## Scope

Homepage **single-track** recommendations. The removed homepage playlist module stays removed. Existing playlist memberships are used only as an offline label source. Catalog: 499 playable song records; 690 memberships; 13 collections eligible for a seeded 60/40 observed/held-out split.

## Quality experiment

| Strategy | Mean nDCG@10 | Mean Recall@10 |
|---|---:|---:|
| Legacy-style genre + latest-80 + random baseline (20 seeds) | 0.1178 | 0.0627 |
| Artist-only baseline | 0.5601 | 0.2989 |
| Time-decayed profile + multi-channel rank fusion | 0.9014 | 0.6302 |
| Forced profile-only DeepSeek Agent reranking | 0.7944 | See per-case JSON |

Candidate Recall@40: 0.8796. The live run completed 13/13 cases in Agent mode, with 64 successfully executed evidence-tool calls. Agent latency median: 4,289.82 ms; descriptive P95: 4,928.31 ms. Content retrieval median: 2.69 ms; descriptive P95: 41.66 ms including the first index build. Retrieval timings exclude Java, SQL and HTTP; Agent timings include model requests and validation. These are sequential local measurements, not load-test SLOs.

**Decision:** do not force the LLM into ordinary homepage refresh. Content ranking performed better on this small proxy dataset. Deploy content recommendations by default; use the model for explicit listening requests. The live evaluator deliberately forces profile reranking to reveal its value/limitations. Weights were not optimized to these labels. Prompt/tool-budget fixes used this development dataset, so it is not an independent final test set.

The collections can be artist- or album-heavy, and playlist membership is not a direct measure of an individual listener's preference. Do not describe 0.90 nDCG as 90% real-user accuracy or an online conversion gain. The resume attributes 0.90 specifically to **content ranking**, not to the LLM.

Exact parameters, data/source hashes, per-case scores, mode, tool traces and timings are in [live-evaluation.json](live-evaluation.json). Reproduction commands and limitations are in [the service README](../README.md).

## Integration and failure behavior

- 13 Python tests passed: deterministic cold start, decay/repeat cap, profile isolation, ID exclusion, successful repair, invalid/duplicate IDs, timeout, malformed output, small catalogs, service authentication/schema, zero model calls on default refresh and actual gateway tool-budget handling.
- 7 Java tests passed, including 3 new integration tests: playable unique cached results, idempotent event retries/profile cache invalidation, cross-user isolation and live-token validation/revocation. Existing catalog and Redis tests also passed with the local profile.
- Vue production build and `vue-tsc --noEmit` passed. Existing Browserslist freshness and bundle-size warnings remain.
- Real Java -> Python -> DeepSeek requests returned valid single-track recommendations for an artist request and a multi-artist Rock request. A narrow album request twice failed the exact-count validation and safely returned a labeled fallback. This is a documented limitation, not a successful AI result.
- The final HTTP smoke report includes cache hits for the successful AI requests; their uncached model traces are in the local runtime log. Twenty subsequent cache requests: median 11.76 ms, P95 13.17 ms. These are local warm-cache timings, not model inference latency.
- Invalid token, oversized intent and anonymous playback writes were rejected. A recommended media URL returned HTTP 200 from MinIO.
- No browser connection was available. Visual layout, interactive clicking and 30-second browser playback were not browser-tested. The playback-event persistence and authentication were integration-tested; browser UI logic was type-checked and built.

See [http-smoke.json](http-smoke.json). Runtime credentials remain in ignored local configuration. No production deployment or real-user A/B study was performed.
