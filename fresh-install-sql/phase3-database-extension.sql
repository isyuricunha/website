-- ============================================================================
-- PHASE 3 DATABASE EXTENSION - Advanced Admin Features
-- ============================================================================
-- Run this AFTER the core unified schema
-- Contains all Phase 3 advanced admin features:
-- - Monitoring & Analytics
-- - Security Management  
-- - Communication Management
-- - Data Management
-- ============================================================================

-- ============================================================================
-- PHASE 3: MONITORING & ANALYTICS
-- ============================================================================

-- Performance Metrics
CREATE TABLE IF NOT EXISTS "performance_metrics" (
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
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "performance_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS "analytics_events" (
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
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Resource Usage
CREATE TABLE IF NOT EXISTS "resource_usage" (
    "id" text PRIMARY KEY NOT NULL,
    "resource_type" "resource_usage_type" NOT NULL,
    "value" real NOT NULL,
    "unit" text NOT NULL,
    "server_id" text,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- API Usage
CREATE TABLE IF NOT EXISTS "api_usage" (
    "id" text PRIMARY KEY NOT NULL,
    "endpoint" text NOT NULL,
    "method" text NOT NULL,
    "user_id" text,
    "response_time" integer,
    "status_code" integer,
    "request_size" integer,
    "response_size" integer,
    "user_agent" text,
    "ip_address" text,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "api_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Query Performance
CREATE TABLE IF NOT EXISTS "query_performance" (
    "id" text PRIMARY KEY NOT NULL,
    "query_hash" text NOT NULL,
    "query_text" text,
    "execution_time" real NOT NULL,
    "rows_affected" integer,
    "table" text,
    "operation" text,
    "user_id" text,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "query_performance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Error Tracking
CREATE TABLE IF NOT EXISTS "error_tracking" (
    "id" text PRIMARY KEY NOT NULL,
    "error_type" text NOT NULL,
    "message" text NOT NULL,
    "stack_trace" text,
    "user_id" text,
    "session_id" text,
    "url" text,
    "user_agent" text,
    "ip_address" text,
    "severity" "security_event_severity" DEFAULT 'medium' NOT NULL,
    "resolved" boolean DEFAULT false NOT NULL,
    "resolved_at" timestamp,
    "resolved_by" text,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "error_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action,
    CONSTRAINT "error_tracking_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Custom Metrics
CREATE TABLE IF NOT EXISTS "custom_metrics" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "value" real NOT NULL,
    "unit" text,
    "tags" text,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Alerts
CREATE TABLE IF NOT EXISTS "alerts" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "condition" text NOT NULL,
    "threshold" real,
    "severity" "security_event_severity" DEFAULT 'medium' NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "alerts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Alert Instances
CREATE TABLE IF NOT EXISTS "alert_instances" (
    "id" text PRIMARY KEY NOT NULL,
    "alert_id" text NOT NULL,
    "triggered_at" timestamp DEFAULT now() NOT NULL,
    "resolved_at" timestamp,
    "status" "alert_status" DEFAULT 'active' NOT NULL,
    "value" real,
    "message" text,
    "metadata" text,
    CONSTRAINT "alert_instances_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE cascade ON UPDATE no action
);

-- User Activity
CREATE TABLE IF NOT EXISTS "user_activity" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "activity_type" text NOT NULL,
    "description" text,
    "ip_address" text,
    "user_agent" text,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- ============================================================================
-- PHASE 3: SECURITY MANAGEMENT
-- ============================================================================

-- Two-Factor Authentication
CREATE TABLE IF NOT EXISTS "two_factor_tokens" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "secret" text NOT NULL,
    "backup_codes" text,
    "is_enabled" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "last_used_at" timestamp,
    CONSTRAINT "two_factor_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- IP Access Control
CREATE TABLE IF NOT EXISTS "ip_access_control" (
    "id" text PRIMARY KEY NOT NULL,
    "ip_address" text NOT NULL,
    "ip_range" text,
    "type" "ip_access_control_type" NOT NULL,
    "description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "ip_access_control_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Security Events
CREATE TABLE IF NOT EXISTS "security_events" (
    "id" text PRIMARY KEY NOT NULL,
    "event_type" "security_event_type" NOT NULL,
    "severity" "security_event_severity" DEFAULT 'medium' NOT NULL,
    "description" text NOT NULL,
    "user_id" text,
    "ip_address" text,
    "user_agent" text,
    "metadata" text,
    "resolved" boolean DEFAULT false NOT NULL,
    "resolved_at" timestamp,
    "resolved_by" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "security_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action,
    CONSTRAINT "security_events_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Login Attempts
CREATE TABLE IF NOT EXISTS "login_attempts" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text,
    "email" text,
    "ip_address" text,
    "user_agent" text,
    "success" boolean NOT NULL,
    "failure_reason" text,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "login_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Account Lockouts
CREATE TABLE IF NOT EXISTS "account_lockouts" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "reason" text,
    "locked_by" text,
    "unlocked_at" timestamp,
    "unlocked_by" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "account_lockouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "account_lockouts_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action,
    CONSTRAINT "account_lockouts_unlocked_by_users_id_fk" FOREIGN KEY ("unlocked_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- ============================================================================
-- PHASE 3: COMMUNICATION MANAGEMENT
-- ============================================================================

-- Email Templates
CREATE TABLE IF NOT EXISTS "email_templates" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL UNIQUE,
    "subject" text NOT NULL,
    "content" text NOT NULL,
    "variables" text,
    "created_by" text,
    "updated_by" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "email_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action,
    CONSTRAINT "email_templates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS "email_campaigns" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "template_id" text,
    "subject" text NOT NULL,
    "content" text NOT NULL,
    "recipient_count" integer DEFAULT 0,
    "sent_count" integer DEFAULT 0,
    "status" "campaign_status" DEFAULT 'draft',
    "scheduled_at" timestamp,
    "sent_at" timestamp,
    "created_by" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "email_campaigns_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "email_templates"("id") ON DELETE no action ON UPDATE no action,
    CONSTRAINT "email_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Announcements
CREATE TABLE IF NOT EXISTS "announcements" (
    "id" text PRIMARY KEY NOT NULL,
    "title" text NOT NULL,
    "content" text NOT NULL,
    "type" "notification_type" DEFAULT 'info',
    "active" boolean DEFAULT true NOT NULL,
    "created_by" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" "notification_type" DEFAULT 'info',
    "read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- ============================================================================
-- PHASE 3: DATA MANAGEMENT
-- ============================================================================

-- Database Backups
CREATE TABLE IF NOT EXISTS "database_backups" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "type" "backup_type" NOT NULL,
    "size_bytes" bigint,
    "status" "job_status" DEFAULT 'pending',
    "file_path" text,
    "created_by" text,
    "completed_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "database_backups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Data Exports
CREATE TABLE IF NOT EXISTS "data_exports" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "table_name" text NOT NULL,
    "format" "export_format" NOT NULL,
    "filters" text,
    "status" "job_status" DEFAULT 'pending',
    "file_path" text,
    "record_count" integer,
    "created_by" text,
    "completed_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "data_exports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Data Quality Checks
CREATE TABLE IF NOT EXISTS "data_quality_checks" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "table_name" text NOT NULL,
    "check_type" text NOT NULL,
    "rules" text,
    "status" "job_status" DEFAULT 'pending',
    "created_by" text,
    "completed_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "data_quality_checks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Data Quality Results
CREATE TABLE IF NOT EXISTS "data_quality_results" (
    "id" text PRIMARY KEY NOT NULL,
    "check_id" text NOT NULL,
    "passed" boolean NOT NULL,
    "issues_found" integer DEFAULT 0,
    "details" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "data_quality_results_check_id_data_quality_checks_id_fk" FOREIGN KEY ("check_id") REFERENCES "data_quality_checks"("id") ON DELETE cascade ON UPDATE no action
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Monitoring indexes
CREATE INDEX IF NOT EXISTS "idx_performance_metrics_created_at" ON "performance_metrics"("created_at");
CREATE INDEX IF NOT EXISTS "idx_performance_metrics_metric_name" ON "performance_metrics"("metric_name");
CREATE INDEX IF NOT EXISTS "idx_analytics_events_created_at" ON "analytics_events"("created_at");
CREATE INDEX IF NOT EXISTS "idx_analytics_events_event_type" ON "analytics_events"("event_type");
CREATE INDEX IF NOT EXISTS "idx_analytics_events_user_id" ON "analytics_events"("user_id");
CREATE INDEX IF NOT EXISTS "idx_resource_usage_created_at" ON "resource_usage"("created_at");
CREATE INDEX IF NOT EXISTS "idx_resource_usage_resource_type" ON "resource_usage"("resource_type");
CREATE INDEX IF NOT EXISTS "idx_api_usage_created_at" ON "api_usage"("created_at");
CREATE INDEX IF NOT EXISTS "idx_api_usage_endpoint" ON "api_usage"("endpoint");
CREATE INDEX IF NOT EXISTS "idx_api_usage_user_id" ON "api_usage"("user_id");
CREATE INDEX IF NOT EXISTS "idx_error_tracking_created_at" ON "error_tracking"("created_at");
CREATE INDEX IF NOT EXISTS "idx_error_tracking_resolved" ON "error_tracking"("resolved");

-- Security indexes
CREATE INDEX IF NOT EXISTS "idx_security_events_created_at" ON "security_events"("created_at");
CREATE INDEX IF NOT EXISTS "idx_security_events_event_type" ON "security_events"("event_type");
CREATE INDEX IF NOT EXISTS "idx_security_events_resolved" ON "security_events"("resolved");
CREATE INDEX IF NOT EXISTS "idx_login_attempts_created_at" ON "login_attempts"("created_at");
CREATE INDEX IF NOT EXISTS "idx_login_attempts_user_id" ON "login_attempts"("user_id");
CREATE INDEX IF NOT EXISTS "idx_login_attempts_ip_address" ON "login_attempts"("ip_address");

-- Communication indexes
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_read" ON "notifications"("read");
CREATE INDEX IF NOT EXISTS "idx_email_campaigns_status" ON "email_campaigns"("status");
CREATE INDEX IF NOT EXISTS "idx_announcements_active" ON "announcements"("active");

-- Data management indexes
CREATE INDEX IF NOT EXISTS "idx_database_backups_created_at" ON "database_backups"("created_at");
CREATE INDEX IF NOT EXISTS "idx_database_backups_status" ON "database_backups"("status");
CREATE INDEX IF NOT EXISTS "idx_data_exports_created_at" ON "data_exports"("created_at");
CREATE INDEX IF NOT EXISTS "idx_data_exports_status" ON "data_exports"("status");

-- ============================================================================
-- INSERT SAMPLE DATA FOR TESTING
-- ============================================================================

-- Sample performance metrics
INSERT INTO "performance_metrics" ("id", "metric_name", "value", "unit", "endpoint", "metadata") VALUES 
('perf_001', 'response_time', 150.5, 'ms', '/api/users', '{"server": "web-01"}'),
('perf_002', 'cpu_usage', 45.2, 'percent', null, '{"server": "web-01"}'),
('perf_003', 'memory_usage', 78.9, 'percent', null, '{"server": "web-01"}')
ON CONFLICT ("id") DO NOTHING;

-- Sample analytics events
INSERT INTO "analytics_events" ("id", "event_type", "session_id", "page", "properties") VALUES 
('event_001', 'page_view', 'session_001', '/admin', '{"user_agent": "Mozilla/5.0"}'),
('event_002', 'user_login', 'session_002', '/login', '{"method": "oauth"}'),
('event_003', 'api_call', 'session_003', '/api/stats', '{"endpoint": "/api/stats"}')
ON CONFLICT ("id") DO NOTHING;

-- Sample resource usage
INSERT INTO "resource_usage" ("id", "resource_type", "value", "unit") VALUES 
('resource_001', 'cpu', 45.2, 'percent'),
('resource_002', 'memory', 2048, 'mb'),
('resource_003', 'disk', 85.5, 'percent')
ON CONFLICT ("id") DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Phase 3 database extension completed successfully! All advanced admin features are now available.';
END
$$;
