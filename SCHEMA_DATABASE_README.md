# 📊 Complete Database Schema

Unified schema extracted from Supabase and organized for easy execution and maintenance.

## 📁 Available Files

### **Modular Execution** (Recommended)
Execute files in order to create the complete schema:

1. **`database-schema-enums.sql`** - All ENUM types
2. **`database-schema-tables.sql`** - Core tables (users, posts, comments)
3. **`database-schema-security.sql`** - Security tables (2FA, IP control, events)
4. **`database-schema-monitoring.sql`** - Monitoring tables (metrics, errors, analytics)
5. **`database-schema-communication.sql`** - Communication tables (emails, announcements, notifications)
6. **`database-schema-data-management.sql`** - Data management (backups, exports, migrations)
7. **`database-schema-indexes.sql`** - Performance indexes

### **Legacy Files**
- **`database-full-schema.sql`** - Old schema (keep for reference)
- **`fresh-install-sql/complete-fresh-install.sql`** - Original complete installation

## 🚀 How to Execute

### **Option 1: Modular Execution (Recommended)**

```bash
# 1. ENUMs
psql -h localhost -U postgres -d your_database < database-schema-enums.sql

# 2. Core tables
psql -h localhost -U postgres -d your_database < database-schema-tables.sql

# 3. Security
psql -h localhost -U postgres -d your_database < database-schema-security.sql

# 4. Monitoring
psql -h localhost -U postgres -d your_database < database-schema-monitoring.sql

# 5. Communication
psql -h localhost -U postgres -d your_database < database-schema-communication.sql

# 6. Data management
psql -h localhost -U postgres -d your_database < database-schema-data-management.sql

# 7. Indexes
psql -h localhost -U postgres -d your_database < database-schema-indexes.sql
```

### **Option 2: Execute everything at once**

```bash
# Concatenate all files and execute
cat database-schema-*.sql | psql -h localhost -U postgres -d your_database
```

### **Option 3: Via Supabase Dashboard**

1. Access **SQL Editor** in Supabase
2. Paste the content of each file
3. Execute in the specified order

## 🔧 Differences from Original Schema

### ✅ Implemented Improvements

1. **IF NOT EXISTS** - All `CREATE TABLE` and `CREATE INDEX` use `IF NOT EXISTS` for safe execution
2. **DROP TYPE CASCADE** - ENUMs can be recreated without errors
3. **Modular Organization** - Schema divided by domain for easier maintenance
4. **English Comments** - Better readability for international teams

### 📋 Confirmed Supabase Tables

Based on Schema Visualizer export, the following tables exist:

**Core (11 tables)**
- ✅ users
- ✅ account
- ✅ session
- ✅ verification
- ✅ password_reset_tokens
- ✅ post
- ✅ comment
- ✅ rate
- ✅ guestbook
- ✅ likes_session
- ✅ audit_logs

**Security (6 tables)**
- ✅ two_factor_tokens
- ✅ ip_access_control
- ✅ security_events
- ✅ login_attempts
- ✅ account_lockouts
- ✅ security_settings
- ✅ api_rate_limits

**Monitoring (10 tables)**
- ✅ performance_metrics
- ✅ analytics_events
- ✅ resource_usage
- ✅ api_usage
- ✅ query_performance
- ✅ error_tracking
- ✅ error_logs
- ✅ custom_metrics
- ✅ alerts
- ✅ alert_instances
- ✅ user_activity
- ✅ system_health_logs

**Communication (7 tables)**
- ✅ email_templates
- ✅ email_campaigns
- ✅ email_campaign_recipients
- ✅ email_subscriptions
- ✅ announcements
- ✅ announcement_interactions
- ✅ notifications
- ✅ notification_preferences

**Data Management (9 tables)**
- ✅ database_backups
- ✅ database_restores
- ✅ data_exports
- ✅ data_imports
- ✅ data_migrations
- ✅ data_quality_checks
- ✅ data_quality_check_results
- ✅ data_synchronization
- ✅ bulk_operations
- ✅ site_config

**Total: 54 tables**

## 🔄 Next Steps: Drizzle ORM

To synchronize with Drizzle ORM:

### 1. **Generate Drizzle Schema**

```bash
cd packages/db
pnpm db:pull  # Pull schema from database
pnpm db:generate  # Generate migrations
```

### 2. **Validate Differences**

Compare current schema (`packages/db/src/schema/`) with database:

```bash
pnpm db:check
```

### 3. **Apply Changes**

If there are differences:

```bash
pnpm db:push  # Force update (development)
# OR
pnpm db:migrate  # Apply migrations (production)
```

## ⚠️ Important Notes

### **"USER-DEFINED" ENUMs**

In Supabase export, some types appear as `USER-DEFINED`. These are ENUMs created in `database-schema-enums.sql`:

- `role`
- `post_status`
- `audit_log_action`
- `security_event_type`
- `alert_type`
- etc.

### **Timestamps**

Some tables use `CURRENT_TIMESTAMP(3)` (with milliseconds), others use `CURRENT_TIMESTAMP`:

- **With milliseconds**: `comment`, `guestbook`, `likes_session`
- **Without milliseconds**: Other tables

### **Foreign Keys CASCADE**

Most foreign keys use `ON DELETE CASCADE` for automatic deletion of related records.

## 📚 Related Documentation

- **`SQL_QUERIES_REFERENCE.md`** - Common queries and examples
- **`CRITICAL_SCHEMA_ANALYSIS.md`** - Schema analysis and sync status
- **`README.md`** - General project documentation

## 🛠️ Useful Commands

### **Backup Current Schema**

```bash
pg_dump -h localhost -U postgres -d your_database --schema-only > backup-schema.sql
```

### **Compare Schemas**

```bash
# Export schema from Supabase
# Compare with local files using diff
diff backup-schema.sql database-schema-tables.sql
```

### **Reset Database (CAREFUL!)**

```bash
# Delete all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Recreate everything
cat database-schema-*.sql | psql -h localhost -U postgres -d your_database
```

---

**Last updated:** 2025-10-03  
**Based on:** Supabase Schema Visualizer
