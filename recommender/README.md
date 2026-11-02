# Discover: personalized single-track recommendations

This service powers **the homepage Discover track list**. It does not generate playlists or restore the removed daily-playlist section. Each result is a playable existing song, with an optional English explanation. The existing play and favorite controls remain in use.

## Run locally

From the Discovify root (Python 3.13 was tested):

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r recommender/requirements.lock.txt
Copy-Item .env.example .env.local
```

Do not overwrite an existing configured root `.env.local`. Set `MODEL_PROVIDER`, the selected provider's API key/model, and a random `SERVICE_TOKEN` there. Set the same token as `recommendation.service-token` in ignored `server/application-local.yml`, and `recommendation.url: http://127.0.0.1:8091`. The current local installation is already configured.

Apply `server/sql/migrations/002_listening_events.sql` with a migration/admin account, with the `discovify` database selected. The normal application account need not have CREATE permission. This additive migration has already been applied locally.

Start MySQL, Docker/Redis and MinIO as described in the root README; then start the additional service:

```powershell
.\recommender\start.ps1
```

Start Spring Boot with its local profile and the client with `pnpm dev`. The recommendation service binds to loopback on 8091, and accepts only a matching server token. The browser calls Spring Boot, never the model provider. An empty selected-provider API key disables model calls while content recommendations continue. If the Python service is down, Java returns a deterministic catalog mix. The admin studio requires no new recommendation controls.

## Algorithm and implementation

1. **Persistent feedback:** `tb_listening_event` records authenticated listening after 30 actual playback seconds. Client time accumulation ignores seeking and buffering; a unique `(user_id,event_id)` prevents retry duplicates. Existing MySQL favorites provide durable positive signals. Anonymous listening is not saved. These client-reported events are personalization signals, not trusted billing or anti-fraud records.
2. **Time-decayed profile:** a listen has weight `exp(-ln(2)*age_days/14)`. A current favorite contributes 3; per-song weight is capped at 6. Read at most 500 listens over 90 days plus 300 current favorites. Favorites do not decay while still liked. Exclude current favorites and songs heard in the last 7 days from discovery results.
3. **Multi-channel retrieval:** character TF-IDF over title, artist, album and genre supports Chinese and English metadata. Weighted listening centroids, artist affinity, genre affinity and optional query similarity each rank candidates. Weighted reciprocal-rank fusion uses `sum(weight/(60+rank))`, with channel weights 1/1/0.7/1.5. Keep up to 40 candidates after a soft repeated-artist penalty. This is sparse metadata retrieval, **not dense embedding retrieval or audio understanding**. At 499 songs, an in-process index avoids a needless separate vector database.
4. **Conditional Agent:** a LangGraph state machine routes `profile -> retrieve -> rank -> validate`, with one repair pass or deterministic fallback. Normal homepage refresh uses content ranking. An explicit user request activates the model. The model receives compact candidate summaries and may call `search_candidates` and `lookup_candidate` for full metadata. The first search is enforced through tool choice. At most 3 model requests per attempt, 2 tool rounds and 4 executed tools per round; excess tool requests receive a budget-exhausted observation. No arbitrary SQL, shell or external browsing tools are exposed.
5. **Grounded output:** Pydantic validates the response shape and a separate graph node checks exact count, uniqueness and candidate membership. Spring Boot rehydrates IDs against current MySQL rows, excludes observed tracks again, and supplies authoritative media URLs. Explanations are model-generated and may still need human review; valid IDs alone do not prove every reason correct.
6. **Latency and resilience:** one repair at most; 11-second overall Agent deadline with the current configuration, 14-second Java deadline, 4 Python workers in flight and a 50 ms queue admission timeout. Redis stores successful results for 5 minutes keyed by user, catalog contents, daily-bucketed history, intent and algorithm namespace. New listens/favorites or catalog changes change the key. Errors fall back without caching the error. The API reports whether the result was AI-curated, content-ranked or fallback.
7. **Observability:** JSON traces contain node timing, validation/repair events, tool name/success, successful-call token usage and request ID. They exclude API keys, raw listening events, user identifiers and prompts. Usage on interrupted/failed model requests may be incomplete. Version and source hash accompany evaluation reports. No external tracing service is enabled.

## Mapping to the interview guide

Source: the user's local `ai-agent-interview/docs` checkout.

