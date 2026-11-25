# Vercel runtime efficiency

Baseline production commit: ecfd3b9fc3d9d508785b0c1fe25d4483b5df5982.
This optimization branch is deliberately independent of the SvelteKit migration.

## Changes

| Area                 | Before                                                        | After                                                                                      |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Public projects      | Per-request tRPC context, session lookup, and GitHub API call | Page can prerender; shared GitHub fetch with a 3,600-second revalidation interval          |
| Blog cards           | Two tRPC procedures per visible card                          | One bounded bulk stats procedure per rendered card list                                    |
| tRPC context         | Better Auth session lookup for anonymous requests             | Auth lookup only when a session-token cookie is present; protected guards remain unchanged |
| RSS, robots and llms | Uncached GET route handlers                                   | Static route handlers rendered at build time                                               |
| Mascot latest post   | Per-request directory listing and MDX frontmatter parsing     | Compiled content collection, CDN caching (600 seconds)                                     |
| Admin monitoring     | Six 30-second polls and 60-second snapshots                   | Six 120-second polls and 300-second snapshots, skipping hidden tabs                        |

## Security and functional constraints

- Do not cache personalized responses globally. Guestbook, account, announcements targeted to user roles, and administration remain request-aware.
- Better Auth cookies are still validated by Better Auth; cookie-name checking only avoids unnecessary anonymous lookups.
- Individual views.get and likes.get procedures and mutations remain. The new postStats.getBatch endpoint returns only aggregate counts, not per-visitor likes.
- POST, admin, and cron endpoints are not forced to static rendering.
- Public GitHub failures return an empty list to avoid breaking prerendering; an upstream outage can cause a temporary empty state until cache refresh.
- No DNS or firewall changes are required. Production deployments must wait for Preview checks.

## Verification

From the repository root:

1. pnpm install --frozen-lockfile
2. pnpm build:packages
3. pnpm --filter @isyuricunha/web run build:mdx
4. pnpm --filter @isyuricunha/web exec tsc --noEmit --project tsconfig.json
5. pnpm exec vitest run
6. pnpm --filter @isyuricunha/web run lint
7. pnpm --filter @isyuricunha/web run build

For Preview check default and translated pages, projects, blog pagination and counters, Guestbook (anonymous and signed in), login/session, admin access, RSS, robots, mascot, and cron route authorization without executing jobs.

To evaluate costs, compare CPU per route, function invocations, ISR Read Units, Fast Origin Transfer, and firewall actions for matching time windows. The full 30-day CPU-by-route history is not available on Hobby; historical attribution remains uncertain.

## References

- https://nextjs.org/docs/app/guides/caching-without-cache-components
- https://nextjs.org/docs/app/getting-started/route-handlers
- https://better-auth.com/docs/concepts/cookies
- https://trpc.io/docs/client/react/useUtils
- https://vercel.com/docs/deployments/environments

## Turborepo Remote Cache

The Vercel build log showed that `@isyuricunha/web:build` repeatedly failed
to upload its large Next.js artifact to Vercel Remote Cache (HTTP 400 at
`/api/v8/artifacts/<task-hash>`). Local `apps/web/.next` exceeded 900 MiB,
including Next.js's build cache; the files outside `.next/cache` were still
around 668 MiB. The HTTP status does not, by itself, prove a specific size
limit or quota failure.

The root `turbo.json` therefore overrides only
`@isyuricunha/web#build` with `cache: false`, explicitly preserving
`dependsOn: ["^build", "build:mdx"]`. Turborepo will always build the web
application and will not upload or restore its huge output artifact. Other
package builds and `@isyuricunha/web#build:mdx` remain cacheable.

**Do not remove `.next/server` or other essential outputs from a cached build.**
A partial Next.js restore can cause missing-manifest or missing-route deployment
failures. This targeted override avoids that risk. Vercel's own framework
build cache (including `.next/cache`) is separate from Turborepo Remote
Cache and remains in use.

Validate with the repository's pinned Turborepo version:

```sh
pnpm exec turbo run build --filter=@isyuricunha/web --dry=json
```

Confirm that the resolved task `@isyuricunha/web#build` is not cacheable,
while dependency package builds and `@isyuricunha/web#build:mdx` retain
caching and the dependency edges remain intact. In Vercel build logs, the
Next.js web task should no longer attempt a remote artifact upload. Check
that the build still reaches READY and produces the correct deployment output.

References:

- https://turborepo.com/docs/reference/configuration#cache
- https://vercel.com/docs/monorepos/turborepo
- https://vercel.com/docs/monorepos/remote-caching
- https://vercel.com/docs/deployments/troubleshoot-a-build\n

## Invalid-URL traffic and lightweight 404s

