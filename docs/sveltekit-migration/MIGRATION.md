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

- 2026-11-15: Stage 5 first milestone (dcda2ad9), done by Ella directly
  (Yuri asked for no delegation on this one): header with skip link, yutheme
  logo, responsive overflow navbar (measure row + more dropdown), locale
  switcher (NEXT_LOCALE cookie + client navigation), mobile drawer; footer
  with link columns and star badge placeholder (tRPC data lands in stage 6);
  home with hero (CSS rise/shimmer/glow/caret, reversed word order for
  pt/es/fr), selected projects, latest articles and get in touch. The
  banner/about-cards/recently-updated/newsletter/search/account widgets wait
  for the backend stage by design. Static assets served from apps/web/public
  via kit files.assets. Verified: svelte-check clean, 37 tests green, build
  green, zero horizontal overflow at 375/768/1024/1440/1920, desktop and
  mobile screenshots match the Next.js design. Navbar note: the wide PT-BR
  link labels legitimately fill the available width, same as the Next
  navbar.

- 2026-11-15: Stage 5 second milestone (a681a135): the two client behaviors
  the static content needs now work through one delegated document listener
  per app (no hydration of content): code-block copy buttons (clipboard +
  two-second copied feedback) and docs preview/code tabs (build-time slots
  with data attributes). Verified on production previews: tabs swap panels,
  clipboard receives the code, feedback clears. Scoped-style note: Svelte
  scoped CSS never reaches {@html} content; those controls live in the
  global app.css of each app.

- 2026-11-15: Stage 5/6: guestbook ported (4de74b7a, 481d190b): vanilla tRPC
  client and Better Auth Svelte client (same plugin set as the React one),
  minimal toast store replacing react-sonner, infinite-scroll message list
  with owner/admin delete, Zod-validated message form, sign-in dialog with
  sign-up toggle, pinned card and catalog-driven error card. Verified
  visually in pt (fail-closed 429 error state renders the catalog message).

- 2026-11-15: Stage 5/6: offline + recap ported (35369e79): noindex offline
  fallback (prerendered) and recap with wakatime/lastfm/recap tRPC queries,
  catalog states verified in pt; shared buildLabels helper added. Dev server
  now runs with 4 GB heap (content-collections watcher OOMed at 2 GB).
  JSON-LD schemas deferred to stage 8 SEO surfaces.

## Stage state

1. Baseline and full feature inventory: DONE
2. SvelteKit architecture and dependency preparation: DONE
3. Shared utilities, configuration, themes, localization: DONE (i18n; theme
   tokens ship with the styles import, Svelte components follow in stage 5)
4. Documentation and content migration: DONE
5. Public website and interactive components: IN PROGRESS (home, header/
   footer, copy buttons, doc tabs done; guestbook, music, recap, contact
   need the backend stage and follow it)
6. Authentication and backend integration: NEXT (Better Auth SvelteKit
   integration, tRPC fetch adapter mount, DB access)
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
- Stage 5/6: contact page ported (3d7f54a7): localized form with client validation and toasts, direct contact and social cards

- Stage 5/6: music page ported (all nine Last.fm widgets, shared social-share component, build-time feature flags)

- Stage 5/6: notifications and settings ported (sign-in dialog reused via bindable open; privacy controls included)

- Stage 5/6: projects listing completed (filters, cover cards, GitHub repos via server tRPC caller, JSON-LD). Dev-local 500 on /projects is the preserved fail-closed Upstash rate limit with placeholder envs; verification with real envs pending integration stage.

- Stage 5/6: public profile (u/[handle]) ported with infinite comments. Dev script raises the Vite heap to 4 GB after two OOM crashes in full-bundle dev mode.

- Stage 5/6: home completed (announcement banner, about-me cards with cobe globe, recently updated server-computed, newsletter with native Turnstile, simple-icons data-only). Visual verified in PT at 1440.

- Stage 7 started: admin shell (RBAC layout, sidebar, header, breadcrumbs) and dashboard ported; verified with an admin session locally. Remaining admin pages: users, comments, posts, security, audit-logs, communication, email-marketing, announcements, notifications, monitoring, system-health, data-management, bulk-operations, configuration.

- Stage 7: users page ported (search, role filter, sort, pagination, row actions with confirmation dialogs, edit modal with Zod, CSV export). Remaining admin pages: comments, posts, posts/new, security, audit-logs, communication, email-marketing, announcements, notifications, monitoring, system-health, data-management, bulk-operations, configuration.

