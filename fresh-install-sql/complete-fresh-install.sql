-- =====================================================
-- COMPLETE FRESH INSTALL SQL SCRIPT
-- =====================================================
-- 
-- This script creates the complete database schema for the
-- admin system including:
-- - Core authentication and user management
-- - Blog and content management
-- - Advanced security features (2FA, IP controls)
-- - Communication tools (email campaigns, announcements)
-- - Comprehensive monitoring and analytics
-- - Data management and backup systems
-- 
-- Run this script on a fresh PostgreSQL database to set up
-- the complete system with all advanced features.
-- =====================================================

-- =====================================================
-- CREATE ENUMS
-- =====================================================

-- User roles
CREATE TYPE role AS ENUM ('user', 'admin');

-- Post status
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- Audit log actions
CREATE TYPE audit_log_action AS ENUM (
  'user_created', 'user_updated', 'user_deleted', 'user_banned', 'user_unbanned',
  'post_created', 'post_updated', 'post_deleted', 'post_published',
  'comment_created', 'comment_updated', 'comment_deleted',
  'system_config_updated', 'backup_created', 'data_exported',
  'security_event_created', 'alert_created', 'bulk_operation_executed'
);

-- Bulk operation status
CREATE TYPE bulk_operation_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- System health
CREATE TYPE health_check_type AS ENUM ('database', 'api', 'storage', 'email', 'cache', 'external_service');
CREATE TYPE health_status AS ENUM ('healthy', 'degraded', 'unhealthy', 'unknown');

-- Site configuration
CREATE TYPE site_config_type AS ENUM ('general', 'security', 'email', 'storage', 'api', 'ui');

-- Security
CREATE TYPE security_event_type AS ENUM (
  'login_attempt', 'failed_login', 'suspicious_activity', 'brute_force',
  'account_lockout', 'password_change', 'email_change', 'two_factor_enabled',
  'two_factor_disabled', 'ip_blocked', 'unauthorized_access'
);
CREATE TYPE security_event_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ip_access_type AS ENUM ('whitelist', 'blacklist');

-- Monitoring and alerts
CREATE TYPE alert_type AS ENUM ('threshold', 'anomaly', 'health_check', 'security', 'custom');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'error', 'critical');
CREATE TYPE resource_type AS ENUM ('cpu', 'memory', 'disk', 'network', 'database');

-- Data management
CREATE TYPE backup_type AS ENUM ('full', 'incremental', 'differential');
CREATE TYPE backup_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE restore_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE export_format AS ENUM ('csv', 'json', 'xml', 'excel');
CREATE TYPE export_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE import_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE migration_status AS ENUM ('pending', 'running', 'completed', 'failed', 'rolled_back');
CREATE TYPE sync_direction AS ENUM ('pull', 'push', 'bidirectional');
CREATE TYPE sync_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE data_quality_check_type AS ENUM ('completeness', 'accuracy', 'consistency', 'validity', 'uniqueness');

-- Communication
CREATE TYPE email_template_type AS ENUM ('welcome', 'password_reset', 'notification', 'marketing', 'system');
CREATE TYPE email_campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled');
CREATE TYPE announcement_type AS ENUM ('info', 'warning', 'success', 'error', 'maintenance');
CREATE TYPE notification_type AS ENUM ('system', 'security', 'marketing', 'reminder', 'alert');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'in_app');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  role role NOT NULL DEFAULT 'user',
  username TEXT UNIQUE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Account table (OAuth providers)