| Guide section | Actual implementation |
|---|---|
| `01-面试八股文/02-核心框架.md`, section 6 | LangGraph typed state, conditional edges, repair budget, fallback |
| `03-RAG技术.md`, sections 6.4 and 7 | Multi-route rank fusion, grounded candidate reranking and diversity |
| `04-工具调用.md` | JSON Schema tool inputs, allowlisted read-only executor, real observations, execution budgets |
| `05-记忆系统.md` | MySQL history/favorites as durable preference memory; Redis TTL for derived results |
| `08-工程化实践.md`, sections 6-8 | Bounded concurrency/timeouts, deterministic fault injection, live API tests and quantitative evaluation |
| `04-简历模板/README.md` | State the implemented action, scope, evaluation protocol and measured result; distinguish offline from production |

This implementation does not claim MCP, multi-agent collaboration, a vector database, or Pydantic AI. It uses **Pydantic validation with LangGraph**, a separate library combination.

References: [LangGraph StateGraph](https://reference.langchain.com/python/langgraph/graph/state), [DeepSeek tool calls](https://api-docs.deepseek.com/guides/tool_calls/), [HTTPX timeouts](https://www.python-httpx.org/advanced/timeouts/).

## Reproduce the measurements

For the September 23 paired cache-miss/cache-hit experiment, see [the cache benchmark report](reports/CACHE_BENCHMARK.md). It measures repeated-request latency separately from recommendation quality and model inference speed.

Run from `recommender`:

```powershell
..\.venv\Scripts\python.exe -m pytest -q
..\.venv\Scripts\python.exe database.py export
..\.venv\Scripts\python.exe evaluate.py
..\.venv\Scripts\python.exe evaluate.py --live 13
```

The last command makes billable model calls. Exports contain catalog metadata and playlist memberships, never users or credentials. Dataset files stay local under ignored `data/`; reports contain aggregate metrics, case sizes and non-private traces.

Quality evaluation uses existing playlist membership **only as an offline source of positive single-track labels**. A seeded 60/40 split supplies observed tracks and held-out songs. It never feeds the playlist title, held-out membership or relevance labels into the recommender. This is a small development benchmark, not a representative user study; same-artist collections can make it artificially easy. An artist-only baseline exposes that limitation. nDCG@10 uses binary membership and log-discounted rank; Recall@10 divides recovered held-out IDs by all held-out IDs. The legacy-style baseline restricts matching genres to the latest 80 releases, then averages 20 seeded shuffles. Date ties use ID order, unlike the unspecified tie order in old SQL.

Live comparison explicitly forces profile-only Agent reranking to measure its value independently of the deployed routing policy. A model that underperforms content ranking is not reported as an improvement. Request-intent smoke tests are separate; they do not establish general recommendation quality. In-process retrieval latency excludes MySQL/HTTP/model time. Small-sample P95 is descriptive, not a production SLO.

For Java integration tests (requires local services):

```powershell
cd ../server
.\mvnw.cmd -q test '-Dspring.profiles.active=local'
```

Remaining production work includes representative opt-in user feedback, traffic-based A/B evaluation, rate limits/quotas for paid AI requests, catalog indexing outside the request path for large catalogs, retention/deletion policies, and deployment monitoring.


## Model provider configuration

Copy the root `.env.example` to root `.env.local` only for a new installation; preserve an existing configured file. The service reads this local file on startup.

```dotenv
MODEL_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-5.4-mini
MODEL_TIMEOUT_SECONDS=10
SERVICE_TOKEN=your-private-service-token
```

For OpenAI, set `MODEL_PROVIDER=openai`, fill `OPENAI_API_KEY`, and select a model available to your account in `OPENAI_MODEL`. Keep both providers' keys in the same ignored root `.env.local`; only the selected provider is used. An absent OpenAI key never reuses a DeepSeek credential. OpenAI requests use `max_completion_tokens` and omit provider-sensitive temperature settings. See the [Chat Completions reference](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create). Mock tests verify provider selection; a live OpenAI check needs your own key.

Existing `MODEL`, `MODEL_BASE_URL` and `MODEL_API_KEY` settings remain DeepSeek-only fallbacks, so existing local installations continue working. An empty selected key disables model calls and preserves deterministic content ranking. Restart the Python recommendation service after editing root `.env.local`. For fresh credentials and uncached testing after switching providers, use a new explicit request: Spring Boot may still serve an existing cached response for an identical request until its TTL expires. The browser never receives model keys. Keep `SERVICE_TOKEN` equal to the private Spring Boot recommendation token.

## Private configuration and commits

Use root `.env.local` for real provider keys. This file is ignored and never uploaded. Root `.env.example` contains the matching fields with empty API keys. Leave real keys in place during commits and upload only the blank template; no temporary deletion/restoration is needed. This is the same configuration layout used by TraceRT.
