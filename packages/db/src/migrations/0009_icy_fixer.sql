CREATE TYPE "public"."name_effect" AS ENUM('none', 'rays', 'glow');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name_color" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name_effect" "name_effect" DEFAULT 'none' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_is_public_idx" ON "users" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "users_username_lower_idx" ON "users" USING btree (lower("username"));