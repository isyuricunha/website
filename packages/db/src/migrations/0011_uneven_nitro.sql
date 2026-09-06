ALTER TABLE "ai_chat_feedback" DROP CONSTRAINT "ai_chat_feedback_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "comment" DROP CONSTRAINT "comment_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "rate" DROP CONSTRAINT "rate_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "email_campaign_recipients" DROP CONSTRAINT "email_campaign_recipients_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "email_subscriptions" DROP CONSTRAINT "email_subscriptions_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "guestbook" DROP CONSTRAINT "guestbook_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "analytics_events" DROP CONSTRAINT "analytics_events_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "api_usage" DROP CONSTRAINT "api_usage_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "error_tracking" DROP CONSTRAINT "error_tracking_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "performance_metrics" DROP CONSTRAINT "performance_metrics_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "query_performance" DROP CONSTRAINT "query_performance_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "security_events" DROP CONSTRAINT "security_events_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "error_logs" DROP CONSTRAINT "error_logs_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "ai_chat_feedback" ADD CONSTRAINT "ai_chat_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate" ADD CONSTRAINT "rate_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaign_recipients" ADD CONSTRAINT "email_campaign_recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_subscriptions" ADD CONSTRAINT "email_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guestbook" ADD CONSTRAINT "guestbook_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_tracking" ADD CONSTRAINT "error_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "query_performance" ADD CONSTRAINT "query_performance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;