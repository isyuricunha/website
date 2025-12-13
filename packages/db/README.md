# Database Management

This package (`@isyuricunha/db`) is the **Single Source of Truth** for the application's database schema.

## Schema Management

We use [Drizzle ORM](https://orm.drizzle.team/) for schema definition and migrations.

- **Schema Definitions**: Located in `src/schema/`. All tables, enums, and relations are defined here in TypeScript.
- **Migrations**: Located in `src/migrations/`. These are automatically generated SQL files based on changes to the schema.

### DO NOT Manually Create SQL Files

Do not create loose `.sql` files or manually execute SQL against the database to change the schema. Always modify the TypeScript schema in `src/schema/` and generate a migration.

## Common Commands

### 1. Make Schema Changes

Modify the files in `src/schema/`.

### 2. Generate Migration

After modifying the schema, generate a new migration file:

```bash
pnpm db:generate
```

### 3. Apply Migration

Apply the changes to your database:

```bash
pnpm db:migrate
```

### 4. Push Schema (Prototyping)

If you are effectively prototyping and don't care about migration history (use with caution in production):

```bash
pnpm db:push
```

## Troubleshooting

### Schema Drift

If the database state is inconsistent with the schema, you may need to use `drizzle-kit introspect` or manually resolve the differences. However, always aim to bring the database back in sync with the definition in `src/schema/`.
