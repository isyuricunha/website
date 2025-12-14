CREATE TYPE "public"."ai_chat_feedback_rating" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TABLE "ai_chat_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"message_id" text NOT NULL,
	"rating" "ai_chat_feedback_rating" NOT NULL,
	"comment" text,
	"page_path" text,
	"provider" text,
	"model" text,
	"locale" text,
	"user_id" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_chat_feedback" ADD CONSTRAINT "ai_chat_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_chat_feedback_request_id" ON "ai_chat_feedback" USING btree ("request_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_chat_feedback_message_id" ON "ai_chat_feedback" USING btree ("message_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_chat_feedback_created_at" ON "ai_chat_feedback" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_chat_feedback_user_id" ON "ai_chat_feedback" USING btree ("user_id" text_ops);