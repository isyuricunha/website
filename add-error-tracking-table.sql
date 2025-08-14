-- Add Error Tracking Table for Monitoring Dashboard
-- Run this SQL script in your database to fix the monitoring router errors

CREATE TABLE IF NOT EXISTS error_tracking (
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
  first_seen TIMESTAMP NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by TEXT REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_error_tracking_created_at ON error_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_error_tracking_error_type ON error_tracking(error_type);
CREATE INDEX IF NOT EXISTS idx_error_tracking_resolved ON error_tracking(resolved);
CREATE INDEX IF NOT EXISTS idx_error_tracking_fingerprint ON error_tracking(fingerprint);
CREATE INDEX IF NOT EXISTS idx_error_tracking_user_id ON error_tracking(user_id);

-- Add some sample data for testing
INSERT INTO error_tracking (id, error_type, error_name, message, fingerprint) VALUES
('err_1', 'javascript', 'TypeError', 'Cannot read property of undefined', 'js_undefined_prop'),
('err_2', 'server', 'DatabaseError', 'Connection timeout', 'db_timeout'),
('err_3', 'network', 'NetworkError', 'Failed to fetch', 'network_fetch_fail')
ON CONFLICT (id) DO NOTHING;