- Stage 7 completed: all remaining admin panels ported (comments, audit logs, bulk operations, security, communication, monitoring, system health, data management, configuration, announcements, notifications, email marketing with staged sequential loading and icon-button aria-labels).

- Stage 8: shared backend runners moved into the package: cron alerts and data retention (Bearer CRON_SECRET, fail-closed, verified 401 without and with wrong secret), AI chat (Zod validation, Turnstile, rate limits, site index, streaming; POST 403 fail-closed on Turnstile), chat status, mascot latest post (reads the MDX corpus through an overridable content dir), contact form, newsletter subscribe/confirm/unsubscribe, account data export, AI feedback, AI content generation (GET+POST), admin posts (POST+PUT+DELETE), admin translate. Each has a thin Next wrapper plus a matching SvelteKit +server route; Next wrappers keep `runtime = 'nodejs'` and vitest configs gained package aliases with specific entries before the generic `@/lib/ai/(.*)` wildcard.

- Stage 8: avatar endpoint renders the same deterministic identicon as plain SVG (content-type image/svg+xml, immutable cache) instead of ImageResponse, removing the OG renderer dependency from that route; size query clamped to 16-512.

- Stage 8: OG image endpoint (/og/[id]) ported without React: satori + satori-html templates + resvg render the same card design (1200x630, Geist font shipped as a vendored TTF read via $app/server). satori needed explicit box-sizing:border-box because width:100% plus padding rendered 1312px wide and clipped the footer text; values are HTML-escaped and length-clamped as before.

- Stage 8: SEO endpoints ported: sitemap.xml (same entry logic, xhtml alternate links, prerendered), rss.xml (rss package), robots.txt (same directives plus Content-Signal), llms.txt (same collections and limits). All verified 200 in dev with real content.

- Stage 8: static/sw.js copied unchanged from the Next app and registered from the root layout with a readyState fallback, because after hydration the load event has usually already fired; registration verified in Playwright (registration present after page load).

- Stage 9 (first pass): Next apps removed; web-sveltekit and docs-sveltekit renamed to apps/web and apps/docs with package names @isyuricunha/web and @isyuricunha/docs. Both apps type-check 0/0 and build (web: adapter output 235 MB, "Writing routes done"; docs: exit 0). Static assets restored from the Next public/ tree into the new app. i18n package dropped next-intl exports + next peer; tsconfig package dropped next. Test suites restored from git history and repointed at the shared package and +server routes.

- Stage 9 known state (to fix in validation stage): vitest passes 115/272 locally; the rest fail on (a) test files importing modules that still only existed in the removed Next app (announcement-priority/storage app-local copies, recommendations, yue-chat-storage/base64url utils, mascot components and admin-integrity which are NOT yet ported to Svelte), (b) stale stubs like next/server in ai-content and sharp in og-route tests, (c) dynamic-import alias resolution in the vitest config that still needs a verified recipe, and (d) assertion updates where response shapes legitimately changed. The mascot (10 React files) is the largest unported surface and must be ported before completion.

- Stage 9 (mascot port part 1): mascot-routing (pure path-key helper), SoundManager (WebAudio class replacing the useSound hook) and MascotStateController (mascot-state.svelte.ts, the 961-line useMascotState hook ported to a runes class with $state/$effect, same timers, storage keys, konami handling, skin switching, idle/page-change/new-post messages and click interactions). Remaining mascot work: visual components (virtual-mascot, mascot-game, menu/contact/settings panels, speech bubbles, selection bubble) and the AI chat interface (1673 lines).

- Stage 9 (tests): React component tests that targeted removed .tsx files were rewritten where they test pure helpers (sitemap XML, robots directives) or point at the shared package (admin-integrity via trpc-server utils). .tsx tests for email templates and Svelte-ported components stay and now resolve react devDeps; tests for the not-yet-ported mascot chat UI remain failing until that port lands.

- Stage 9 (mascot port part 2, complete): all mascot visuals ported to Svelte. mascot-icon renders Lucide markup extracted from lucide-static into mascot-icons.ts (no runtime icon dependency); menu/contact/settings panels, speech bubbles, selection bubble, the mini game (score, timer, survival drain, challenge multipliers, achievements, persisted high score) and the AI chat interface (streaming and JSON paths, autonomous NAVIGATE/SEARCH/SCROLL actions with same-origin allowlist, conversation list/rename/clear/delete, share URL import, per-message reactions with dislike comment feedback, Turnstile invisible gating, quick prompts per page, DotMatrix-style thinking indicator). Turnstile/reactions wiring uses the same contracts as the React version. Known remaining svelte-check errors are confined to tests of React components (email templates, dot-matrix loader, mascot chat tests) pending the stage 10 test rewrite; the virtual-mascot still reports a $state ordering complaint under the checker that tsc does not.

