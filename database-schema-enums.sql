-- =====================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS
-- Baseado no schema atual do Supabase
-- =====================================================
-- PARTE 1: ENUMS
-- =====================================================

-- Drop existing types if they exist (for re-execution)
DROP TYPE IF EXISTS role CASCADE;
DROP TYPE IF EXISTS post_status CASCADE;
DROP TYPE IF EXISTS audit_log_action CASCADE;
DROP TYPE IF EXISTS bulk_operation_status CASCADE;
DROP TYPE IF EXISTS health_check_type CASCADE;
DROP TYPE IF EXISTS health_status CASCADE;
DROP TYPE IF EXISTS site_config_type CASCADE;
DROP TYPE IF EXISTS security_event_type CASCADE;
DROP TYPE IF EXISTS security_event_severity CASCADE;
DROP TYPE IF EXISTS ip_access_type CASCADE;
DROP TYPE IF EXISTS alert_type CASCADE;
DROP TYPE IF EXISTS alert_severity CASCADE;
DROP TYPE IF EXISTS resource_type CASCADE;
DROP TYPE IF EXISTS backup_type CASCADE;
DROP TYPE IF EXISTS backup_status CASCADE;
DROP TYPE IF EXISTS restore_status CASCADE;
DROP TYPE IF EXISTS export_format CASCADE;
DROP TYPE IF EXISTS export_status CASCADE;
DROP TYPE IF EXISTS import_status CASCADE;
DROP TYPE IF EXISTS migration_status CASCADE;
DROP TYPE IF EXISTS sync_direction CASCADE;
DROP TYPE IF EXISTS sync_status CASCADE;
DROP TYPE IF EXISTS data_quality_check_type CASCADE;
DROP TYPE IF EXISTS email_template_type CASCADE;
DROP TYPE IF EXISTS email_campaign_status CASCADE;
DROP TYPE IF EXISTS announcement_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS notification_channel CASCADE;

-- User roles
CREATE TYPE role AS ENUM ('user', 'admin');

-- Post status
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- Audit actions
CREATE TYPE audit_log_action AS ENUM (
  'user_created', 'user_updated', 'user_deleted', 'user_banned', 'user_unbanned',
  'post_created', 'post_updated', 'post_deleted', 'post_published',
  'comment_created', 'comment_updated', 'comment_deleted',
  'system_config_updated', 'backup_created', 'data_exported',
  'security_event_created', 'alert_created', 'bulk_operation_executed'
);

-- Bulk operation status
CREATE TYPE bulk_operation_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- Health check type
CREATE TYPE health_check_type AS ENUM ('database', 'api', 'storage', 'email', 'cache', 'external_service');
CREATE TYPE health_status AS ENUM ('healthy', 'degraded', 'unhealthy', 'unknown');

-- Site configuration type
CREATE TYPE site_config_type AS ENUM ('general', 'security', 'email', 'storage', 'api', 'ui');

-- Security events
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
