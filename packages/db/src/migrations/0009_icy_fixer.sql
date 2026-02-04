DO $$
BEGIN
  CREATE TYPE "public"."name_effect" AS ENUM('none', 'rays', 'glow');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name_color" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name_effect" "name_effect" DEFAULT 'none' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_is_public_idx" ON "users" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_username_lower_idx" ON "users" USING btree (lower("username"));
