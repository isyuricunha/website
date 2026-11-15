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
  7). Baseline build recorded in `BASELINE.md` (d0f58016).
- 2026-11-15: Stage 2 done (8a187f51): apps/web-sveltekit scaffold with
  SvelteKit 3.2.0, Svelte 5.57.3, adapter-vercel 7.0.3, Vite 8, Tailwind 4,
  yutheme style presets. Build and svelte-check green.
- 2026-11-15: Stage 3 (framework layer) done (cb45c05e): i18n library
  (catalogs as on-demand chunks, ICU subset formatter, English fallback,
  26 unit tests), [[lang=locale]] optional routing with param matcher,
  hooks.server.ts (locale negotiation + 307 redirect + NEXT_LOCALE cookie +
  lang injection + report-only CSP port), /api/health parity route.
  Verified in dev: / serves en, /pt serves pt with lang="pt" and translated
  content, cookie redirect / -> /pt matches next-intl behavior.

- 2026-11-15: Stage 4 COMPLETE (267e6ae6, c4cfce98): apps/docs-sveltekit
  ships the docs app on SvelteKit 3: docs collection compiled with the
  custom HTML runtime (66 documents), component previews resolved at build
  time with React SSR of the demos plus Shiki source (React isolated to that
  build step; documented exception, the docs demonstrate the published React
  yutheme package; pure Node ESM cannot resolve its extensionless next/link
  import, so the yutheme is bundled server-side via ssr.noExternal). The 106
  component demos moved to apps/docs-sveltekit/src/demos (the Vite JSX loader
  covers only files inside the app root) and the Next.js docs app follows
  via adjusted import paths. Sidebar navigation reuses the docs links
  config; Edit on GitHub and prev/next preserved. Verified visually
  (accordion page: sidebar hierarchy, preview window chrome, live demo
  markup, highlighted code). SvelteKit 3 notes learned: [[...rest]] is
  invalid (rest is always optional, use [...rest]); rest-param entries are
  plain strings, not arrays.

## Stage state

1. Baseline and full feature inventory: DONE
2. SvelteKit architecture and dependency preparation: DONE
3. Shared utilities, configuration, themes, localization: DONE (i18n; theme
   tokens ship with the styles import, Svelte components follow in stage 5)
4. Documentation and content migration: DONE
5. Public website and interactive components: NEXT (home, header/footer,
   interactive widgets, copy-button delegation, interactive doc previews)
6. Authentication and backend integration: PENDING
7. Administrative panel and remaining features: PENDING
8. API, SEO, cron, caching, Vercel compatibility: PENDING
9. Dependency removal and architectural consolidation: PENDING
10. Comprehensive validation, optimization, final review: PENDING

## Decisions log

- Monorepo retained until stage 9 evidence review; removing Turborepo without a
  working replacement risks build orchestration regressions.
- SvelteKit app grows in `apps/web-sveltekit` first; no shared directory is
  edited destructively during the transition.
- Message catalogs stay the single i18n source of truth; the parity suite keeps
  running against them.
- SvelteKit 3 specifics verified from official docs: configuration lives in
  `vite.config.ts`; tsconfig extends `$app/tsconfig`; `#lib` is declared in the
  app package.json `imports` field with explicit extensions; hook types come
  from `@sveltejs/kit/hooks`; param matchers use `defineParams` from
  `@sveltejs/kit/params`.
- `<svelte:document html>` is not supported by the installed Svelte; the lang
  attribute is injected through `transformPageChunk` in hooks.server.ts.
- Locale routing uses a single route tree under `[[lang=locale]]` (optional
  segment, param matcher) instead of duplicating routes per locale; the
  default locale serves unprefixed URLs like today.
- The i18n formatter only implements what the catalogs use (simple placeholders
  and plural selectors with `#`); ICU quoting is intentionally absent.