The November 20–21 twelve-hour Bot Protection experiment recorded 933 function
invocations on the catch-all route \`/[locale]/[...rest]\`. A retained
112-minute sample of request logs exposed 73 catch-all HTTP 404 responses;
56 resembled security scans for credentials, PHP/WordPress paths, or Vite
development endpoints. All 73 had a cache MISS. The sample does not
establish the cause of every invocation in the full twelve-hour period.

The catch-all continues to call \`notFound()\` and retain the existing localized
404 design. Recommended posts, snippets and projects are now sorted only
once per locale per server instance (rather than for every missing URL).
The observed legacy \`/feed.xml\` URL redirects permanently to \`/rss.xml\`.

A narrowly scoped project-level Vercel WAF custom rule is managed separately
from the repository for known security-scan paths, including sensitive dotfiles,
WordPress directories, \`.php\` scripts, and Vite development endpoints. It
must **not** block all 404 routes, all crawlers, \`/admin\`, or all unsupported
locale paths. The existing Bot Protection managed rule remains in Challenge.
Before any firewall publication, inspect the draft diff and verify that it
only adds the intended rule. Keep an audit record with the exact rule ID and
test blocked scanner paths alongside allowed public paths.

Do not broadly redirect unsupported locales to a different language.
Only redirect old links when their canonical destination is confirmed.
A missing URL should still return 404 and a \`noindex\` robots tag.

The earlier Preview returned HTTP 404 for the root /sw.js file even though
it is tracked under apps/web/public. The i18n Proxy matched this service-worker
path and rewrote it as a localized route. The matcher now explicitly excludes
this script, leaving its content unchanged. This is covered by the installed
Next.js 16 version-compatible unstable_doesMiddlewareMatch test helper and
a live Preview HTTP check. Locale routing and /admin remain matched.

### Regression checks

- \`/feed.xml\` redirects permanently to \`/rss.xml\`.
- Valid localized blog/project URLs render as before.
- Invalid routes return HTTP 404, not soft-404 HTTP 200.
- The localized 404 displays the same recommendation cards.
- WAF returns a deny response for sensitive scan paths without reaching the
  Next.js function; \`/projects\`, \`/blog\`, \`/robots.txt\` and \`/rss.xml\`
  remain reachable.
- Compare catch-all CPU and invocation counts only over equivalent windows.

Official references:

- https://nextjs.org/docs/app/api-reference/file-conventions/not-found
- https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
- https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules
- https://vercel.com/docs/vercel-firewall/vercel-waf/rule-configuration
- https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing

## Build-time content Open Graph images (2026-11-23)

Posts and snippets now use a finite set of localized, typed, content-versioned
Open Graph paths under `/og/content/[locale]/[kind]/[key]`. Next.js
`generateStaticParams` and `dynamicParams = false` enumerate all valid cards
at build time. The previous ImageResponse JSX is shared without visual changes.
The hash includes normalized card fields and an explicit renderer revision;
bump the revision when changing image rendering or fallback translations.
The legacy `/og/[id]` handler redirects known content to its canonical card
and unknown content to the generic static site card. Arbitrary query text is
ignored, and unknown canonical keys cannot trigger image rendering. A changed
content hash produces a new URL; older canonical hash URLs are not retained
across builds. Existing legacy URLs remain compatible.

Validation on the isolated ARM worktree based on f3beb75:

- 327 prerendered routes and 327 valid 1200x630 PNG response bodies (16,821,778 bytes).
- Reference image matches the previous renderer byte-for-byte.
- 16 repeated reference image requests, after warmup: 0.74s versus 0.13s local
  Next.js process CPU; wall time 0.533s versus 0.077s. These are single local
  benchmark runs, not Vercel billing or a production traffic experiment.
- Legacy redirect, invalid canonical key, tampered query, Portuguese metadata,
  RSS, service worker, projects and localized 404 were exercised over HTTP.
- A candidate setting dynamicParams=false on the catch-all was rejected
  because it served the framework's generic 404 instead of the localized UI.
  The existing catch-all source remains unchanged.

Preview must confirm Vercel cache behavior and production-like configuration
before promotion. After publication compare CPU, invocations, ISR read units
and transfer using comparable traffic windows.

Official references:

- https://nextjs.org/docs/app/api-reference/file-conventions/route
- https://nextjs.org/docs/app/api-reference/functions/generate-static-params
- https://nextjs.org/docs/app/api-reference/functions/image-response
- https://nextjs.org/docs/app/api-reference/file-conventions/not-found
- https://vercel.com/docs/caching/cdn-cache
- https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing

## Localized static 404 responses

The dynamic locale catch-all remains the correctness fallback. For GET/HEAD
document requests, the existing next-intl proxy can identify missing first
segments from a conservative build-time inventory of App Router route families
and public assets. It rewrites only definitely absent paths to one of seven
pre-rendered locale-specific /404 pages with HTTP status 404. The original URL
is retained; locale redirects, real routes, protected assets, unknown slugs
inside valid route families, and React Server Component navigations continue
through their existing routing. The reserved /404 endpoint also returns 404.

The error boundary and static route share the same translated component,
metadata, navigation, search and recommendations. Breadcrumbs initially use
the build-time path and switch to the actual URL after hydration, avoiding
React hydration mismatches. The route inventory is generated by next.config
at build/start time; unsupported top-level dynamic routes or parallel and
intercepting slots disable the fast path conservatively. If the route tree
changes in development, restart the dev server so the inventory is regenerated.

References: [NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-response),
[Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy),
[next-intl composition](https://next-intl.dev/docs/routing/middleware#example-additional-rewrites),
[Next.js static rendering](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config),
and [usePathname with rewrites](https://nextjs.org/docs/app/api-reference/functions/use-pathname).

Local benchmark: 180 requests per version,
three warmed runs on the same ARM host; Next.js process CPU 5.71 s
to 1.36 s (76.18% lower).
This is not a measurement of Vercel billing or the complete catch-all
workload. Static HTML is larger than the old streamed error response;
the tradeoff is pre-rendered content and lower server computation.
Validate on Preview for real 404 status, localized HTML, cache hits,
browser hydration, navigation and unchanged valid routes before production.
