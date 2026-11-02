# Discover: personalized single-track recommendations

This service powers **the homepage Discover track list**. It does not generate playlists or restore the removed daily-playlist section. Each result is a playable existing song, with an optional English explanation. The existing play and favorite controls remain in use.

## Run locally

From the project root, using Python 3.13:

```ps
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r recommender/requirements.lock.txt
Copy-Item .env.example .env.local
```

Do not overwrite an existing configured root `.env.local`. Set `MODEL_PROVIDER`, the selected provider's API key/model, and a random `SERVICE_TOKEN` there. Set the same token as `recommendation.service-token` in ignored `server/application-local.yml`, and `recommendation.url: http://127.0.0.1:8091`.

Apply `server/sql/migrations/002_listening_events.sql` with a migration/admin account, with the `discovify` database selected. The normal application account need not have CREATE permission.

Start MySQL, Docker/Redis and MinIO as described in the root README; then start the additional service:

```ps
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
7. **Observability:** JSON traces contain node timing, validation/repair events, tool name/success, successful-call token usage and request ID. They exclude API keys, raw listening events, user identifiers and prompts. Usage on interrupted/failed model requests may be incomplete. No external tracing service is enabled.

## Model provider configuration

Copy the root `.env.example` to root `.env.local` only for a new installation; preserve an existing configured file. The service reads this local file on startup.

```dotenv
MODEL_PROVIDER=openai
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
OPENAI_API_KEY=your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-5.4-mini
MODEL_TIMEOUT_SECONDS=10
SERVICE_TOKEN=your-private-service-token
```

OpenAI is the default provider. Fill `OPENAI_API_KEY` and select a model available to your account in `OPENAI_MODEL`. To use DeepSeek, set `MODEL_PROVIDER=deepseek` and fill `DEEPSEEK_API_KEY`. Keep both providers' keys in the same ignored root `.env.local`; only the selected provider is used. An absent OpenAI key never reuses a DeepSeek credential. OpenAI requests use `max_completion_tokens` and omit provider-sensitive temperature settings. See the [Chat Completions reference](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create).

Existing `MODEL`, `MODEL_BASE_URL` and `MODEL_API_KEY` settings remain DeepSeek-only fallbacks, so existing local installations continue working. An empty selected key disables model calls and preserves deterministic content ranking. Restart the Python recommendation service after editing root `.env.local`. After switching providers, use a new explicit request for a fresh response: Spring Boot may still serve an existing cached response for an identical request until its TTL expires. The browser never receives model keys. Keep `SERVICE_TOKEN` equal to the private Spring Boot recommendation token.

## Private configuration and commits

Use root `.env.local` for real provider keys. This file is ignored and never uploaded. Root `.env.example` contains the matching fields with empty API keys. Leave real keys in place during commits and upload only the blank template; no temporary deletion/restoration is needed.
