ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "banned" boolean;--> statement-breakpoint
UPDATE "users" SET "banned" = false WHERE "banned" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "banned" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "banned" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ban_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ban_expires" timestamp;