CREATE TABLE account (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at TIMESTAMP,
  refresh_token_expires_at TIMESTAMP,
  scope TEXT,
  password TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Session table
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Verification table
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE post (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  tags TEXT,
  status post_status DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  author_id TEXT REFERENCES users(id),
  likes INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comment (
  id TEXT PRIMARY KEY,
  body TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES post(slug) ON DELETE CASCADE,
  parent_id TEXT REFERENCES comment(id),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comment ratings
CREATE TABLE rate (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id TEXT NOT NULL REFERENCES comment(id) ON DELETE CASCADE,
  like BOOLEAN NOT NULL,
  PRIMARY KEY (user_id, comment_id)
);

-- Guestbook
CREATE TABLE guestbook (
  id TEXT PRIMARY KEY,
  body TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Likes session
CREATE TABLE likes_session (
  id TEXT PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL REFERENCES users(id),
  action audit_log_action NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PHASE 3 ADVANCED FEATURES TABLES
-- =====================================================

-- Security Features
CREATE TABLE two_factor_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);

CREATE TABLE ip_access_control (
  id TEXT PRIMARY KEY,
  ip_address TEXT NOT NULL,
  ip_range TEXT,
  type ip_access_type NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_events (
  id TEXT PRIMARY KEY,
  event_type security_event_type NOT NULL,
  severity security_event_severity NOT NULL DEFAULT 'low',
  user_id TEXT REFERENCES users(id),
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  details TEXT,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by TEXT REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_attempts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  two_factor_required BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_success BOOLEAN,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account_lockouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  locked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  locked_until TIMESTAMP,
  locked_by TEXT REFERENCES users(id),
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMP,
  unlocked_by TEXT REFERENCES users(id)
);

-- Monitoring and Analytics
CREATE TABLE performance_metrics (
  id TEXT PRIMARY KEY,
  metric_name TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  endpoint TEXT,
  user_id TEXT REFERENCES users(id),
  session_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  metadata TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_name TEXT,
  user_id TEXT REFERENCES users(id),
  session_id TEXT NOT NULL,
  page TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  properties TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resource_usage (
  id TEXT PRIMARY KEY,
  type resource_type NOT NULL,
  value REAL NOT NULL,
  max_value REAL,
  unit TEXT NOT NULL,
  hostname TEXT,
  service TEXT,
  metadata TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_usage (
  id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  request_size INTEGER,
  response_size INTEGER,
  user_id TEXT REFERENCES users(id),
  ip_address TEXT,
  user_agent TEXT,
  api_key TEXT,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE query_performance (
  id TEXT PRIMARY KEY,
  query_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  execution_time REAL NOT NULL,
  rows_affected INTEGER,
  query_hash TEXT,
  endpoint TEXT,
  user_id TEXT REFERENCES users(id),
  slow BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE error_tracking (
  id TEXT PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_name TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  filename TEXT,
  line_number INTEGER,
  column_number INTEGER,
  user_id TEXT REFERENCES users(id),
  session_id TEXT,
  url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  breadcrumbs TEXT,
  tags TEXT,
  fingerprint TEXT,
  count INTEGER NOT NULL DEFAULT 1,
  first_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by TEXT REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE custom_metrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  value REAL NOT NULL,
  unit TEXT,
  category TEXT,
  dimensions TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type alert_type NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'warning',
  conditions TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notification_channels TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alert_instances (
  id TEXT PRIMARY KEY,
  alert_id TEXT NOT NULL REFERENCES alerts(id),
  triggered_value REAL,
  message TEXT NOT NULL,
  metadata TEXT,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by TEXT REFERENCES users(id),
  resolved_at TIMESTAMP,
  notifications_sent TEXT,
  triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  duration INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Communication Features
CREATE TABLE email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type email_template_type NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_id TEXT REFERENCES email_templates(id),
  html_content TEXT,
  text_content TEXT,
  status email_campaign_status NOT NULL DEFAULT 'draft',
  target_audience TEXT,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  bounced_count INTEGER NOT NULL DEFAULT 0,
  unsubscribed_count INTEGER NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type announcement_type NOT NULL DEFAULT 'info',
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_dismissible BOOLEAN NOT NULL DEFAULT TRUE,
  target_audience TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  data TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data Management
CREATE TABLE database_backups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type backup_type NOT NULL DEFAULT 'full',
  status backup_status NOT NULL DEFAULT 'pending',
  file_path TEXT,
  file_size INTEGER,
  compression_type TEXT,
  checksum TEXT,
  tables TEXT,
  excluded_tables TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration INTEGER,
  error_message TEXT,
  metadata TEXT,
  is_automatic BOOLEAN NOT NULL DEFAULT FALSE,
  retention_days INTEGER DEFAULT 30,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_exports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  format export_format NOT NULL DEFAULT 'csv',
  status export_status NOT NULL DEFAULT 'pending',
  query TEXT,
  tables TEXT,
  filters TEXT,
  file_path TEXT,
  file_size INTEGER,
  record_count INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration INTEGER,
  error_message TEXT,
  download_url TEXT,
  expires_at TIMESTAMP,
  metadata TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_quality_checks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type data_quality_check_type NOT NULL,
  table_name TEXT NOT NULL,
  column_name TEXT,
  rules TEXT NOT NULL,
  threshold INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  schedule TEXT,
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Core indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_account_user_id ON account(user_id);
CREATE INDEX idx_session_user_id ON session(user_id);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_post_slug ON post(slug);
CREATE INDEX idx_post_status ON post(status);
CREATE INDEX idx_post_author_id ON post(author_id);
CREATE INDEX idx_comment_post_id ON comment(post_id);
CREATE INDEX idx_comment_user_id ON comment(user_id);

-- Security indexes
CREATE INDEX idx_two_factor_tokens_user_id ON two_factor_tokens(user_id);
CREATE INDEX idx_ip_access_control_ip_address ON ip_access_control(ip_address);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at);

-- Monitoring indexes
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at);
CREATE INDEX idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_resource_usage_created_at ON resource_usage(created_at);
CREATE INDEX idx_resource_usage_type ON resource_usage(type);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint);
CREATE INDEX idx_error_tracking_created_at ON error_tracking(created_at);
CREATE INDEX idx_error_tracking_error_type ON error_tracking(error_type);
CREATE INDEX idx_error_tracking_resolved ON error_tracking(resolved);
CREATE INDEX idx_error_tracking_fingerprint ON error_tracking(fingerprint);
CREATE INDEX idx_error_tracking_first_seen ON error_tracking(first_seen);

-- Communication indexes
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_created_by ON email_campaigns(created_by);
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Data management indexes
CREATE INDEX idx_database_backups_status ON database_backups(status);
CREATE INDEX idx_database_backups_created_at ON database_backups(created_at);
CREATE INDEX idx_data_exports_status ON data_exports(status);
CREATE INDEX idx_data_exports_created_by ON data_exports(created_by);

-- =====================================================
-- INSERT SAMPLE DATA FOR TESTING
-- =====================================================

-- Create admin user
INSERT INTO users (id, name, email, email_verified, role, created_at, updated_at) VALUES
('admin_user_001', 'System Administrator', 'admin@example.com', true, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sample error tracking data
INSERT INTO error_tracking (id, error_type, error_name, message, fingerprint, created_at, first_seen, last_seen) VALUES
('err_001', 'javascript', 'TypeError', 'Cannot read property of undefined', 'js_undefined_prop', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('err_002', 'server', 'DatabaseError', 'Connection timeout', 'db_timeout', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('err_003', 'network', 'NetworkError', 'Failed to fetch', 'network_fetch_fail', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sample performance metrics
INSERT INTO performance_metrics (id, metric_name, value, unit, created_at) VALUES
('perf_001', 'response_time', 150.5, 'ms', CURRENT_TIMESTAMP),
('perf_002', 'throughput', 1250.0, 'req/min', CURRENT_TIMESTAMP),
('perf_003', 'cpu_usage', 45.2, 'percent', CURRENT_TIMESTAMP);

-- Sample API usage data
INSERT INTO api_usage (id, endpoint, method, status_code, response_time, created_at) VALUES
('api_001', '/api/users', 'GET', 200, 120, CURRENT_TIMESTAMP),
('api_002', '/api/posts', 'POST', 201, 250, CURRENT_TIMESTAMP),
('api_003', '/api/auth/login', 'POST', 200, 180, CURRENT_TIMESTAMP);

-- =====================================================
-- INSTALLATION COMPLETE
-- =====================================================

-- This completes the fresh installation of the Phase 3 Advanced Admin System.
-- All tables, indexes, and sample data have been created.
-- The system is now ready for use with all enterprise-grade features enabled.

SELECT 'Phase 3 Advanced Admin System - Fresh Installation Complete!' as status;
