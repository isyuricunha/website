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

## 2026-11-25 security follow-up

- MDX Bundler 10.1.1 has no newer stable release in the registry. Scoped overrides use uuid 11.1.1 (retains CommonJS and v4 API) and remark-mdx-frontmatter 6.0.0 (replaces toml with smol-toml). This resolves the six toml advisories and GHSA-w5hq-g745-h8pq. Remove the overrides when the upstream dependency ranges are fixed.
- SonarJS 4.2.3 depends on minimatch 11.0.9. Align testing-library's TypeScript ESLint utils and scope-manager with 8.74.0, whose typescript-estree uses minimatch ^11.0.1. This resolves GHSA-g3hv-75wg-m249. pnpm added a release-age exception scoped only to SonarJS 4.2.3; no global age policy change.
- Replace the preexisting global js-yaml v4 override with compatible secure major-specific pins: 3.15.2 and 4.3.2. gray-matter requires safeLoad (removed in v4). Existing v5 consumers use their declared ranges. Fresh MDX compilation and both Next.js builds exercise the actual dependencies.
- Both pnpm audit and pnpm audit --prod report zero advisories with the preexisting audit exception for braces GHSA-vfj7-8cjw-p6xm. The installed braces 3.0.3 comes through the Next ESLint plugin, fast-glob, and micromatch. No patched release is available; retain the documented exception pending upstream remediation. No new audit exclusions.

References: https://github.com/advisories/GHSA-w5hq-g745-h8pq, https://github.com/advisories/GHSA-g3hv-75wg-m249, https://github.com/advisories/GHSA-4qx8-w7c3-pj3p, https://github.com/advisories/GHSA-vfj7-8cjw-p6xm, https://github.com/jonschlinkert/gray-matter/issues/178, https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md.

## 2026-11-28 full stable refresh

All direct dependencies across the workspace were updated to the newest stable registry releases (`pnpm -r up --latest`), including the majors TypeScript 7.0.2 (compiler), jsdom 31, tsup 9, @hookform/resolvers 7, @mistralai/mistralai 3.5, framer-motion 14, @testing-library/jest-dom 8, eslint-plugin-unicorn 80 and local-pkg 2, plus minor and patch waves (tRPC 11.31.6 client/server, @aws-sdk 3.1178, lucide-react 1.82, resend 6.40.1, react-email 6.11.17, next-intl 4.16.2, Playwright 1.65.1 and @types bumps).

The TypeScript compiler moved to the native tsc 7 while the `typescript` module keeps serving the 6.0.x API through the official side-by-side alias pair (`"typescript": "npm:@typescript/typescript6"` and `"@typescript/native": "npm:typescript@^7.0.2"`), because typescript-eslint 8.74 and Next build-time checking consume the JavaScript API that TypeScript 7.0 does not ship. The app and package tsconfigs dropped the removed `baseUrl` and `ignoreDeprecations` options, switched paths to project-root-relative form, and now declare `types: ["node"]` explicitly to match the TypeScript 7 default of an empty ambient type list.

Intentionally not upgraded: @tanstack/react-table stays on 8.21.3 because @isyuricunha/yutheme 0.2.1 (the newest published release) declares a `^8` peer and its DataTable consumes the v8 table instance; adopting v9 waits for a v9-compatible YuTheme release. The drizzle-kit workspace override stays at 0.31.10, so `pnpm -r outdated` intentionally reports only these two packages.

Code adjustments required by the new rules and APIs: `Logger.error` now takes a single options object (`{ error, context }`) with all call sites and logger assertions migrated; unicorn 80 rule fallout (combined guards, smaller-scope type declarations, early returns, documentation comment style) was fixed in place; the drizzle `db` export gained an explicit `NodePgDatabase<typeof schema>` annotation required by the TypeScript 7 declaration portability check; two unused exports and the unused `@types/js-yaml` dependency that predated this wave were removed separately.

Validation: content-collections build, 625 unit tests across 97 files green, turbo lint and type-check green under the tsc 7 compiler, prettier check, knip, and production builds of both apps (1180 and 72 static pages) on Node 24.
