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
- https://vercel.com/docs/deployments/troubleshoot-a-build
