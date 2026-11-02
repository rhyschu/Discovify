# Migration notes

## Completed

The application now uses the `discovify` database, `discovify_app` local database account, `discovify-data` MinIO bucket, and `discovify-redis` Docker container. The Java entry point is `com.discovify.DiscovifyApplication`; the packaged server is `server/target/discovify.jar`.

All 12 database tables were copied before the genre migration. The catalog contains 499 songs. All 924 MinIO object keys and sizes were verified against the source bucket. Catalog media URLs now reference the new bucket. The source media folder is named `discovify-data`.

## Directory rename completed

The project root is now `C:/Users/Rhys/vs-workspace/public/Discovify`. Both frontend dependency trees were reinstalled with `pnpm install --force --frozen-lockfile` to repair Windows junctions pointing at the former root. If the folder moves again, repeat this command in both `client` and `admin`.

## Rollback data and provenance

The original `vibe_music` database remains as a rollback copy. The old `vibe-music-data` bucket was deleted at the owner's request after checking all 924 object keys and sizes against `discovify-data`. One differing ETag was independently verified with SHA-256. The new bucket remains intact.

Existing Git history and upstream remotes remain. Before publishing as your own repository, create your repository and update its remote; preserve license notices. No remote repository was created or pushed during this migration.

Local pre-migration source/config and database backups are under `%TEMP%/discovify-work`. These contain private configuration and must not be committed or shared.

## Current review instances

The validation instances use client http://localhost:8091, studio http://localhost:8092 and API http://localhost:8081. These are temporary processes, not Windows startup services. Restart your normal API/client/studio processes to load the changes; an older process on 8080 may still serve the prior build.
