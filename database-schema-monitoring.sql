-- =====================================================
-- PARTE 4: TABELAS DE MONITORAMENTO
-- =====================================================

-- Métricas de performance
CREATE TABLE IF NOT EXISTS performance_metrics (
  id text PRIMARY KEY,
  metric_name text NOT NULL,
  value real NOT NULL,
  unit text NOT NULL,
  endpoint text,
  user_id text REFERENCES users(id),
  session_id text,
  user_agent text,
  ip_address text,
  metadata text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Eventos analíticos
CREATE TABLE IF NOT EXISTS analytics_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  event_name text,
  user_id text REFERENCES users(id),
  session_id text NOT NULL,
  page text,
  referrer text,
  user_agent text,
  ip_address text,
  country text,
  city text,
  device text,
  browser text,
  os text,
  properties text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Uso de recursos
CREATE TABLE IF NOT EXISTS resource_usage (
  id text PRIMARY KEY,
  type resource_type NOT NULL,
  value real NOT NULL,
  max_value real,
  unit text NOT NULL,
  hostname text,
  service text,
  metadata text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Uso de API
CREATE TABLE IF NOT EXISTS api_usage (
  id text PRIMARY KEY,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer NOT NULL,
  response_time integer NOT NULL,
  request_size integer,
  response_size integer,
  user_id text REFERENCES users(id),
  ip_address text,
  user_agent text,
  api_key text,
  error_message text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance de queries
CREATE TABLE IF NOT EXISTS query_performance (
  id text PRIMARY KEY,
  query_type text NOT NULL,
  table_name text NOT NULL,
  execution_time real NOT NULL,
  rows_affected integer,
  query_hash text,
  endpoint text,
  user_id text REFERENCES users(id),
  slow boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Rastreamento de erros
CREATE TABLE IF NOT EXISTS error_tracking (
  id text PRIMARY KEY,
  error_type text NOT NULL,
  error_name text NOT NULL,
  message text NOT NULL,
  stack text,
  filename text,
  line_number integer,
  column_number integer,
  user_id text REFERENCES users(id),
  session_id text,
  url text,
  user_agent text,
  ip_address text,
  breadcrumbs text,
  tags text,
  fingerprint text,
  count integer NOT NULL DEFAULT 1,
  first_seen timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved boolean NOT NULL DEFAULT false,
  resolved_by text REFERENCES users(id),
  resolved_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Logs de erro
CREATE TABLE IF NOT EXISTS error_logs (
  id text PRIMARY KEY,
  level text NOT NULL,
  message text NOT NULL,
  stack text,
  url text,
  user_agent text,
  user_id text REFERENCES users(id),
  ip_address text,
  metadata text,
  resolved boolean NOT NULL DEFAULT false,
  resolved_by text REFERENCES users(id),
  resolved_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Métricas customizadas
CREATE TABLE IF NOT EXISTS custom_metrics (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  value real NOT NULL,
  unit text,
  category text,
  dimensions text,
  created_by text REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Alertas
CREATE TABLE IF NOT EXISTS alerts (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  type alert_type NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'warning',
  conditions text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  notification_channels text,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Instâncias de alertas
CREATE TABLE IF NOT EXISTS alert_instances (
  id text PRIMARY KEY,
  alert_id text NOT NULL REFERENCES alerts(id),
  triggered_value real,
  message text NOT NULL,
  metadata text,
  resolved boolean NOT NULL DEFAULT false,
  resolved_by text REFERENCES users(id),
  resolved_at timestamp without time zone,
  notifications_sent text,
  triggered_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Atividade de usuários
CREATE TABLE IF NOT EXISTS user_activity (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  action text NOT NULL,
  resource text,
  details text,
  ip_address text,
  user_agent text,
  session_id text,
  duration integer,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Logs de saúde do sistema
CREATE TABLE IF NOT EXISTS system_health_logs (
  id text PRIMARY KEY,
  check_type health_check_type NOT NULL,
  status health_status NOT NULL,
  response_time integer,
  message text,
  details text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
