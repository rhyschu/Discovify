# Verification — 2026-09-22

The homepage single-track recommendation service is now implemented with LangGraph, DeepSeek, time-decayed profiles, metadata rank fusion, bounded tools and deterministic fallback. Current evidence: [recommendation verification report](recommender/reports/RESULTS.md).

Current checks: 13 Python tests and 7 Java tests passed; client build and TypeScript check passed; live model and Java/Python/MySQL/Redis/MinIO HTTP checks completed. The 13-case offline development benchmark is not a real-user study. No browser connection was available for the new UI; the browser checks below describe the earlier September 15 version only.

# Historical verification — 2026-09-15

## Passed

- Client and studio production builds; frontend TypeScript checks.
- Maven package with four passing backend tests, including six sort orders across pagination boundaries and sort parameter validation.
- API comparison of all 499 songs against database order for title/artist/album, ascending/descending; default artist order and invalid field rejection.
- Admin login, dashboard totals and all six admin catalog sort orders.
- Temporary-user login, profile, save/unsave, recommendation retrieval and logout. A saved song appears exactly once after fixing a join that previously included other users' favorite rows. Favorite cache keys now include user identity and resource type.
- Discover and banner endpoints; audio HTTP Range response returns 206 with the requested bytes.
- Browser review of Discover, Library, admin dashboard and song catalog; actual music playback; mobile layout at 390px without horizontal document overflow.
- Original Chinese music titles preserved; storage migration has matching keys and sizes for 924 objects.

## Scope and follow-up

This is local development validation. SMTP delivery, every destructive administration action, production deployment, load testing and a full security audit were not performed. Existing recommendation logic remains genre-based. Frontend bundles build successfully but include large chunks that can be optimized later.
