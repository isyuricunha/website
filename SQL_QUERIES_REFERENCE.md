# 📊 SQL Queries Reference

Complete documentation of all SQL queries used in the project.

## 📁 Existing SQL Files

### 1. **Migration Files** (`packages/db/src/migrations/`)
Migrations managed by Drizzle ORM that define the database schema.

### 2. **Utility SQL Scripts**

#### `fix-error-tracking-column.sql`
**Purpose:** Fixes `error_tracking` table by adding missing `created_at` column.

```sql
ALTER TABLE error_tracking 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE error_tracking 
SET created_at = first_seen 
WHERE created_at IS NULL;
```

**When to use:** When there's a missing column error in the monitoring router.

---

#### `sample-announcements.sql`
**Purpose:** Inserts sample announcements for testing the announcements system.

```sql
INSERT INTO announcements (
  id, title, content, type, priority, 
  is_dismissible, is_active, target_audience, 
  start_date, end_date, created_by, created_at, updated_at
) VALUES
  -- High priority announcement
  ('sample-001', 'Welcome to Our New Website!', 
   'We''ve redesigned our website...', 'info', 2, 
   true, true, NULL, NOW(), NULL, 
   (SELECT id FROM users WHERE role = 'admin' LIMIT 1), 
   NOW(), NOW()),
   
  -- Urgent announcement
  ('sample-002', 'Scheduled Maintenance Tonight', 
   'Our servers will undergo maintenance...', 'warning', 4, 
   true, true, NULL, NOW(), NOW() + INTERVAL '7 days', 
   (SELECT id FROM users WHERE role = 'admin' LIMIT 1), 
   NOW(), NOW());
```

**Announcement types:**
- `info` - General information
- `warning` - Important warning
- `success` - Success/new feature
- `error` - Critical error
- `maintenance` - Maintenance

**Priorities:** 1 (low) to 5 (critical)

---

### 3. **Complete Fresh Install** (`fresh-install-sql/complete-fresh-install.sql`)

Complete installation script with all system tables (659 lines).

#### **Created ENUMs**

```sql
-- User roles
CREATE TYPE role AS ENUM ('user', 'admin');

-- Post status
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- Audit actions
CREATE TYPE audit_log_action AS ENUM (
  'user_created', 'user_updated', 'user_deleted', 
  'user_banned', 'user_unbanned',
  'post_created', 'post_updated', 'post_deleted', 'post_published',
  'comment_created', 'comment_updated', 'comment_deleted',
  'system_config_updated', 'backup_created', 'data_exported',
  'security_event_created', 'alert_created', 'bulk_operation_executed'
);

-- Security
CREATE TYPE security_event_type AS ENUM (
  'login_attempt', 'failed_login', 'suspicious_activity', 
  'brute_force', 'account_lockout', 'password_change', 
  'email_change', 'two_factor_enabled', 'two_factor_disabled', 
  'ip_blocked', 'unauthorized_access'
);

CREATE TYPE security_event_severity AS ENUM ('low', 'medium', 'high', 'critical');
```

#### **Core Tables**

```sql
-- Users
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

-- Sessions
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

-- Posts
CREATE TABLE post (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  content TEXT,
  status post_status DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  author_id TEXT REFERENCES users(id),
  likes INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
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
```

#### **Security Tables**

```sql
-- 2FA Tokens
CREATE TABLE two_factor_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);

-- IP Access Control
CREATE TABLE ip_access_control (
  id TEXT PRIMARY KEY,
  ip_address TEXT NOT NULL,
  ip_range TEXT,
  type ip_access_type NOT NULL, -- 'whitelist' or 'blacklist'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Security Events
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

-- Login Attempts
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
```

#### **Monitoring Tables**

```sql
-- Performance Metrics
CREATE TABLE performance_metrics (
  id TEXT PRIMARY KEY,
  metric_name TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  endpoint TEXT,
  user_id TEXT REFERENCES users(id),
  session_id TEXT,
  metadata TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Error Tracking
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
  fingerprint TEXT,
  count INTEGER NOT NULL DEFAULT 1,
  first_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- API Usage
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
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### **Communication Tables**

```sql
-- Email Templates
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

-- Email Campaigns
CREATE TABLE email_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_id TEXT REFERENCES email_templates(id),
  status email_campaign_status NOT NULL DEFAULT 'draft',
  target_audience TEXT,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Announcements
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

