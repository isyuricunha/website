# SvelteKit migration: Next.js baseline measurements

Environment: cloud-arm, Linux aarch64. Node v24.22.3, pnpm 12.3.4, TypeScript
6.0.3, Next.js 16.4.0 / React 19.3.0. Measured 2026-11-15 with the production
build (`CI=true pnpm --filter @isyuricunha/web run build`, `.env.local` with
placeholder values, env validation skipped per repository contract).

## Dependency footprint

- Workspace packages: 14 (2 apps + 12 packages)
- `node_modules/.pnpm` store entries: 1,420 packages
- `node_modules` size: 1.6 GB

## Production build (apps/web)

- next.config.ts evaluation: 31.4s
- Compile: ~32.5s
- Static generation: 847 pages in 22.3-23.0s (3 workers)
- Wall time: ~2 minutes per full build (warm cache)
- First build attempt aborted at the end by Next.js's own security-upgrade
  gate (known vulnerability notice for 16.4.0); the documented retry completed
  successfully. The migration removes Next.js entirely.

## Build output

- `apps/web/.next` total: 946 MB (server bundles + ISR cache + traces)
- Client JS in `.next/static`: 22 MB raw (pre-gzip) across chunks
- Largest client chunk: 7.2 MB (pre-gzip)
- Prerendered home page HTML: ~229 KB
- Served home page HTML (`/pt`): ~237 KB

## Production server

- `next start` readiness (`/api/health`): ~1s after start (prebuilt artifacts)
- next-server worker processes RSS: 74 MB + 73 MB + 145 MB (multi-process)
- A long-lived next-server process from an earlier QA session was observed at
  229 MB RSS (not part of this measurement; left untouched)

## Notes

- Cold install and cold build (empty caches) were not measured in this
  baseline; rerun with cleared pnpm store and `.next` before making claims
  about cold-build improvements.
- Dev-server startup, HMR latency and Lighthouse numbers: to be measured
  during stage 10 comparison (running both stacks side by side requires both
  apps complete; numbers recorded here will be duplicated there).
- Lighthouse/Core Web Vitals: not yet measured (requires both apps runnable
  side by side; will be captured in stage 10 with identical conditions).

## Post-migration comparison (measured 2026-11-16, same host)

| Metric                  | Next.js baseline                                         | SvelteKit now                 | Delta |
| ----------------------- | -------------------------------------------------------- | ----------------------------- | ----- |
| Production build (warm) | ~2 min wall                                              | 36.35s                        | ~-70% |
| Build output (web)      | .next 946 MB                                             | .vercel/output 359 MB         | -62%  |
| Client JS raw (web)     | 22 MB                                                    | 7.1 MB                        | -68%  |
| Largest client chunk    | 7.2 MB                                                   | 1.5 MB (immutable entry)      | -79%  |
| Prerendered home HTML   | 229-237 KB                                               | 120-124 KB                    | -47%  |
| pnpm store entries      | 1,420                                                    | 1,377                         | -43   |
| node_modules size       | 1.6 GB                                                   | 1.6 GB                        | same  |
| Test suite (web)        | N/A (vitest suite was at 154 passing at migration start) | 344 passing, 68 files, exit 0 | n/a   |
| Type check              | n/a (Next build type-checks)                             | svelte-check 0 errors         | n/a   |

The React runtime was removed from web production UI; `pnpm why react next`
in apps/web resolves react and next only through devDependencies (yutheme
dev previews, React Email templates, docs previews). Docs build exits 0
(SvelteKit + Vite).
