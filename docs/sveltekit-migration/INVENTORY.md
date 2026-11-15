# SvelteKit migration: feature inventory

Complete inventory of the current Next.js application, verified against the tree at
commit `ecfd3b9f`. This document is the migration source of truth for parity checks.

## Applications

- `apps/web`: yuricunha.com (Next.js 16.4.0, React 19.3.0)
- `apps/docs`: docs.yuricunha.com (Next.js)
- 12 shared packages under `packages/`

## Pages (apps/web)

39 page files across three route groups:

Main group (`[locale]/(main)`): home, about, blog list, blog post, projects list,
project detail, snippets list, snippet detail, snippet (alias), uses, now, music,
recap, contact, guestbook, notifications, settings, privacy, offline, sitemap,
`u/[handle]`.

Admin group (`[locale]/(admin)`): dashboard, system-health, notifications,
communication, content, monitoring, audit-logs, configuration, posts, new post,
users, email-marketing, bulk-operations, comments, announcements, data-management,
security.

Other: `[locale]/reset-password`, `[locale]/[...rest]` (renders a real 404 for
unmatched paths), og/[id] (dynamic OG image generation).

## API routes (22)

| Endpoint                      | Methods      | Purpose                               |
| ----------------------------- | ------------ | ------------------------------------- |
| `/api/auth/[...all]`          | ALL          | Better Auth handler                   |
| `/api/trpc/[trpc]`            | ALL          | tRPC fetch handler                    |
| `/api/health`                 | GET          | Readiness probe used by CI and Hermes |
| `/api/ai/chat`                | POST         | AI chat (Mistral)                     |
| `/api/ai/chat/feedback`       | POST         | Chat feedback capture                 |
| `/api/ai/chat/status`         | GET          | AI availability status                |
| `/api/ai/content`             | POST         | AI content generation                 |
| `/api/mascot/chat`            | POST         | Mascot chat integration               |
| `/api/mascot/latest-post`     | GET          | Mascot latest post feed               |
| `/api/contact`                | POST         | Contact form (Resend)                 |
| `/api/newsletter/subscribe`   | POST         | Double opt-in subscribe (Resend)      |
| `/api/newsletter/confirm`     | GET          | Opt-in confirmation                   |
| `/api/newsletter/unsubscribe` | GET          | Unsubscribe                           |
| `/api/account/data-export`    | GET          | Authenticated data export             |
| `/api/admin/posts`            | POST         | Admin post mutation                   |
| `/api/admin/translate`        | POST         | Dev-only translation generator        |
| `/api/cron/alerts`            | GET (secret) | Vercel cron, daily 03:00              |
| `/api/cron/data-retention`    | GET (secret) | Vercel cron, daily 03:30              |
| `/rss.xml` (locale + root)    | GET          | RSS feeds                             |
| `/llms.txt`                   | GET          | LLM crawler surface                   |
| `/robots.txt`                 | GET          | Robots                                |

## tRPC

22 routers, 468 procedures: admin (2), ai-settings (9), announcements (71),
bulk (30), comments (19), communication (54), content (33), data-management (20),
email-management (13), github (3), guestbook (7), lastfm (11), likes (6),
monitoring (50), rates (3), recap (9), resend-email (39), security (36),
system (22), users (25), views (3), wakatime (2).

Procedure kinds in use: publicProcedure, protectedProcedure, adminProcedure and
composites. Context reads Next.js request headers (client IP, session).

## Database (packages/db, Drizzle + node-postgres)

49 tables: auth (users, account, session, verification, password_reset_tokens,
audit_logs), comments (comment, rate), communication (email_templates,
email_campaigns, email_campaign_recipients, announcements,
announcement_interactions, notifications, notification_preferences,
email_subscriptions), data-management (database_backups, database_restores,
data_migrations, data_exports, data_imports, data_synchronization,
data_quality_checks, data_quality_check_results), guestbook, likes_session,
monitoring (performance_metrics, analytics_events, resource_usage, api_usage,
query_performance, error_tracking, custom_metrics, alerts, alert_instances,
user_activity), posts, security (two_factor_tokens, ip_access_control,
security_events, login_attempts, account_lockouts, api_rate_limits,
security_settings), system (system_health_logs, error_logs, site_config,
bulk_operations), ai_chat_feedback.

## Content

544 MDX/MD documents under `apps/web/src/content/` (blog, projects, snippet,
pages), each document translated into 7 locales (en, pt, es, ja, zh-CN, fr, de).
Compiled by `@content-collections/mdx` with the custom `@isyuricunha/mdx-plugins`
pipeline (Shiki warm theme, TOC extraction).

## i18n

`packages/i18n` (next-intl based): 7 message catalogs of ~2.8k lines each,
key-parity locked by a vitest suite. Locale routing uses `localePrefix:
'as-needed'` (en unprefixed). `packages/i18n/middleware` runs in
`apps/web/src/proxy.ts`, which also rewrites `/admin*` to
`/{defaultLocale}/admin*`.

## Feature flags (packages/env)

comment, auth, stats, lastfm, lastfmImport, analytics, guestbookNotification,
likeButton, turnstile. All default off; server env validation is conditional on
each flag.

## Security surface

- `proxy.ts`: CSP report-only header (unsafe-inline retained, unsafe-eval
  removed), admin rewrite, next-intl middleware.
- Layered abuse protection: platform-trusted client IP extraction, fail-closed
  Upstash rate limiting, server-side Turnstile verification, newsletter double
  opt-in.
- Better Auth with OAuth (Google, GitHub), email/password, anonymous users.
- tRPC context: request-scoped session and client IP.

## Scheduled jobs

Two Vercel crons (`vercel.json`): `/api/cron/alerts` (03:00 daily) and
`/api/cron/data-retention` (03:30 daily), authenticated by `CRON_SECRET`.

## Tests

- 61 unit test files (vitest: web-ui jsdom project + web-trpc node project).
- 6 Playwright e2e specs (theme, responsive localization, sitemap, rss, home,
  guestbook authenticated) plus a11y and scroll helpers.
- i18n key-parity suite.
- CI: lint, typecheck, knip, unit tests, Vercel preview.

## Integrations

PostgreSQL (Drizzle), Upstash Redis (rate limit + caching), Cloudflare Turnstile,
Cloudflare R2 (avatar/object storage), Resend (transactional email), Mistral AI
(chat + content), GitHub API (repo data), Last.fm, WakaTime, Umami analytics
(optional), Discord webhook (guestbook notification), Vercel (hosting + crons).

## Baseline measurements

Recorded in `BASELINE.md` alongside this file.