-- Notifications
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
```

#### **Performance Indexes**

```sql
-- Core indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_session_user_id ON session(user_id);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_post_slug ON post(slug);
CREATE INDEX idx_post_status ON post(status);
CREATE INDEX idx_comment_post_id ON comment(post_id);

-- Security indexes
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);

-- Monitoring indexes
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at);
CREATE INDEX idx_error_tracking_fingerprint ON error_tracking(fingerprint);
CREATE INDEX idx_error_tracking_resolved ON error_tracking(resolved);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint);

-- Communication indexes
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

---

## 🔍 Common Queries

### Users

```sql
-- Find all admins
SELECT * FROM users WHERE role = 'admin';

-- Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Users created in last 7 days
SELECT * FROM users 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Posts

```sql
-- Most viewed published posts
SELECT slug, title, views, likes 
FROM post 
WHERE status = 'published' 
ORDER BY views DESC 
LIMIT 10;

-- Posts with most comments
SELECT p.slug, p.title, COUNT(c.id) as comment_count
FROM post p
LEFT JOIN comment c ON p.slug = c.post_id
WHERE p.status = 'published'
GROUP BY p.slug, p.title
ORDER BY comment_count DESC;
```

### Security

```sql
-- Failed login attempts in last 24h
SELECT email, ip_address, COUNT(*) as attempts
FROM login_attempts
WHERE success = false 
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY email, ip_address
HAVING COUNT(*) > 3
ORDER BY attempts DESC;

-- Unresolved critical security events
SELECT * FROM security_events
WHERE severity = 'critical' 
  AND resolved = false
ORDER BY created_at DESC;
```

### Monitoring

```sql
-- Most frequent errors
SELECT error_name, error_type, COUNT(*) as occurrences
FROM error_tracking
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND resolved = false
GROUP BY error_name, error_type
ORDER BY occurrences DESC
LIMIT 20;

-- Slowest API endpoints
SELECT endpoint, AVG(response_time) as avg_time, COUNT(*) as requests
FROM api_usage
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY endpoint
HAVING AVG(response_time) > 1000
ORDER BY avg_time DESC;
```

### Communication

```sql
-- Active announcements
SELECT * FROM announcements
WHERE is_active = true
  AND (start_date IS NULL OR start_date <= NOW())
  AND (end_date IS NULL OR end_date >= NOW())
ORDER BY priority DESC, created_at DESC;

-- Unread notifications per user
SELECT user_id, COUNT(*) as unread_count
FROM notifications
WHERE read = false
GROUP BY user_id
ORDER BY unread_count DESC;

-- Email campaign performance
SELECT 
  name,
  status,
  total_recipients,
  delivered_count,
  opened_count,
  ROUND(opened_count::numeric / NULLIF(delivered_count, 0) * 100, 2) as open_rate,
  clicked_count,
  ROUND(clicked_count::numeric / NULLIF(delivered_count, 0) * 100, 2) as click_rate
FROM email_campaigns
WHERE status IN ('sent', 'completed')
ORDER BY created_at DESC;
```

---

## 🛠️ Maintenance Commands

### Cleanup Old Data

```sql
-- Clean expired sessions
DELETE FROM session 
WHERE expires_at < NOW();

-- Clean old read notifications
DELETE FROM notifications 
WHERE read = true 
  AND read_at < NOW() - INTERVAL '30 days';

-- Clean old login attempts
DELETE FROM login_attempts 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Performance Analysis

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 📦 Backup and Restore

```sql
-- Backup via pg_dump (run in terminal)
pg_dump -h localhost -U postgres -d database_name > backup_$(date +%Y%m%d).sql

-- Restore backup
psql -h localhost -U postgres -d database_name < backup_20250103.sql

-- Backup specific table
pg_dump -h localhost -U postgres -d database_name -t users > users_backup.sql
```

---

## ⚠️ Important Notes

1. **Always use transactions** for critical operations:
   ```sql
   BEGIN;
   -- your queries here
   COMMIT; -- or ROLLBACK on error
   ```

2. **Indexes:** Ensure indexes exist for frequently-used queries.

3. **Performance:** Use `EXPLAIN ANALYZE` to analyze slow queries.

4. **Security:** Never expose sensitive data in logs.

5. **Backups:** Maintain regular backups and test restores periodically.
