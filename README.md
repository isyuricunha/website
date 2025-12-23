# yuricunha.com

Source code for my personal website.

Production:

- **Website**: https://yuricunha.com

## Notice

This project contains a personal AI assistant feature that is my own creation and intellectual property.
Do not copy, reproduce, or implement similar AI assistant features without explicit permission.

## Table of contents

- [Project overview](#project-overview)
- [Repository layout](#repository-layout)
- [Tech stack](#tech-stack)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)
- [Contact](#contact)

## Project overview

This is the source code for my personal website.

The repository is organized as a monorepo (Turbo + pnpm) so that the main app and internal packages can evolve together.

## Repository layout

```
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
pnpm check
pnpm test:unit
pnpm build
```

If upgrades introduce runtime issues, prefer debugging in development mode (`pnpm dev:web`) to get non-minified React errors.

## Tech stack (versions)

Core tooling:

- Node.js: `>=22` (see `package.json#engines.node`)
- pnpm: `10.26.0` (see `package.json#packageManager`)
- TypeScript: `^5.9.3`
- Turbo: `^2.7.1`
- Vitest: `^4.0.16`
- ESLint: `^9.39.2`
- Prettier: `^3.7.4`

Web apps:

- Next.js: `16.1.1`
- React: `19.2.3`
- Zod: `4.2.1`
- tRPC: `11.8.1`
- TanStack React Query: `^5.90.12`
- TailwindCSS: `^4.1.18`

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

## Scripts

Common tasks:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:e2e
pnpm format:check
pnpm check:knip
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

- **Email**: me@yuricunha.com
- **GitHub**: https://github.com/isyuricunha
- **Website**: https://yuricunha.com
