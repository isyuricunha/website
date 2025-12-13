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
