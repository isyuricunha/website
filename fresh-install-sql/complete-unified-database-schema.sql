-- ============================================================================
-- COMPLETE UNIFIED DATABASE SCHEMA - ALL PHASES
-- ============================================================================
-- This file contains ALL database schemas currently in use:
-- - Core authentication and user management
-- - Blog posts and comments system  
-- - Guestbook functionality
-- - Likes and sessions tracking
-- - Phase 1-2 admin features (audit logs)
-- - Phase 3 advanced admin features (security, monitoring, communication, data management)
-- ============================================================================
-- Compatible with existing Drizzle schema structure using text-based IDs
-- Run this file once in your database management tool for a fresh setup
-- ============================================================================

-- ============================================================================
-- CREATE ENUMS FIRST
-- ============================================================================

-- Core enums
DO $$ BEGIN
    CREATE TYPE "role" AS ENUM('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "post_status" AS ENUM('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "audit_log_action" AS ENUM('user_create', 'user_update', 'user_delete', 'user_ban', 'user_unban', 'user_password_reset', 'comment_delete', 'comment_approve', 'comment_reject', 'admin_login', 'admin_logout', 'settings_update', 'bulk_operation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Phase 3 enums
DO $$ BEGIN
    CREATE TYPE "resource_usage_type" AS ENUM('cpu', 'memory', 'disk', 'network', 'database_connections', 'cache_hit_rate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ip_access_control_type" AS ENUM('whitelist', 'blacklist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "security_event_type" AS ENUM('login_attempt', 'login_success', 'login_failure', 'password_change', 'email_change', 'two_factor_enabled', 'two_factor_disabled', 'suspicious_activity', 'account_locked', 'account_unlocked', 'admin_action', 'data_export', 'permission_change');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "security_event_severity" AS ENUM('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "alert_status" AS ENUM('active', 'acknowledged', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "backup_type" AS ENUM('full', 'incremental', 'differential');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "export_format" AS ENUM('csv', 'json', 'xml', 'excel');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "job_status" AS ENUM('pending', 'running', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "campaign_status" AS ENUM('draft', 'sending', 'sent', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "notification_type" AS ENUM('info', 'warning', 'error', 'success');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CORE AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

-- Users table (core)
CREATE TABLE IF NOT EXISTS "users" (
    "id" text PRIMARY KEY NOT NULL,
    "username" text UNIQUE,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "email_verified" boolean NOT NULL,
    "image" text,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL,
    "isAnonymous" boolean DEFAULT false,
    "role" "role" DEFAULT 'user' NOT NULL
);

-- Accounts table (OAuth providers)
CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY NOT NULL,
    "account_id" text NOT NULL,
    "provider_id" text NOT NULL,
    "user_id" text NOT NULL,
    "access_token" text,
    "refresh_token" text,
    "id_token" text,
    "access_token_expires_at" timestamp,
    "refresh_token_expires_at" timestamp,
    "scope" text,
    "password" text,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL,
    CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY NOT NULL,
    "expires_at" timestamp NOT NULL,
    "token" text NOT NULL UNIQUE,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "user_id" text NOT NULL,
    CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- Verification table (email verification, etc.)
CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp,
    "updated_at" timestamp
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" text PRIMARY KEY NOT NULL,
    "token" text NOT NULL UNIQUE,
    "user_id" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp NOT NULL,
    "used" boolean DEFAULT false NOT NULL,
    CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- Audit logs (Phase 1-2 admin feature)
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" text PRIMARY KEY NOT NULL,
    "admin_user_id" text NOT NULL,
    "action" "audit_log_action" NOT NULL,
    "target_type" text,
    "target_id" text,
    "details" text,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "audit_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- ============================================================================
-- BLOG & CONTENT MANAGEMENT
-- ============================================================================

-- Posts table
CREATE TABLE IF NOT EXISTS "post" (
    "id" text PRIMARY KEY NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "title" text NOT NULL,
    "description" text,
    "content" text,
    "excerpt" text,
    "cover_image" text,
    "tags" text,
    "status" "post_status" DEFAULT 'draft' NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "author_id" text NOT NULL,
    "published_at" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "likes" integer DEFAULT 0 NOT NULL,
    "views" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "post_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- Comments table
CREATE TABLE IF NOT EXISTS "comment" (
    "id" text PRIMARY KEY NOT NULL,
    "body" text NOT NULL,
    "user_id" text NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "post_id" text NOT NULL,
    "parent_id" text,
    "is_deleted" boolean DEFAULT false NOT NULL,
    CONSTRAINT "comment_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action,
    CONSTRAINT "comment_post_id_post_slug_fk" FOREIGN KEY ("post_id") REFERENCES "post"("slug") ON DELETE no action ON UPDATE no action
);

-- Comment ratings
CREATE TABLE IF NOT EXISTS "rate" (
    "user_id" text NOT NULL,
    "comment_id" text NOT NULL,
    "like" boolean NOT NULL,
    CONSTRAINT "rate_user_id_comment_id_pk" PRIMARY KEY("user_id","comment_id"),
    CONSTRAINT "rate_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action,
    CONSTRAINT "rate_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE cascade ON UPDATE no action
);

-- ============================================================================
-- GUESTBOOK & SOCIAL FEATURES
-- ============================================================================

-- Guestbook table
CREATE TABLE IF NOT EXISTS "guestbook" (
    "id" text PRIMARY KEY NOT NULL,
    "body" text NOT NULL,
    "user_id" text NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "guestbook_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Likes sessions (for anonymous likes tracking)
CREATE TABLE IF NOT EXISTS "likes_session" (
    "id" text PRIMARY KEY NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "likes" integer DEFAULT 0 NOT NULL
);

-- Continue with Phase 3 tables...
-- (Due to token limit, providing first part. Run this and I'll provide Phase 3 tables separately)

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Core database schema created successfully! Run Phase 3 extension next.';
END
$$;
