-- =====================================================
-- PARTE 6: TABELAS DE GESTÃO DE DADOS
-- =====================================================

-- Database backups
CREATE TABLE IF NOT EXISTS database_backups (
  id text PRIMARY KEY,
  name text NOT NULL,
  type backup_type NOT NULL DEFAULT 'full',
  status backup_status NOT NULL DEFAULT 'pending',
  file_path text,
  file_size integer,
  compression_type text,
  checksum text,
  tables text,
  excluded_tables text,
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  duration integer,
  error_message text,
  metadata text,
  is_automatic boolean NOT NULL DEFAULT false,
  retention_days integer DEFAULT 30,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Database restores
CREATE TABLE IF NOT EXISTS database_restores (
  id text PRIMARY KEY,
  backup_id text NOT NULL REFERENCES database_backups(id),
  status restore_status NOT NULL DEFAULT 'pending',
  target_database text,
  restore_point timestamp without time zone,
  tables text,
  data_only boolean NOT NULL DEFAULT false,
  schema_only boolean NOT NULL DEFAULT false,
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  duration integer,
  error_message text,
  metadata text,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data exports
CREATE TABLE IF NOT EXISTS data_exports (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  format export_format NOT NULL DEFAULT 'csv',
  status export_status NOT NULL DEFAULT 'pending',
  query text,
  tables text,
  filters text,
  file_path text,
  file_size integer,
  record_count integer,
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  duration integer,
  error_message text,
  download_url text,
  expires_at timestamp without time zone,
  metadata text,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data imports
CREATE TABLE IF NOT EXISTS data_imports (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  format export_format NOT NULL DEFAULT 'csv',
  status import_status NOT NULL DEFAULT 'pending',
  file_path text NOT NULL,
  file_size integer,
  target_table text NOT NULL,
  mapping text,
  validation_rules text,
  duplicate_handling text NOT NULL DEFAULT 'skip',
  total_records integer,
  processed_records integer NOT NULL DEFAULT 0,
  successful_records integer NOT NULL DEFAULT 0,
  failed_records integer NOT NULL DEFAULT 0,
  validation_errors text,
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  duration integer,
  error_message text,
  metadata text,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data migrations
CREATE TABLE IF NOT EXISTS data_migrations (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  version text NOT NULL,
  status migration_status NOT NULL DEFAULT 'pending',
  migration_script text,
  rollback_script text,
  checksum text,
  dependencies text,
  affected_tables text,
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  duration integer,
  error_message text,
  rollback_reason text,
  metadata text,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data quality checks
CREATE TABLE IF NOT EXISTS data_quality_checks (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  type data_quality_check_type NOT NULL,
  table_name text NOT NULL,
  column_name text,
  rules text NOT NULL,
  threshold integer,
  is_active boolean NOT NULL DEFAULT true,
  schedule text,
  last_run_at timestamp without time zone,
  next_run_at timestamp without time zone,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data quality check results
CREATE TABLE IF NOT EXISTS data_quality_check_results (
  id text PRIMARY KEY,
  check_id text NOT NULL REFERENCES data_quality_checks(id),
  total_records integer NOT NULL,
  passed_records integer NOT NULL,
  failed_records integer NOT NULL,
  success_rate integer NOT NULL,
  details text,
  issues text,
  run_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data synchronization
CREATE TABLE IF NOT EXISTS data_synchronization (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  source_type text NOT NULL,
  source_config text NOT NULL,
  target_type text NOT NULL,
  target_config text NOT NULL,
  direction sync_direction NOT NULL DEFAULT 'pull',
  status sync_status NOT NULL DEFAULT 'pending',
  schedule text,
  mapping text,
  filters text,
  last_sync_at timestamp without time zone,
  next_sync_at timestamp without time zone,
  synced_records integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata text,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bulk operations
CREATE TABLE IF NOT EXISTS bulk_operations (
  id text PRIMARY KEY,
  type text NOT NULL,
  status bulk_operation_status NOT NULL DEFAULT 'pending',
  total_items integer NOT NULL,
  processed_items integer NOT NULL DEFAULT 0,
  successful_items integer NOT NULL DEFAULT 0,
  failed_items integer NOT NULL DEFAULT 0,
  parameters text,
  results text,
  error_message text,
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Site configuration
CREATE TABLE IF NOT EXISTS site_config (
  id text PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  type site_config_type NOT NULL DEFAULT 'general',
  description text,
  is_public boolean NOT NULL DEFAULT false,
  updated_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
