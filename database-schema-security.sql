-- =====================================================
-- PARTE 3: TABELAS DE SEGURANÇA
-- =====================================================

-- 2FA tokens
CREATE TABLE IF NOT EXISTS two_factor_tokens (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret text NOT NULL,
  backup_codes text,
  is_enabled boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at timestamp without time zone
);

-- IP access control
CREATE TABLE IF NOT EXISTS ip_access_control (
  id text PRIMARY KEY,
  ip_address text NOT NULL,
  ip_range text,
  type ip_access_type NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Security events
CREATE TABLE IF NOT EXISTS security_events (
  id text PRIMARY KEY,
  event_type security_event_type NOT NULL,
  severity security_event_severity NOT NULL DEFAULT 'low',
  user_id text REFERENCES users(id),
  ip_address text,
  user_agent text,
  location text,
  details text,
  resolved boolean NOT NULL DEFAULT false,
  resolved_by text REFERENCES users(id),
  resolved_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Login attempts
CREATE TABLE IF NOT EXISTS login_attempts (
  id text PRIMARY KEY,
  email text NOT NULL,
  ip_address text NOT NULL,
  user_agent text,
  success boolean NOT NULL,
  failure_reason text,
  two_factor_required boolean NOT NULL DEFAULT false,
  two_factor_success boolean,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Account lockouts
CREATE TABLE IF NOT EXISTS account_lockouts (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  reason text NOT NULL,
  locked_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  locked_until timestamp without time zone,
  locked_by text REFERENCES users(id),
  unlocked boolean NOT NULL DEFAULT false,
  unlocked_at timestamp without time zone,
  unlocked_by text REFERENCES users(id)
);

-- Security settings
CREATE TABLE IF NOT EXISTS security_settings (
  id text PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  updated_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Rate limiting de API
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  identifier_type text NOT NULL,
  endpoint text,
  request_count integer NOT NULL DEFAULT 0,
  window_start timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  window_end timestamp without time zone NOT NULL,
  blocked boolean NOT NULL DEFAULT false,
  blocked_until timestamp without time zone
);
