-- =====================================================
-- PARTE 2: TABELAS PRINCIPAIS
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  image text,
  role role NOT NULL DEFAULT 'user',
  username text UNIQUE,
  bio text,
  is_public boolean NOT NULL DEFAULT true,
  isAnonymous boolean DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (OAuth)
CREATE TABLE IF NOT EXISTS account (
  id text PRIMARY KEY,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamp without time zone,
  refresh_token_expires_at timestamp without time zone,
  scope text,
  password text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS session (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  ip_address text,
  user_agent text,
  expires_at timestamp without time zone NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Verification table
CREATE TABLE IF NOT EXISTS verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamp without time zone NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamp without time zone NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Posts
CREATE TABLE IF NOT EXISTS post (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text,
  description text,
  content text,
  excerpt text,
  cover_image text,
  tags text,
  status post_status DEFAULT 'draft',
  featured boolean DEFAULT false,
  author_id text REFERENCES users(id),
  likes integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  published_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Comments
CREATE TABLE IF NOT EXISTS comment (
  id text PRIMARY KEY,
  body text NOT NULL,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id text NOT NULL REFERENCES post(slug) ON DELETE CASCADE,
  parent_id text REFERENCES comment(id),
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comment ratings
CREATE TABLE IF NOT EXISTS rate (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id text NOT NULL REFERENCES comment(id) ON DELETE CASCADE,
  like boolean NOT NULL,
  PRIMARY KEY (user_id, comment_id)
);

-- Guestbook
CREATE TABLE IF NOT EXISTS guestbook (
  id text PRIMARY KEY,
  body text NOT NULL,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Like sessions
CREATE TABLE IF NOT EXISTS likes_session (
  id text PRIMARY KEY,
  likes integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id text PRIMARY KEY,
  admin_user_id text NOT NULL REFERENCES users(id),
  action audit_log_action NOT NULL,
  target_type text,
  target_id text,
  details text,
  ip_address text,
  user_agent text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