- Stage 10 (investigation RESOLVED, verified on build8 2026-11-16): localized index pages WERE being prerendered all along, but the adapter saves unprefixed-directory pages as flat files: the localized homes exist as .vercel/output/static/pt.html (full PT home, lang="pt") and siblings en.html/es.html/fr.html/ja.html/de.html/zh-CN.html, while localized child pages exist as pt/about.html etc.; the adapter config.json adds trailing-slash routes (e.g. /pt -> /pt/, /pt/ -> 308 /pt) and the filesystem handle serves the flat files, which is the standard adapter-vercel output shape and cannot be validated locally without a real deploy. Root cause of the earlier confusion: the default crawl seed evaluates the optional [[lang=locale]] param as empty, so route-level entries exports were needed (commit 314b18c2) plus explicit prerender.entries seeds ('*' plus one /<locale> per locale, apps/web/vite.config.ts). Also fixed on the way: sitemap.xml GET handler now calls the renamed _sitemapXml builder (ReferenceError during prerender resolved, sitemap.xml prerendered OK on build8). Remaining prerender warnings (all pre-existing in content, matched against the live Next.js site): posts linking "yuricunha.com" as a root-relative path (12 404s across locales), /sitemap linked from /about without the .xml suffix, one missing blog image. Open: 4 svelte-check errors in virtual-mascot.svelte ("$state used before its declaration" and "Cannot use 'state' as a store"); isolated probe with the same runes and controller import passes, so the cause is inside that specific file, unconfirmed. Dev-server first-request stall ("transport invoke timed out", CPU ~124%, RSS ~3.86 GB) reproduced with the mascot unmounted; still unexplained, suspected memory/GC pressure, not confirmed.

