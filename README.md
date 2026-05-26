# yuricunha.com

Source code for my personal website.

Production:

- **Website**: <https://yuricunha.com>

## Notice

Please use your own AI/mascot name, model and provider credentials when adapting this project.

## Table of contents

- [Project overview](#project-overview)
- [Features](#features)
- [Repository layout](#repository-layout)
- [Tech stack](#tech-stack)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Localization and translation](#localization-and-translation)
- [SEO and indexing](#seo-and-indexing)
- [Scripts](#scripts)
- [Validation](#validation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)
- [Contact](#contact)

## Project overview

This is the source code for my personal website, docs app and shared package workspace.

The repository is organized as a monorepo (Turbo + pnpm) so that the main app and internal packages can evolve together.

## Features

- Localized portfolio, blog, projects, snippets, about, music, contact and sitemap pages.
- Authenticated admin surfaces for content and operational workflows.
- Cursor-inspired warm visual system shared between the website and docs app.
- MDX content collections for blog posts, project pages, snippets and docs.
- SEO surfaces for search engines and LLM crawlers: `sitemap.xml`, `robots.txt`, `rss.xml`, locale RSS feeds and `llms.txt`.
- Dev-only OpenAI-compatible translation generator for adding new locales locally.
- Shared UI package with Tailwind v4 preset, typography, code styling and reusable primitives.

## Repository layout

```text
apps/
  web/        main website
  docs/       documentation site
packages/
  db/         database access (Drizzle)
  env/        env validation
  emails/     email templates
  i18n/       internationalization
  ui/         shared UI components
  utils/      shared utilities
  ...
```

## Tech stack

- **Runtime**: Node.js (see `.nvmrc`)
- **Package manager**: pnpm (see `packageManager` in `package.json`)
- **Monorepo**: Turborepo
- **Web**: Next.js App Router, React, TypeScript
- **API**: tRPC
- **Database**: PostgreSQL, Drizzle ORM
- **Email**: React Email, Resend
- **i18n**: next-intl (localized routes under `apps/web/src/app/[locale]`)
- **Content**: content-collections + MDX
- **Styling**: Tailwind CSS v4 + shared Cursor-inspired UI preset
- **Testing**: Vitest (unit), Playwright (e2e)

## Local development

### Prerequisites

- Node.js (aligned with `.nvmrc`)
- pnpm
- PostgreSQL (or a compatible managed provider)

### Setup

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Create your local env file

   ```bash
   cp .env.example .env.local
   ```

3. Initialize the database (optional, if you need DB features locally)

   ```bash
   pnpm db:push
   ```

4. Start the dev servers

   ```bash
   pnpm dev
   ```

## Maintenance

This repository is actively maintained and dependencies across all apps and packages are updated regularly.

Recommended upgrade workflow:

```bash
pnpm -r up --latest
pnpm install
pnpm build:mdx
pnpm check
pnpm test:unit
pnpm check:knip
pnpm --filter @isyuricunha/web build
pnpm --filter @isyuricunha/docs build
```

If upgrades introduce runtime issues, prefer debugging in development mode (`pnpm dev:web`) to get non-minified React errors.

## Tech stack (versions)

Core tooling:

- Node.js: `>=22` (see `package.json#engines.node`)
- pnpm: `10.33.2` (see `package.json#packageManager`)
- TypeScript: `^6.0.3`
- Turbo: `^2.9.14`
- Vitest: `^4.1.7`
- ESLint: `^10.4.0`
- Prettier: `^3.8.3`

Web apps:

- Next.js: `16.2.6`
- React: `19.2.6`
- Zod: `4.4.3`
- tRPC: `11.17.0`
- TanStack React Query: `^5.100.14`
- TailwindCSS: `^4.3.0`

To list all installed versions in the workspace:

```bash
pnpm -r list --depth 0
```

## Environment variables

Environment variables are documented in `.env.example`.

The canonical schema is defined in `packages/env/src/index.ts`.

For production URLs (used in emails, canonical links, etc.), set:

```env
NEXT_PUBLIC_WEBSITE_URL="https://yuricunha.com"
```

## Localization and translation

Supported locales are defined in `packages/i18n/src/config.ts`. Message files live in `packages/i18n/src/messages`.

The local translation generator can create a new locale from an OpenAI-compatible endpoint. It is designed for developer machines and refuses production/Vercel environments.

Required local variables:

```env
OPENAI_COMPATIBLE_BASE_URL="https://provider.example/v1"
OPENAI_COMPATIBLE_API_KEY="..."
OPENAI_COMPATIBLE_MODEL="model-name"
```

Plan a translation without writing files:

```bash
pnpm translate:site -- --target es --dry-run
```

Use smaller batches for slower or timeout-prone models:

```bash
pnpm translate:site -- --target es --batch-size small
pnpm translate:site -- --target es --batch-size medium
pnpm translate:site -- --target es --batch-size large
```

`jp` resolves to `ja`; `cn` and `zh` resolve to `zh-CN`.

## SEO and indexing

The site exposes:

```text
/sitemap.xml
/robots.txt
/rss.xml
/llms.txt
/<locale>/rss.xml
```

Admin, API and password-reset surfaces are marked as non-indexable. Public content pages provide canonical metadata, locale alternates, Open Graph/Twitter data and structured data where applicable.

## Scripts

Common tasks:

```bash
pnpm dev
pnpm dev:web
pnpm dev:docs
pnpm build
pnpm build:mdx
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:e2e
pnpm format:check
pnpm check:knip
pnpm translate:site -- --target es --dry-run
```

Database tasks:

```bash
pnpm db:check
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:seed
pnpm db:studio
```

## Validation

Run this sequence before committing:

```bash
pnpm build:mdx
pnpm check
pnpm test:unit
```

For full verification:

```bash
pnpm check:knip
pnpm --filter @isyuricunha/web build
pnpm --filter @isyuricunha/docs build
```

## Deployment

The project is designed to be deployed on Vercel.

Notes:

- Ensure all required environment variables are set.
- The monorepo uses Turbo pipelines; the default root `pnpm build` is the expected build command.

## Troubleshooting

Common browser console messages:

- `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT` typically indicates a browser extension (ad blocker/privacy tooling) is blocking a request.
- Minified React errors in production builds are best debugged by reproducing the issue in development mode.

## Contributing

This is primarily a personal project.

If you want to contribute:

- Open an issue describing the change.
- Keep changes small and focused.
- Prefer tests for non-trivial logic.

## License

See `license.md`.

## Credits

This project began as an adaptation inspired by Nelson Lai's website and has evolved significantly since then.

Thank you to Nelson for the original inspiration.

## Contact

- **Email**: <me@yuricunha.com>
- **GitHub**: <https://github.com/isyuricunha>
- **Website**: <https://yuricunha.com>
