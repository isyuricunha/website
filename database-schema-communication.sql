-- =====================================================
-- PARTE 5: TABELAS DE COMUNICAÇÃO
-- =====================================================

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  type email_template_type NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  variables text,
  is_active boolean NOT NULL DEFAULT true,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id text PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  template_id text REFERENCES email_templates(id),
  html_content text,
  text_content text,
  status email_campaign_status NOT NULL DEFAULT 'draft',
  target_audience text,
  total_recipients integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  delivered_count integer NOT NULL DEFAULT 0,
  opened_count integer NOT NULL DEFAULT 0,
  clicked_count integer NOT NULL DEFAULT 0,
  bounced_count integer NOT NULL DEFAULT 0,
  unsubscribed_count integer NOT NULL DEFAULT 0,
  scheduled_at timestamp without time zone,
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Campaign recipients
CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id text PRIMARY KEY,
  campaign_id text NOT NULL REFERENCES email_campaigns(id),
  user_id text REFERENCES users(id),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamp without time zone,
  delivered_at timestamp without time zone,
  opened_at timestamp without time zone,
  clicked_at timestamp without time zone,
  unsubscribed_at timestamp without time zone,
  error_message text
);

-- Email subscriptions
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  user_id text REFERENCES users(id),
  subscription_types text,
  is_active boolean NOT NULL DEFAULT true,
  unsubscribe_token text NOT NULL UNIQUE,
  subscribed_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at timestamp without time zone
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id text PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  type announcement_type NOT NULL DEFAULT 'info',
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_dismissible boolean NOT NULL DEFAULT true,
  target_audience text,
  start_date timestamp without time zone,
  end_date timestamp without time zone,
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Announcement interactions
CREATE TABLE IF NOT EXISTS announcement_interactions (
  id text PRIMARY KEY,
  announcement_id text NOT NULL REFERENCES announcements(id),
  user_id text NOT NULL REFERENCES users(id),
  viewed boolean NOT NULL DEFAULT false,
  dismissed boolean NOT NULL DEFAULT false,
  viewed_at timestamp without time zone,
  dismissed_at timestamp without time zone
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  title text NOT NULL,
  message text NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  data text,
  read boolean NOT NULL DEFAULT false,
  read_at timestamp without time zone,
  action_url text,
  expires_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
