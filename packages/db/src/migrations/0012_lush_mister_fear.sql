-- P3.7 schema drift repair: account.issuer column + composite unique on
-- account(provider_id, account_id) + declarar user_email_unique no schema.
--
-- Idempotente (DO blocks): prod já tem user_email_unique desde a migration
-- 0000 e pode ter a coluna issuer (via push manual); bancos novos aplicam tudo.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'issuer'
  ) THEN
    ALTER TABLE "account" ADD COLUMN "issuer" text;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'account_provider_id_account_id_unique'
  ) THEN
    ALTER TABLE "account" ADD CONSTRAINT "account_provider_id_account_id_unique" UNIQUE("provider_id","account_id");
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_email_unique'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT "user_email_unique" UNIQUE("email");
  END IF;
END $$;