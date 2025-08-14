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

-- Update posts table to use enum
ALTER TABLE post ALTER COLUMN status TYPE post_status USING status::post_status;

-- Add foreign key constraint for author
ALTER TABLE post ADD CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- Make slug unique instead of primary key (if needed)
ALTER TABLE post DROP CONSTRAINT IF EXISTS post_pkey;
ALTER TABLE post ADD PRIMARY KEY (id);
ALTER TABLE post ADD CONSTRAINT unique_post_slug UNIQUE (slug);

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
    user_id TEXT REFERENCES "user"(id),
    ip_address TEXT,
    metadata TEXT,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by TEXT REFERENCES "user"(id),
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
    updated_by TEXT NOT NULL REFERENCES "user"(id),
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
    created_by TEXT NOT NULL REFERENCES "user"(id),
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
    (gen_random_uuid()::text, 'site_name', 'My Website', 'general', 'The name of the website', true, (SELECT id FROM "user" WHERE role = 'admin' LIMIT 1)),
    (gen_random_uuid()::text, 'site_description', 'A modern web application', 'seo', 'Default site description for SEO', true, (SELECT id FROM "user" WHERE role = 'admin' LIMIT 1)),
    (gen_random_uuid()::text, 'posts_per_page', '10', 'general', 'Number of posts to show per page', false, (SELECT id FROM "user" WHERE role = 'admin' LIMIT 1)),
    (gen_random_uuid()::text, 'enable_comments', 'true', 'features', 'Enable comments on blog posts', false, (SELECT id FROM "user" WHERE role = 'admin' LIMIT 1))
ON CONFLICT (key) DO NOTHING;

COMMIT;
