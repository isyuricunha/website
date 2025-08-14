-- Phase 2 Admin Improvements SQL Migration
-- Run this in your database to create the new tables and update existing ones

-- Update posts table for content management
ALTER TABLE post ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE post ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE post ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE post ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE post ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE post ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE post ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE post ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE post ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE post ADD COLUMN IF NOT EXISTS author_id TEXT;
ALTER TABLE post ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE post ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create post status enum
DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update posts table to use enum (drop default first, then change type, then add default back)
ALTER TABLE post ALTER COLUMN status DROP DEFAULT;
ALTER TABLE post ALTER COLUMN status TYPE post_status USING status::post_status;
ALTER TABLE post ALTER COLUMN status SET DEFAULT 'draft'::post_status;

-- Populate id column for existing rows (use slug as basis for id generation)
UPDATE post SET id = gen_random_uuid()::text WHERE id IS NULL;

-- Make id column NOT NULL now that all rows have values
ALTER TABLE post ALTER COLUMN id SET NOT NULL;

-- Add foreign key constraint for author
ALTER TABLE post ADD CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES "users"(id) ON DELETE CASCADE;

-- Handle primary key change carefully due to foreign key dependencies
-- First, drop the foreign key constraint from comment table
ALTER TABLE comment DROP CONSTRAINT IF EXISTS comment_post_id_post_slug_fk;

-- Now we can safely change the primary key
ALTER TABLE post DROP CONSTRAINT IF EXISTS post_pkey;
ALTER TABLE post ADD PRIMARY KEY (id);
ALTER TABLE post ADD CONSTRAINT unique_post_slug UNIQUE (slug);

-- Recreate the foreign key constraint (comments still reference slug, not id)
ALTER TABLE comment ADD CONSTRAINT comment_post_id_post_slug_fk 
    FOREIGN KEY (post_id) REFERENCES post(slug) ON DELETE CASCADE;

-- System Health Monitoring Tables
CREATE TYPE health_check_type AS ENUM ('database', 'email', 'api', 'storage', 'external_service');
CREATE TYPE health_check_status AS ENUM ('healthy', 'warning', 'critical', 'unknown');

CREATE TABLE IF NOT EXISTS system_health_logs (
    id TEXT PRIMARY KEY,
    check_type health_check_type NOT NULL,
    status health_check_status NOT NULL,
    response_time INTEGER,
    message TEXT,
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Error Monitoring Table
CREATE TABLE IF NOT EXISTS error_logs (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    stack TEXT,
    url TEXT,
    user_agent TEXT,
    user_id TEXT REFERENCES "users"(id),
    ip_address TEXT,
    metadata TEXT,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by TEXT REFERENCES "users"(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Site Configuration Table
CREATE TYPE site_config_type AS ENUM ('general', 'seo', 'social', 'email', 'analytics', 'security', 'features');

CREATE TABLE IF NOT EXISTS site_config (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    type site_config_type NOT NULL DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    updated_by TEXT NOT NULL REFERENCES "users"(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bulk Operations Table
CREATE TYPE bulk_operation_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

CREATE TABLE IF NOT EXISTS bulk_operations (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    status bulk_operation_status NOT NULL DEFAULT 'pending',
    total_items INTEGER NOT NULL,
    processed_items INTEGER NOT NULL DEFAULT 0,
    successful_items INTEGER NOT NULL DEFAULT 0,
    failed_items INTEGER NOT NULL DEFAULT 0,
    parameters TEXT,
    results TEXT,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by TEXT NOT NULL REFERENCES "users"(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_health_logs_created_at ON system_health_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_health_logs_status ON system_health_logs(status);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_site_config_type ON site_config(type);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_status ON bulk_operations(status);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_created_at ON bulk_operations(created_at);
CREATE INDEX IF NOT EXISTS idx_post_status ON post(status);
CREATE INDEX IF NOT EXISTS idx_post_author_id ON post(author_id);
CREATE INDEX IF NOT EXISTS idx_post_published_at ON post(published_at);

-- Insert some default site configuration
INSERT INTO site_config (id, key, value, type, description, is_public, updated_by) 
VALUES 
    (gen_random_uuid()::text, 'site_name', 'My Website', 'general', 'The name of the website', true, (SELECT id FROM "users" WHERE role = 'admin' LIMIT 1)),
    (gen_random_uuid()::text, 'site_description', 'A modern web application', 'seo', 'Default site description for SEO', true, (SELECT id FROM "users" WHERE role = 'admin' LIMIT 1)),
    (gen_random_uuid()::text, 'posts_per_page', '10', 'general', 'Number of posts to show per page', false, (SELECT id FROM "users" WHERE role = 'admin' LIMIT 1)),
    (gen_random_uuid()::text, 'enable_comments', 'true', 'features', 'Enable comments on blog posts', false, (SELECT id FROM "users" WHERE role = 'admin' LIMIT 1))
ON CONFLICT (key) DO NOTHING;

COMMIT;
