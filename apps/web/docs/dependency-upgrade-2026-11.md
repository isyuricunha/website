# Dependency maintenance — November 2026

Next.js upgraded 16.4.0 to 16.4.6 using the official security upgrade guidance.
React and Next companions aligned across workspaces. Updated 94 distinct direct dependencies (156 manifest entries); retained major compatibility and the existing pnpm release-age policy. All three tRPC packages are pinned to 11.28.5, since the newer 11.31.3 react-query publication was deprecated. YuTheme's exact icon peer remains 13.15.1.

Validation: frozen lockfile install, peer checks, 454 tests, scoped ESLint, Next production build and real Chromium desktop/mobile navigation. The browser's intentional 404 network message is expected. External OAuth, email and AI providers are not configured in the isolated development runtime. Docs app production build not independently verified.

Security audit: no Next.js advisory remains. Same-major transitive fixes for Zod, undici, fast-uri and serialize-javascript. Remaining advisories affect uuid, toml and minimatch; upstream dependency ranges would require major changes. Do not silently force incompatible major versions or suppress advisories.

## Isolated dev runtime

The exported production .env.local remains ignored and untouched. Development on port 43120 uses a separate PostgreSQL 17 database with 49 tables and local Redis 7 behind serverless-redis-http. The historical migration chain fails from an empty database on account_user_id_user_id_fk; only the isolated development database was initialized from the current Drizzle schema. No production migration was performed.

Upstash Ratelimit 2.1+ uses proprietary allow-key-locking Lua flags. Local Redis rejects them; the loopback-only dev adapter translates that flag and script hashes while executing the actual Lua atomically in Redis. It is outside the repository and not used in production. An accountless scratch Redis was provisioned while checking compatibility but never connected to website traffic; it expires automatically. Rate limits remain enabled. React Query Devtools are opt-in via NEXT_PUBLIC_REACT_QUERY_DEVTOOLS=true to avoid covering the mascot.

Dev support files: ~/chatgpt/website-nery-mascot/dev-services/ and scripts/. Use systemctl --user status website-nery-dev.service and website-nery-redis-compat.service. No production credentials loaded into dev.

References:
- https://github.com/vercel/next.js/security/advisories
- https://pnpm.io/cli/update
- https://upstash.com/docs/redis/sdks/ts/developing
- https://upstash.com/docs/redis/features/key-locking