- Stage 10 test repair (verified 2026-11-16, vitest): root cause of most "Cannot find package '@...'" failures was alias ORDER: the generic '@' -> ./src alias sat BEFORE the specific @/trpc/routers and @/lib/ai aliases (leftover from config merges), so every dynamic/static router import resolved to nonexistent src/trpc/* paths. Fixed by moving the generic '@' alias to the END of the resolve.alias array and by replacing regex aliases (/^@\/trpc\/routers\/(._)$/) with prefix string aliases ('@/trpc/routers'), which resolve reliably in this Vitest setup. Result: web suite went from 39 failed files / 148 failed tests to 26 failed files / 79 failed tests (223 passing). The generic '@' alias now points at ./src only as a last resort. Remaining failure categories (next batch): 22x headers() undefined (missing next/headers stub), ~27x AssertionError 500 vs 200/400/429 (runtime errors inside migrated handlers), 5x ['apiUsage'] observability assertion, 3x generateSEO renamed, 5x missing aliases for @/lib/blog/blog-service and @/lib/privacy/_, 2x Upstash mock hitting example.com.

- Stage 10 test repair round 2 (verified 2026-11-16): api route tests converted from the old Next.js handler contract ({ headers, json } object) to the SvelteKit signature ({ request: Request }): the three cron route tests (alerts, data-retention) and ai-chat-route now build real Request objects; ai-chat-route.test.ts passes 8/8. Added a hoisted vi.mock('@isyuricunha/env') factory (flags + dummy env values) to the cron and ai-chat tests so module loads that validate env variables pass locally. Root cause found for many 500s: vi.mock('@isyuricunha/db') and vi.mock('@isyuricunha/kv') factories NEVER run inside the trpc-server tree in this Vitest 5 setup (verified with a probe: [SIMPLE-FACTORY] not printed, direct import still executes real drizzle), while vi.mock for @isyuricunha/env and @/lib/logger DO apply; also added server.deps.inline regex for @isyuricunha/(env|db|kv|trpc-server). The db/kv mock gap is spilled into the MIGRATION because it blocks ~39 of the 66 remaining failures (31x 500s from real db/redis calls + 3x UpstashJSONParseError); workaround candidates for next round: mock a deeper module (e.g. drizzle-orm itself) or restructure the cron route tests to inject fakes as the package's own tests do. Remaining categories: 9x missing aliases for @/lib/blog/blog-service and @/lib/privacy/create-privacy-data-export (code moved to trpc-server), 3x 'is not a function' (generateSEO rename), 1x next/server import. Suite state after round 2: 37 files passed / 25 failed, 236 tests passed / 66 failed (was 223/79 after round 1, 154/148 at start of stage 10).

- Stage 10 test repair round 3 (verified 2026-11-16): removed the dead Next.js Metadata contract tests (generateSEO) by rewriting them against the current buildSeoHead helper (canonical, hreflang languages incl. x-default, no double locale prefix, no site-name templating); dropped the NextRequest imports in ai-content and og route tests (native Request works for the SvelteKit handlers); added the missing aliases for @/lib/admin-auth (and, in round 2, @/lib/blog and @/lib/privacy). Suite state: 42 files passed / 20 failed, 252 tests passed / 55 failed (307 total; was 244/58). Remaining failures are dominated by the documented db/kv mock gap: 33x 500-class AssertionErrors from real db/redis calls plus 3x UpstashJSONParseError; the rest are assorted assertion/behavior differences to triage one file at a time. Next candidates: mock the drizzle-orm/pg client layer or the Upstash Redis class instead of the workspace packages, which bypasses the vitest package-mock gap.

- Stage 10 round 5 (verified 2026-11-16): root cause of the mock gap confirmed by probes: vi.mock factories for @isyuricunha/db run when imported directly from the test file but NOT when the import comes from an inlined trpc-server module, even with the same resolved id; env and logger mocks keep working everywhere. Instead of fighting the vitest behavior, cron handlers now accept an optional deps argument (db/redis; defaults are the real singletons), and the route tests call the handlers directly with their fakes. Cron alerts: 10/10, data retention: 6/6. The same injection pattern is the chosen fix for the remaining API/trpc handlers (contact, newsletters, admin-*, ai-chat-feedback, create-privacy-data-export, and the telemetry/observability trpc tests).

- Stage 10 round 6 (verified 2026-11-16): contact route fixed (3/3): the test used the old Next handler contract; the resend package mock also does not apply inside the module tree (same vitest gap family), so contactPost gained an optional deps.resend and the test mocks @/lib/transactional-email (alias mocks DO apply), wiring the send mock through both the primary send and the confirmation best-effort with its onError callback. Cron alerts helper fix: get_metric_value now receives the active db instance as a parameter (its body used the injected activeDb outside the handler scope; 8/8 green). Also removed the dead 'apps/web/vitest.trpc.config.ts' entry from the ROOT vitest projects list, which started failing validation. Suite state: 53 files passed / 9 failed, 296 tests passed / 36 failed (332 total). Remaining nine files are all the same families: admin/feedback/trpc (db/redis through non-injectable module imports) and newsletters (resend path like contact).

- Stage 10 round 7 (verified 2026-11-16): the three newsletter route tests are green (confirm 5/5, unsubscribe 5/5, subscribe 4/4): newsletterConfirmGet and newsletterSubscribePost gained optional deps (kv redis/redisKeys for confirm, plus resend for subscribe; unsubscribe needed only the SvelteKit handler contract, its deps are all alias-mockable). The confirm and subscribe tests route their redis/resend fakes through the handler deps; the unsubscribe test only needed the Request-handler conversion. Suite: 310 passing, 22 failing of 332 (est.). Remaining six files: admin-posts and admin-translate show a NEW variant ("Cannot find package '@/lib/auth' / '@/lib/ratelimit'" while the same alias imports work in other files), ai-chat-feedback, create-privacy-data-export, and the trpc communication/observability suites.

- Stage 10 round 8 (verified 2026-11-16): admin-posts 5/5 and admin-translate 4/4 (both were the old handler contract; the earlier "Cannot find package @/lib/auth" was a diagnostic artifact from running vitest with the repo root as cwd, where the root @ alias shadows the project aliases); ai-chat-feedback 3/3 (injected db into aiFeedbackPost, removed its inert db package mock, wired the local fake); create-privacy-data-export 1/2 (the function already accepts options.database; env mock added; one assertion still fails: the findFirst call prints without the where key and the drizzle eq shape does not carry the expected { value } field in this Vitest 5 print; needs a focused look next round). Remaining: privacy where-assertion, trpc communication-campaigns and observability-writes.
