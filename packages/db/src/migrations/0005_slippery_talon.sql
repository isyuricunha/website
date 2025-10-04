CREATE TYPE "public"."alert_severity" AS ENUM('info', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('threshold', 'anomaly', 'error_rate', 'performance', 'security', 'business');--> statement-breakpoint
CREATE TYPE "public"."announcement_type" AS ENUM('info', 'warning', 'success', 'error', 'maintenance', 'feature', 'update');--> statement-breakpoint
CREATE TYPE "public"."audit_log_action" AS ENUM('user_create', 'user_update', 'user_delete', 'user_ban', 'user_unban', 'user_password_reset', 'comment_delete', 'comment_approve', 'comment_reject', 'admin_login', 'admin_logout', 'settings_update', 'bulk_operation');--> statement-breakpoint
CREATE TYPE "public"."backup_status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."backup_type" AS ENUM('full', 'incremental', 'differential');--> statement-breakpoint
CREATE TYPE "public"."bulk_operation_status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."email_campaign_status" AS ENUM('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."email_template_type" AS ENUM('welcome', 'password_reset', 'email_verification', 'newsletter', 'announcement', 'notification', 'marketing', 'transactional');--> statement-breakpoint
CREATE TYPE "public"."export_format" AS ENUM('csv', 'json', 'xml', 'sql', 'excel');--> statement-breakpoint
CREATE TYPE "public"."export_status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."health_check_status" AS ENUM('healthy', 'warning', 'critical', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."health_check_type" AS ENUM('database', 'email', 'api', 'storage', 'external_service');--> statement-breakpoint
CREATE TYPE "public"."import_status" AS ENUM('pending', 'validating', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ip_access_control_type" AS ENUM('whitelist', 'blacklist');--> statement-breakpoint
CREATE TYPE "public"."migration_status" AS ENUM('pending', 'running', 'completed', 'failed', 'rolled_back');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('email', 'push', 'sms', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('system', 'user_action', 'content', 'security', 'marketing', 'reminder');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."quality_check_type" AS ENUM('completeness', 'uniqueness', 'validity', 'consistency', 'accuracy', 'timeliness');--> statement-breakpoint
CREATE TYPE "public"."resource_usage_type" AS ENUM('cpu', 'memory', 'disk', 'network', 'database_connections', 'cache_hit_rate');--> statement-breakpoint
CREATE TYPE "public"."restore_status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."security_event_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."security_event_type" AS ENUM('login_attempt', 'login_success', 'login_failure', 'password_change', 'email_change', 'two_factor_enabled', 'two_factor_disabled', 'suspicious_activity', 'account_locked', 'account_unlocked', 'admin_action', 'data_export', 'permission_change');--> statement-breakpoint
CREATE TYPE "public"."site_config_type" AS ENUM('general', 'seo', 'social', 'email', 'analytics', 'security', 'features');--> statement-breakpoint
CREATE TYPE "public"."sync_direction" AS ENUM('push', 'pull', 'bidirectional');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "account_lockouts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"reason" text NOT NULL,
	"locked_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"locked_until" timestamp,
	"locked_by" text,
	"unlocked" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp,
	"unlocked_by" text
);
--> statement-breakpoint
CREATE TABLE "alert_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"alert_id" text NOT NULL,
	"triggered_value" real,
	"message" text NOT NULL,
	"metadata" text,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp,
	"notifications_sent" text,
	"triggered_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "alert_type" NOT NULL,
	"severity" "alert_severity" DEFAULT 'warning' NOT NULL,
	"conditions" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notification_channels" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"event_name" text,
	"user_id" text,
	"session_id" text NOT NULL,
	"page" text,
	"referrer" text,
	"user_agent" text,
	"ip_address" text,
	"country" text,
	"city" text,
	"device" text,
	"browser" text,
	"os" text,
	"properties" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcement_interactions" (
	"id" text PRIMARY KEY NOT NULL,
	"announcement_id" text NOT NULL,
	"user_id" text NOT NULL,
	"viewed" boolean DEFAULT false NOT NULL,
	"dismissed" boolean DEFAULT false NOT NULL,
	"viewed_at" timestamp,
	"dismissed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" "announcement_type" DEFAULT 'info' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_dismissible" boolean DEFAULT true NOT NULL,
	"target_audience" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"identifier_type" text NOT NULL,
	"endpoint" text,
	"request_count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"window_end" timestamp NOT NULL,
	"blocked" boolean DEFAULT false NOT NULL,
	"blocked_until" timestamp
);
--> statement-breakpoint
CREATE TABLE "api_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"status_code" integer NOT NULL,
	"response_time" integer NOT NULL,
	"request_size" integer,
	"response_size" integer,
	"user_id" text,
	"ip_address" text,
	"user_agent" text,
	"api_key" text,
	"error_message" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_user_id" text NOT NULL,
	"action" "audit_log_action" NOT NULL,
	"target_type" text,
	"target_id" text,
	"details" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bulk_operations" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"status" "bulk_operation_status" DEFAULT 'pending' NOT NULL,
	"total_items" integer NOT NULL,
	"processed_items" integer DEFAULT 0 NOT NULL,
	"successful_items" integer DEFAULT 0 NOT NULL,
	"failed_items" integer DEFAULT 0 NOT NULL,
	"parameters" text,
	"results" text,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"value" real NOT NULL,
	"unit" text,
	"category" text,
	"dimensions" text,
	"created_by" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_exports" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"format" "export_format" DEFAULT 'csv' NOT NULL,
	"status" "export_status" DEFAULT 'pending' NOT NULL,
	"query" text,
	"tables" text,
	"filters" text,
	"file_path" text,
	"file_size" integer,
	"record_count" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"error_message" text,
	"download_url" text,
	"expires_at" timestamp,
	"metadata" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_imports" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"format" "export_format" DEFAULT 'csv' NOT NULL,
	"status" "import_status" DEFAULT 'pending' NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer,
	"target_table" text NOT NULL,
	"mapping" text,
	"validation_rules" text,
	"duplicate_handling" text DEFAULT 'skip' NOT NULL,
	"total_records" integer,
	"processed_records" integer DEFAULT 0 NOT NULL,
	"successful_records" integer DEFAULT 0 NOT NULL,
	"failed_records" integer DEFAULT 0 NOT NULL,
	"validation_errors" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"error_message" text,
	"metadata" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_migrations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"version" text NOT NULL,
	"status" "migration_status" DEFAULT 'pending' NOT NULL,
	"migration_script" text,
	"rollback_script" text,
	"checksum" text,
	"dependencies" text,
	"affected_tables" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"error_message" text,
	"rollback_reason" text,
	"metadata" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_quality_check_results" (
	"id" text PRIMARY KEY NOT NULL,
	"check_id" text NOT NULL,
	"total_records" integer NOT NULL,
	"passed_records" integer NOT NULL,
	"failed_records" integer NOT NULL,
	"success_rate" integer NOT NULL,
	"details" text,
	"issues" text,
	"run_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_quality_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "quality_check_type" NOT NULL,
	"table_name" text NOT NULL,
	"column_name" text,
	"rules" text NOT NULL,
	"threshold" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"schedule" text,
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_synchronization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"source_type" text NOT NULL,
	"source_config" text NOT NULL,
	"target_type" text NOT NULL,
	"target_config" text NOT NULL,
	"direction" "sync_direction" DEFAULT 'pull' NOT NULL,
	"status" "sync_status" DEFAULT 'pending' NOT NULL,
	"schedule" text,
	"mapping" text,
	"filters" text,
	"last_sync_at" timestamp,
	"next_sync_at" timestamp,
	"synced_records" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "database_backups" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "backup_type" DEFAULT 'full' NOT NULL,
	"status" "backup_status" DEFAULT 'pending' NOT NULL,
	"file_path" text,
	"file_size" integer,
	"compression_type" text,
	"checksum" text,
	"tables" text,
	"excluded_tables" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"error_message" text,
	"metadata" text,
	"is_automatic" boolean DEFAULT false NOT NULL,
	"retention_days" integer DEFAULT 30,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "database_restores" (
	"id" text PRIMARY KEY NOT NULL,
	"backup_id" text NOT NULL,
	"status" "restore_status" DEFAULT 'pending' NOT NULL,
	"target_database" text,
	"restore_point" timestamp,
	"tables" text,
	"data_only" boolean DEFAULT false NOT NULL,
	"schema_only" boolean DEFAULT false NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"error_message" text,
	"metadata" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_campaign_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"unsubscribed_at" timestamp,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"template_id" text,
	"html_content" text,
	"text_content" text,
	"status" "email_campaign_status" DEFAULT 'draft' NOT NULL,
	"target_audience" text,
	"total_recipients" integer DEFAULT 0 NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"delivered_count" integer DEFAULT 0 NOT NULL,
	"opened_count" integer DEFAULT 0 NOT NULL,
	"clicked_count" integer DEFAULT 0 NOT NULL,
	"bounced_count" integer DEFAULT 0 NOT NULL,
	"unsubscribed_count" integer DEFAULT 0 NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"user_id" text,
	"subscription_types" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"unsubscribe_token" text NOT NULL,
	"subscribed_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"unsubscribed_at" timestamp,
	CONSTRAINT "email_subscriptions_email_key" UNIQUE("email"),
	CONSTRAINT "email_subscriptions_unsubscribe_token_key" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "email_template_type" NOT NULL,
	"subject" text NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text,
	"variables" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "error_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"level" text NOT NULL,
	"message" text NOT NULL,
	"stack" text,
	"url" text,
	"user_agent" text,
	"user_id" text,
	"ip_address" text,
	"metadata" text,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "error_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"error_type" text NOT NULL,
	"error_name" text NOT NULL,
	"message" text NOT NULL,
	"stack" text,
	"filename" text,
	"line_number" integer,
	"column_number" integer,
	"user_id" text,
	"session_id" text,
	"url" text,
	"user_agent" text,
	"ip_address" text,
	"breadcrumbs" text,
	"tags" text,
	"fingerprint" text,
	"count" integer DEFAULT 1 NOT NULL,
	"first_seen" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_seen" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ip_access_control" (
	"id" text PRIMARY KEY NOT NULL,
	"ip_address" text NOT NULL,
	"ip_range" text,
	"type" "ip_access_control_type" NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"success" boolean NOT NULL,
	"failure_reason" text,
	"two_factor_required" boolean DEFAULT false NOT NULL,
	"two_factor_success" boolean,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" DEFAULT 'system' NOT NULL,
	"data" text,
	"read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"action_url" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"metric_name" text NOT NULL,
	"value" real NOT NULL,
	"unit" text NOT NULL,
	"endpoint" text,
	"user_id" text,
	"session_id" text,
	"user_agent" text,
	"ip_address" text,
	"metadata" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "query_performance" (
	"id" text PRIMARY KEY NOT NULL,
	"query_type" text NOT NULL,
	"table_name" text NOT NULL,
	"execution_time" real NOT NULL,
	"rows_affected" integer,
	"query_hash" text,
	"endpoint" text,
	"user_id" text,
	"slow" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "resource_usage_type" NOT NULL,
	"value" real NOT NULL,
	"max_value" real,
	"unit" text NOT NULL,
	"hostname" text,
	"service" text,
	"metadata" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" "security_event_type" NOT NULL,
	"severity" "security_event_severity" DEFAULT 'low' NOT NULL,
	"user_id" text,
	"ip_address" text,
	"user_agent" text,
	"location" text,
	"details" text,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "security_settings_key_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"type" "site_config_type" DEFAULT 'general' NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "site_config_key_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "system_health_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"check_type" "health_check_type" NOT NULL,
	"status" "health_check_status" NOT NULL,
	"response_time" integer,
	"message" text,
	"details" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"resource" text,
	"details" text,
	"ip_address" text,
	"user_agent" text,
	"session_id" text,
	"duration" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"isAnonymous" boolean DEFAULT false,
	"username" text,
	"bio" text,
	"is_public" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "comment" DROP CONSTRAINT "comment_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "comment" DROP CONSTRAINT "comment_post_id_post_slug_fk";
--> statement-breakpoint
ALTER TABLE "rate" DROP CONSTRAINT "rate_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "guestbook" DROP CONSTRAINT "guestbook_user_id_user_id_fk";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'post'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "post" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "status" "post_status" DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "author_id" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "account_lockouts" ADD CONSTRAINT "account_lockouts_locked_by_fkey" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_lockouts" ADD CONSTRAINT "account_lockouts_unlocked_by_fkey" FOREIGN KEY ("unlocked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_lockouts" ADD CONSTRAINT "account_lockouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_instances" ADD CONSTRAINT "alert_instances_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_instances" ADD CONSTRAINT "alert_instances_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_interactions" ADD CONSTRAINT "announcement_interactions_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_interactions" ADD CONSTRAINT "announcement_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_operations" ADD CONSTRAINT "bulk_operations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_metrics" ADD CONSTRAINT "custom_metrics_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_exports" ADD CONSTRAINT "data_exports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_imports" ADD CONSTRAINT "data_imports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_migrations" ADD CONSTRAINT "data_migrations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_quality_check_results" ADD CONSTRAINT "data_quality_check_results_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "public"."data_quality_checks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_quality_checks" ADD CONSTRAINT "data_quality_checks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_synchronization" ADD CONSTRAINT "data_synchronization_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "database_backups" ADD CONSTRAINT "database_backups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "database_restores" ADD CONSTRAINT "database_restores_backup_id_fkey" FOREIGN KEY ("backup_id") REFERENCES "public"."database_backups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "database_restores" ADD CONSTRAINT "database_restores_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaign_recipients" ADD CONSTRAINT "email_campaign_recipients_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaign_recipients" ADD CONSTRAINT "email_campaign_recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_subscriptions" ADD CONSTRAINT "email_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_tracking" ADD CONSTRAINT "error_tracking_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_tracking" ADD CONSTRAINT "error_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_access_control" ADD CONSTRAINT "ip_access_control_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "query_performance" ADD CONSTRAINT "query_performance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_settings" ADD CONSTRAINT "security_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_config" ADD CONSTRAINT "site_config_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_tokens" ADD CONSTRAINT "two_factor_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_events_created_at" ON "analytics_events" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_analytics_events_user_id" ON "analytics_events" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_api_usage_created_at" ON "api_usage" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_api_usage_endpoint" ON "api_usage" USING btree ("endpoint" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_admin_user_id" ON "audit_logs" USING btree ("admin_user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_target" ON "audit_logs" USING btree ("target_type" text_ops,"target_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_bulk_operations_created_at" ON "bulk_operations" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_bulk_operations_status" ON "bulk_operations" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_data_exports_created_at" ON "data_exports" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_database_backups_created_at" ON "database_backups" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_email_campaigns_status" ON "email_campaigns" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_error_logs_created_at" ON "error_logs" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_error_logs_level" ON "error_logs" USING btree ("level" text_ops);--> statement-breakpoint
CREATE INDEX "idx_error_logs_resolved" ON "error_logs" USING btree ("resolved" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_error_tracking_fingerprint" ON "error_tracking" USING btree ("fingerprint" text_ops);--> statement-breakpoint
CREATE INDEX "idx_login_attempts_created_at" ON "login_attempts" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_login_attempts_email" ON "login_attempts" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_login_attempts_ip_address" ON "login_attempts" USING btree ("ip_address" text_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" USING btree ("read" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" USING btree ("expires_at" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_token_unique" ON "password_reset_tokens" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_performance_metrics_created_at" ON "performance_metrics" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_security_events_created_at" ON "security_events" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_security_events_severity" ON "security_events" USING btree ("severity" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_site_config_type" ON "site_config" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_system_health_logs_created_at" ON "system_health_logs" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_system_health_logs_status" ON "system_health_logs" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_two_factor_tokens_user_id" ON "two_factor_tokens" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_user_activity_created_at" ON "user_activity" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_user_activity_user_id" ON "user_activity" USING btree ("user_id" text_ops);--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_post_id_post_slug_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate" ADD CONSTRAINT "rate_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guestbook" ADD CONSTRAINT "guestbook_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "fk_post_author" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_post_author_id" ON "post" USING btree ("author_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_post_published_at" ON "post" USING btree ("published_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_post_status" ON "post" USING btree ("status" enum_ops);--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "unique_post_slug" UNIQUE("slug");