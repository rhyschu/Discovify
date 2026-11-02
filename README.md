# Discovify

A music discovery application with a Vue3 user client, a Vue 3 administration studio, and a Java 21 / Spring Boot API. The homepage Discover section recommends individual songs using recent listening and favorites. Explicit listening requests use a LangGraph Agent with configurable DeepSeek or OpenAI with read-only catalog tools, validation and fallback. See [recommendation architecture, setup and evaluation](recommender/README.md).

## Local services

Run MySQL on port 3306, the `discovify-redis` Docker container on 6379, and MinIO on 9000 before starting the API. Docker Desktop must be running for the Redis container. The database is `discovify`; the media bucket is `discovify-data`.

From the project root, start MinIO in its own terminal:

```powershell
.\minio\bin\minio.exe server "$PWD\minio\data" --console-address :9001
```

In another terminal:

```powershell
cd server
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.arguments=--spring.profiles.active=local'
```

Start each frontend in its own terminal with `pnpm dev` inside `client` or `admin`. For personalized Discover, also run `.\recommender\start.ps1` from the project root (port 8091). Use the URL printed by Vite. The default API is http://localhost:8080; `VITE_API_BASE_URL` overrides it. Personal database, MinIO and SMTP values belong only in ignored `server/application-local.yml`; model credentials belong in ignored root `.env.local`. Never commit these files.

## Personalization

- New d-shaped music-note logo over a faint globe network, shared by both frontends.
- English application text and controls; original music titles, lyrics and user content are preserved.
- Discover replaces the similar-song section; the daily playlist section has been removed from the homepage.
- Library supports title, artist and album sorting in both directions across all pages. Artist ascending is the default.
- Regional genre variants are consolidated into language-independent genres such as Pop, Rock and Electronic.
- Java packages, Maven artifact, frontend packages, cache namespaces, database and media bucket use Discovify naming.

See [MIGRATION.md](MIGRATION.md) for remaining local steps and [VERIFICATION.md](VERIFICATION.md) for validation boundaries. Each component retains upstream license attribution in THIRD_PARTY_NOTICES.md.

## Model providers

The recommendation service supports independent DeepSeek and OpenAI configurations in ignored root `.env.local`. Set `MODEL_PROVIDER=deepseek` (default) or `MODEL_PROVIDER=openai`, configure the corresponding key, and restart the Python service. See [provider configuration](recommender/README.md#model-provider-configuration). Media files, MinIO binaries/data, local credentials, dependencies and build outputs are excluded from this source repository. Retain third-party notices when redistributing.

## Private configuration and commits

Use root `.env.local` for real provider keys. This file is ignored and never uploaded. Root `.env.example` contains the matching fields with empty API keys. Leave real keys in place during commits and upload only the blank template; no temporary deletion/restoration is needed. This is the same configuration layout used by TraceRT.

For a fresh admin checkout, copy `admin/.env.example` to `admin/.env` for its non-secret frontend settings. On Windows, prefer `pnpm run build`; when using npm, run the equivalent admin build as `$env:NODE_OPTIONS="--max-old-space-size=8192"; node node_modules/vite/bin/vite.js build` because the original script uses POSIX environment-assignment syntax.
