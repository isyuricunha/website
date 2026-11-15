# SvelteKit migration plan and progress

Migrating yuricunha.com and docs.yuricunha.com from Next.js 16 + React 19 to
SvelteKit 3 + Svelte 5, preserving every feature, integration, security
guarantee and the visual identity. Work happens exclusively on the
`feat/sveltekit-migration` branch. `main` is untouched until the migration is
approved for review.

## Target stack (verified 2026-11-15)

- SvelteKit 3.2.0 (released 2026-10-01; current stable 3.2.0 of 2026-11-10)
- Svelte 5.57.3 (current stable 5.x line)
- `@sveltejs/vite-plugin-svelte` v7 (required by SvelteKit 3)
- `@sveltejs/adapter-vercel` (SvelteKit 3 compatible line)
- Vite 8 (SvelteKit 3 requires it; repository already uses Vite 8.3.4)
- TypeScript 6 (SvelteKit 3 minimum; repository already pins 6.0.3)
- Node.js 24 (repository standard, `.nvmrc` pins v24)
- pnpm 12 workspace + Turborepo (retained pending stage 9 evaluation)
- Tailwind CSS 4, Drizzle ORM, Better Auth, Upstash Redis: retained

SvelteKit 3 breaking changes relevant to this migration (from the official
release notes): configuration lives in `vite.config.ts` instead of
`svelte.config.js`; `$lib` alias renamed to `#lib`; environment variables API
reworked; `getRequest`/`setResponse` synchronous; cookie v2 (ASCII-only cookie
names); TypeScript 6 minimum; Node 22+ minimum.

## Stages

1. Baseline and full feature inventory: IN PROGRESS
2. SvelteKit architecture and dependency preparation
3. Shared utilities, configuration, themes, localization
4. Documentation and content migration
5. Public website and interactive components
6. Authentication and backend integration
7. Administrative panel and remaining features
8. API, SEO, cron, caching, Vercel compatibility
9. Dependency removal and architectural consolidation
10. Comprehensive validation, optimization, final review

## Architecture strategy

- Build the SvelteKit application in `apps/web-sveltekit` alongside the existing
  Next.js app so both stay runnable for visual and performance comparison.
  Stage 9 moves it to `apps/web` and removes the Next.js implementation.
- `apps/docs` migrates the same way (new app, swap at consolidation).
- Shared packages that are framework-agnostic (db, env, utils, emails, kv,
  shared) are reused as-is. `packages/i18n` is next-intl specific: the message
  catalogs (7 locales) are preserved verbatim and a new typed loader replaces
  next-intl inside the package. `packages/mdx-plugins` are framework-agnostic
  (remark/rehype) and reused for content rendering.
- Server-only React Email rendering may remain if the replacement risks email
  regressions; decision documented at stage 6.
- tRPC is retained (468 procedures with real contracts); mounted through the
  fetch adapter in a SvelteKit endpoint with a request-scoped context built
  from SvelteKit's `event.request` instead of Next headers.

## Progress log

- 2026-11-15: Branch `feat/sveltekit-migration` created from `main` at
  `ecfd3b9f`. Repository inspected; route, API, tRPC, database, content, i18n,
  security, cron and test inventory captured in `INVENTORY.md`.
- 2026-11-15: Target stack verified against current official releases
  (SvelteKit 3.2.0, Svelte 5.57.3, adapter-vercel 7.x line, vite-plugin-svelte
  7). Baseline build running; measurements land in `BASELINE.md`.

## Decisions log

- Monorepo retained until stage 9 evidence review; removing Turborepo without a
  working replacement risks build orchestration regressions.
- SvelteKit app grows in `apps/web-sveltekit` first; no shared directory is
  edited destructively during the transition.
- Message catalogs stay the single i18n source of truth; the parity suite keeps
  running against them.
