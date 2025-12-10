# Personal Portfolio Website

Welcome to my personal portfolio website! Explore my work by visiting [yuricunha.com](https://yuricunha.com/).

## 🚨 Important Disclaimer

**Note**: This project contains a personal AI assistant feature that is my own creation and intellectual property. Please do not copy, reproduce, or implement similar AI assistant features without explicit permission. This is my personal AI/bot and should be respected as such.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture & Tech Stack](#️-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Database & SQL](#️-database--sql)
- [Documentation Files](#-documentation-files)
- [Features & Functionality](#-features--functionality)
- [Security Features](#-security-features)
- [API Integrations](#-api-integrations)
- [Internationalization](#-internationalization-i18n)
- [Development Setup](#️-development-setup)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Performance & Monitoring](#-performance--monitoring)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 📋 Project Overview

This project began as an adaptation of [Nelson Lai's site](https://github.com/tszhong0411) but has evolved significantly into a comprehensive, modern web application with advanced features, integrations, and a robust tech stack.

### **Key Highlights**

- 🚀 **Modern Stack**: Next.js 15, React 19, TypeScript 5.7
- 🗄️ **48 Database Tables**: Complete PostgreSQL schema with Drizzle ORM
- 🌍 **5 Languages**: Full i18n support (EN, PT, FR, DE, ZH)
- 🔒 **Security First**: PII sanitization, 2FA, IP control, audit logging
- 📊 **Comprehensive Monitoring**: Performance metrics, error tracking, analytics
- 🤖 **AI Integration**: Gemini/Ollama/Claude support
- 📧 **Email System**: Templates, campaigns, newsletters
- 🎨 **Modern UI**: Tailwind CSS 4.0, animations, dark mode

## 🏗️ Architecture & Tech Stack

### **Core Framework**

- **Next.js 15.4.5** - React framework with App Router
- **React 19.0.0** - Latest React with concurrent features
- **TypeScript 5.7.3** - Full type safety
- **Turbo** - Monorepo build system for optimal performance

### **Styling & UI**

- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Geist Font** - Modern typography
- **Lucide React** - Beautiful icon library
- **Class Variance Authority** - Type-safe component variants
- **Next Themes** - Dark/light mode support
- **Motion** - Advanced animations and transitions
- **React Spring** - Physics-based animations
- **React Intersection Observer** - Scroll-based animations

### **State Management & Data Fetching**

- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **tRPC** - End-to-end type-safe APIs
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### **Database & Backend**

- **PostgreSQL** - Primary database (any provider: Supabase, Railway, Neon, self-hosted)
- **Drizzle ORM 0.44.4** - Type-safe database queries
- **Better Auth** - Authentication system
- **Resend** - Email service
- **Content Collections** - MDX content management

### **Development Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Knip** - Dead code detection
- **CSpell** - Spell checking
- **Commitizen** - Conventional commits
- **Commitlint** - Commit message validation

## 📁 Project Structure

```
website-apps/
├── apps/
│   ├── docs/                    # Documentation site
│   │   ├── src/
│   │   │   ├── components/      # UI components & demos
│   │   │   ├── content/         # MDX documentation files
│   │   │   └── app/             # Next.js App Router pages
│   │   └── content-collections.ts
│   │
│   └── web/                     # Main web application
│       ├── src/
│       │   ├── app/             # Next.js App Router
│       │   │   ├── [locale]/   # Internationalized routes
│       │   │   └── api/         # API routes
│       │   ├── components/      # React components
│       │   ├── lib/             # Utilities & services
│       │   │   ├── ai/          # AI service (Gemini/Ollama/Claude)
│       │   │   ├── audit-logger.ts
│       │   │   ├── logger.ts    # 🆕 Structured logger with PII sanitization
│       │   │   ├── resend-service.ts
│       │   │   └── auth.ts
│       │   ├── trpc/            # tRPC API routers
│       │   │   ├── routers/     # API endpoints
│       │   │   └── trpc.ts
│       │   ├── hooks/           # React hooks
│       │   ├── utils/           # Helper functions
│       │   └── examples/        # Code examples
│       ├── messages/            # i18n translation files
│       └── public/              # Static assets
│
├── packages/
│   ├── db/                      # Database package
│   │   ├── src/
│   │   │   ├── schema/          # Manual Drizzle schemas (legacy)
│   │   │   ├── migrations/      # Auto-generated SQL migrations
│   │   │   │   ├── schema.ts    # 🆕 Auto-generated from PostgreSQL (48 tables)
│   │   │   │   ├── relations.ts # 🆕 Auto-generated relationships
│   │   │   │   └── *.sql        # Migration files
│   │   │   ├── index.ts         # Database exports
│   │   │   └── seed.ts          # Database seeding
│   │   ├── drizzle.config.ts    # Drizzle configuration
│   │   └── add-unique-constraint.sql
│   │
│   ├── env/                     # Environment validation
│   │   └── src/index.ts         # Zod schemas for env vars
│   │
│   ├── emails/                  # Email templates (React Email)
│   │   └── src/                 # Email components
│   │
│   ├── eslint-config/           # Shared ESLint config
│   ├── prettier-config/         # Shared Prettier config
│   ├── tsconfig/                # Shared TypeScript config
│   ├── ui/                      # Shared UI components
│   ├── utils/                   # Shared utilities
│   ├── i18n/                    # Internationalization
│   ├── kv/                      # Redis/KV storage
│   ├── mdx-plugins/             # MDX processing plugins
│   ├── prettier-plugin-package-json/  # Custom Prettier plugin
│   └── shared/                  # Shared types and constants
│
├── turbo/                       # Turborepo generators
│   └── generators/              # Code generation templates
│
├── fresh-install-sql/           # Database setup scripts
│   └── complete-fresh-install.sql
│
├── .github/                     # GitHub configuration
│   ├── workflows/               # CI/CD workflows
│   │   ├── ci.yml              # Continuous integration
│   │   ├── auto-release.yml    # Automated releases
│   │   └── nextjs.yml          # Next.js deployment
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   └── CODEOWNERS              # Code ownership
│
├── .vscode/                     # VS Code configuration
│   ├── settings.json           # Editor settings
│   ├── extensions.json         # Recommended extensions
│   └── launch.json             # Debug configurations
│
├── Documentation Files (see Documentation section below)
├── SQL Schema Files (see Database section below)
├── Python Translation Scripts (see Internationalization section below)
│
├── .env.example                 # Environment template
├── .env.local                   # Local environment (gitignored)
├── .editorconfig                # Editor configuration
├── .prettierignore              # Prettier ignore patterns
├── .gitignore                   # Git ignore patterns
├── .npmrc                       # NPM configuration
├── .nvmrc                       # Node version
├── .cspell.json                 # Spell checker configuration
├── commitlint.config.ts         # Commit message linting
├── eslint.config.mjs            # ESLint configuration
├── knip.config.ts               # Dead code detection config
├── prettier.config.js           # Prettier configuration
├── tsconfig.json                # TypeScript configuration
├── turbo.json                   # Turborepo configuration
├── vercel.json                  # Vercel deployment config
├── vitest.config.ts             # Vitest configuration
├── vitest.shared.ts             # Shared Vitest config
├── vitest.workspace.ts          # Vitest workspace
├── package.json                 # Root dependencies
├── pnpm-workspace.yaml          # PNPM workspace config
└── pnpm-lock.yaml               # Dependency lock file
```

### **Key Directories Explained**

#### **apps/web/src/lib/**

- `logger.ts` - **NEW**: Structured logger with automatic PII sanitization
- `audit-logger.ts` - Tracks admin actions and system events
- `resend-service.ts` - Email campaign and newsletter management
- `ai/ai-service.ts` - AI integration (Gemini/Ollama/Claude support)

#### **apps/web/src/trpc/routers/**

API endpoints organized by domain:

- `users.ts` - User management (CRUD, password reset)
- `spotify.ts` - Spotify API integration
- `github.ts` - GitHub API integration
- `resend-email.ts` - Email campaigns & broadcasts
- `monitoring.ts` - Performance & error tracking
- `system.ts` - System health & configuration

#### **packages/db/**

Database layer with Drizzle ORM:

- Auto-generated schema from PostgreSQL
- Type-safe queries
- Migration management
- Seeding utilities

## 🗄️ Database & SQL

### **Database Architecture**

- **Primary:** PostgreSQL (any provider - Supabase, Railway, Neon, self-hosted, etc.)
- **ORM:** Drizzle ORM 0.44.4
- **Migrations:** Automated via drizzle-kit
- **Schema Management:** Auto-generated from database
- **Total Tables:** 48 tables with 28 ENUMs
- **Seeding:** Custom seed scripts

### **Schema Synchronization** 🆕

The database schema is automatically synchronized with your PostgreSQL database:

```bash
# Pull latest schema from database (generates TypeScript schemas)
cd packages/db
pnpm db:pull

# Check schema consistency
pnpm db:check

# Push local schema changes to database (runs migrations first)
pnpm db:push

# Force push without interactive prompts (Windows PowerShell)
pnpm db:push:force
```

**Important Notes:**

- Works with **any PostgreSQL database** (Supabase, Railway, Neon, self-hosted, etc.)
- Schema files are auto-generated in `packages/db/src/migrations/`
- `schema.ts` contains all 48 tables with 28 ENUMs
- `relations.ts` contains all foreign key relationships
- `drizzle.config.ts` points to the generated schema as source of truth
- Never manually edit generated schema files - use `pnpm db:pull` to regenerate
- `db:push` and `db:push:force` now run migrations first to ensure proper constraint order

### **Database Tables** (48 total)

**Core (11 tables):**

- `users`, `account`, `session`, `verification` - Authentication
- `password_reset_tokens` - Password recovery
- `post`, `comment`, `rate` - Content management
- `guestbook`, `likes_session` - User interactions
- `audit_logs` - System audit trail

**Security (7 tables):**

- `two_factor_tokens` - 2FA authentication
- `ip_access_control` - IP whitelist/blacklist
- `security_events` - Security monitoring
- `login_attempts` - Login tracking
- `account_lockouts` - Account security
- `security_settings` - Security configuration
- `api_rate_limits` - API protection

**Monitoring (11 tables):**

- `performance_metrics` - Performance tracking
- `analytics_events` - User analytics
- `resource_usage` - System resources
- `api_usage` - API call tracking
- `query_performance` - Database performance
- `error_tracking`, `error_logs` - Error monitoring
- `custom_metrics` - Custom metrics
- `alerts`, `alert_instances` - Alert system
- `user_activity` - User activity logs
- `system_health_logs` - Health checks

**Communication (8 tables):**

- `email_templates` - Email template management
- `email_campaigns`, `email_campaign_recipients` - Email campaigns
- `email_subscriptions` - Newsletter subscriptions
- `announcements`, `announcement_interactions` - System announcements
- `notifications`, `notification_preferences` - User notifications

**Data Management (11 tables):**

- `database_backups`, `database_restores` - Backup management
- `data_exports`, `data_imports` - Data import/export
- `data_migrations` - Migration tracking
- `data_quality_checks`, `data_quality_check_results` - Data quality
- `data_synchronization` - Data sync
- `bulk_operations` - Bulk operations
- `site_config` - Site configuration

### **SQL Schema Files**

Modular schema organization (execute in order for fresh setup):

1. **`database-schema-enums.sql`** - All 35 ENUM types
   - User roles, post status, audit actions
   - Security event types and severities
   - Monitoring and alert types
   - Communication types (email, notifications)
   - Data management types (backup, export, import)

2. **`database-schema-tables.sql`** - Core tables
   - Users, authentication, sessions
   - Posts, comments, ratings
   - Guestbook, likes, audit logs

3. **`database-schema-security.sql`** - Security tables
   - 2FA tokens, IP access control
   - Security events, login attempts
   - Account lockouts, security settings

4. **`database-schema-monitoring.sql`** - Monitoring tables
   - Performance metrics, analytics events
   - Resource usage, API usage
   - Error tracking, custom metrics
   - Alerts, user activity, health logs

5. **`database-schema-communication.sql`** - Communication tables
   - Email templates and campaigns
   - Announcements and interactions
   - Notifications and preferences

6. **`database-schema-data-management.sql`** - Data management tables
   - Database backups and restores
   - Data exports, imports, migrations
   - Data quality checks and synchronization
   - Bulk operations, site configuration

7. **`database-schema-indexes.sql`** - Performance indexes
   - Core indexes (users, posts, comments)
   - Security indexes (events, login attempts)
   - Monitoring indexes (metrics, errors)
   - Communication indexes (campaigns, notifications)

### **Utility SQL Files**

- **`database-full-schema.sql`** - Complete schema export from PostgreSQL
  - ⚠️ **NOT executable** (alphabetical order, missing ENUMs)
  - Use for reference only
  - Use modular files above for actual setup

- **`fix-error-tracking-column.sql`** - Fixes missing `created_at` column

  ```sql
  ALTER TABLE error_tracking
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
  ```

- **`sample-announcements.sql`** - Sample data for testing
  - Inserts example announcements
  - Various types: info, warning, success, error, maintenance
  - Priorities from 1 (low) to 5 (critical)

- **`fresh-install-sql/complete-fresh-install.sql`** - Legacy complete installation
  - 659 lines with all tables
  - Use modular files instead for better maintainability

- **`packages/db/add-unique-constraint.sql`** - Manual constraint fix
  ```sql
  ALTER TABLE post ADD CONSTRAINT unique_post_slug UNIQUE (slug);
  ```

### **Known Issues & Solutions**

#### **Windows PowerShell Interactive Prompts**

When running `pnpm db:push`, PowerShell may not render interactive prompts correctly. Use:

```bash
pnpm db:push:force  # Skips all prompts
```

#### **Foreign Key Constraint Order** ✅ FIXED

Previously, `pnpm db:push` could fail with `there is no unique constraint matching given keys` error.

**Solution implemented:**

- Created migration `0006_fix_post_slug_unique.sql` to add UNIQUE constraint before foreign keys
- Updated `db:push` and `db:push:force` to run migrations first
- Now works correctly on fresh PostgreSQL databases without manual intervention

**For fresh database setup:**

```bash
# This will work on any empty PostgreSQL database
cd packages/db
pnpm db:push:force
# 1. Runs all migrations (including constraint fix)
# 2. Pushes remaining schema changes
# 3. Creates all 48 tables with proper constraint order ✅
```

## 📚 Documentation Files

The project includes comprehensive documentation in multiple markdown files:

### **Main Documentation**

- **`README.md`** (this file) - Complete project documentation
- **`license.md`** - Personal license for non-commercial use with attribution
- **`CODE_OF_CONDUCT.md`** - Community guidelines and code of conduct
- **`CONTRIBUTING.md`** - Contribution guidelines and development workflow
- **`CREDITS.md`** - Attribution to original project and contributors

### **Database Documentation** 🆕

- **`SQL_QUERIES_REFERENCE.md`** - Complete SQL query reference
  - All table schemas with ENUMs
  - Common queries for users, posts, security, monitoring
  - Performance indexes
  - Maintenance commands (cleanup, backups)
  - Performance analysis queries
  - Backup and restore procedures

- **`SCHEMA_DATABASE_README.md`** - Schema execution guide
  - Modular schema file organization
  - Execution order instructions
  - Drizzle ORM synchronization steps
  - Confirmed Supabase tables list (54 tables)
  - Useful commands for schema management

- **`CRITICAL_SCHEMA_ANALYSIS.md`** - Schema validation report 🆕
  - Identifies sync issues between Drizzle and PostgreSQL
  - Lists missing tables (39 tables were missing, now fixed)
  - Field discrepancies analysis
  - Recommendations for schema synchronization
  - Table comparison matrix

### **Feature Documentation**

- **`SPOTIFY_IMPLEMENTATION.md`** - Spotify integration guide
  - OAuth 2.0 setup
  - API endpoints documentation
  - Currently playing, top artists, top tracks
  - Recently played tracks
  - Rate limiting and error handling
  - Environment variables required

- **`TRANSLATION_SCRIPTS.md`** - Translation automation guide
  - Python scripts for i18n management
  - Google Translate API integration
  - Ollama local translation
  - Git commit message translation
  - Batch retranslation utilities

## 📱 Features & Functionality

### **Content Management**

- **MDX Support** - Rich content with React components
- **Content Collections** - Type-safe content management
- **Dynamic routing** - SEO-friendly URLs
- **Image optimization** - Next.js Image component
- **RSS Feed** - Blog post syndication

### **User Experience**

- **Responsive Design** - Mobile-first approach
- **Progressive Web App** - Offline capabilities
- **Keyboard Navigation** - Full accessibility
- **Screen Reader Support** - ARIA labels
- **Reduced Motion** - Accessibility preferences
- **Global Command Menu** - Instant search for Posts, Projects, and Navigation (`Cmd+K`)
- **Performance Optimization** - Core Web Vitals

### **Interactive Elements**

- **Comments System** - User engagement (currently deactivated)
- **Guestbook** - Visitor messages
- **Contact Forms** - Email integration
- **Social Sharing** - Dynamic meta tags
- **Confetti Effects** - Celebration animations
- **Virtual Assistant (Yue)** - Interactive mascot with context-aware AI chat (RAG) capabilities

### **SEO & Performance**

- **Dynamic Meta Tags** - SEO optimization
- **Structured Data** - Rich snippets
- **Sitemap Generation** - Search engine indexing
- **Robots.txt** - Crawler directives
- **Bundle Analysis** - Performance monitoring
- **Code Splitting** - Optimized loading

## 🔒 Security Features

### **Structured Logging System** 🆕

New secure logging implementation:

```typescript
import { logger } from '@/lib/logger'

// Automatic PII redaction
logger.info('User action', {
  userId: '123',
  email: 'user@example.com' // Automatically redacted as [REDACTED]
})

// API call tracking
logger.apiCall('POST', '/api/users', 145)

// Security events
logger.securityEvent('Failed login attempt', { ip: '192.168.1.1' })
```

**Features:**

- ✅ Automatic sanitization of passwords, secrets, tokens, emails, hashes
- ✅ Environment-aware (dev/production)
- ✅ Structured context logging
- ✅ Timestamp support
- ✅ Type-safe with TypeScript

### **Security Improvements** 🆕

Recent security audit completed:

- ❌ Removed console.log exposing user emails, reset tokens, password hashes
- ✅ Cleaned up 26+ debug logs in production code
- ✅ Implemented structured logger with PII protection
- ✅ All API keys properly secured via environment variables

### **Authentication & Authorization**

- Better Auth integration
- Session management
- Role-based access control (RBAC)
- Password reset with secure tokens
- IP-based access control
- Login attempt tracking
- 2FA support

### **Security Monitoring**

- Security event logging
- Failed login tracking
- Account lockout mechanism
- IP access control (whitelist/blacklist)
- Security settings management
- API rate limiting

### **Admin Dashboard** 🆕

- **User Management** - View, edit, ban/unban users with visual status indicators
- **Content Overview** - Metrics and management for posts and projects
- **Audit Logs** - Track all administrative actions

## 🔌 API Integrations

### **GitHub Integration**

- **Octokit REST API** - Fetch public repositories
- **Repository statistics** - Stars, forks, languages
- **Profile information** - Bio, location, social links
- **Real-time updates** - Live repository data

### **Spotify Integration**

- **OAuth 2.0** - Secure authentication
- **Currently Playing** - Real-time track information
- **Top Artists** - Personal music preferences
- **Top Tracks** - Favorite songs
- **Recently Played** - Listening history
- **Album Art** - High-quality images
- **Auto-refresh** - 60-second data updates

See `SPOTIFY_IMPLEMENTATION.md` for detailed setup instructions.

### **Newsletter Integration**

- **ConvertKit API** - Newsletter management
- **Mailerlite compatibility** - Alternative provider support
- **Subscription forms** - Embedded signup
- **Analytics** - Subscription tracking

### **Email Service (Resend)**

- **Email templates** - React Email components
- **Email campaigns** - Bulk email sending
- **Campaign tracking** - Open rates, click rates
- **Recipient management** - User segmentation

### **Analytics & Privacy**

- **Umami** - Privacy-focused analytics
- **DuckDuckGo Proxy** - Enhanced privacy
- **Vercel Speed Insights** - Performance monitoring
- **No Google Analytics** - Privacy-first approach

## 🌍 Internationalization (i18n)

### **Supported Languages**

- 🇬🇧 English (en)
- 🇧🇷 Portuguese (pt)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇨🇳 Chinese (zh)

### **i18n Features**

- **next-intl** - Internationalization framework
- **Dynamic routing** - Language-specific URLs (`/[locale]/...`)
- **Content translation** - All UI elements translated
- **SEO optimization** - Language-specific meta tags
- **RTL support** - Right-to-left language support

### **Translation Automation** 🆕

The project includes Python scripts for automated translation management:

#### **`sync_translations_google.py`**

- Uses Google Translate API for translations
- Syncs all language files with English source
- Preserves existing translations
- Requires `GOOGLE_TRANSLATE_API_KEY` environment variable

#### **`sync_translations_ollama.py`**

- Uses local Ollama for translations (privacy-focused)
- No API key required
- Supports multiple models (llama2, mistral, etc.)
- Slower but completely offline

#### **`git_commit_translations.py`**

- Translates git commit messages to multiple languages
- Useful for international teams
- Preserves commit history in multiple languages

#### **`retranslate_all.py`**

- Batch retranslation utility
- Useful when changing translation provider
- Backs up existing translations

**Usage:**

```bash
# Install dependencies
pip install -r requirements-translate.txt

# Sync translations using Google Translate
python sync_translations_google.py

# Or use local Ollama (no API key needed)
python sync_translations_ollama.py

# Translate git commits
python git_commit_translations.py
```

See `TRANSLATION_SCRIPTS.md` for detailed documentation.

## 🛠️ Development Setup

### **Prerequisites**

- **Node.js** >= 22
- **pnpm** 10.14.0 (package manager)
- **PostgreSQL** (for database)
- **Python 3.x** (optional, for translation scripts)

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/isyuricunha/website.git
   cd website
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env.local
   # Configure your environment variables (see Environment Variables section)
   ```

4. **Database setup**

   ```bash
   cd packages/db
   pnpm db:push:force  # Creates all 48 tables
   pnpm db:seed        # Seeds with sample data
   ```

5. **Start development server**

   ```bash
   cd ../..
   pnpm dev
   ```

6. **Open in browser**
   - Main app: http://localhost:3000
   - Docs: http://localhost:3001

## 📜 Available Scripts

### **Development**

```bash
pnpm dev              # Start all development servers
pnpm dev:web          # Start web app only
pnpm dev:packages     # Start packages only
```

### **Building**

```bash
pnpm build            # Build all packages and apps
pnpm build:apps       # Build applications only
pnpm build:packages   # Build packages only
pnpm build:mdx        # Build MDX content
```

### **Testing**

```bash
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:unit:ui     # Run unit tests with UI
pnpm test:e2e:ui      # Run E2E tests with UI
```

### **Code Quality**

```bash
pnpm lint             # Run linter
pnpm lint:fix         # Fix linting issues
pnpm type-check       # TypeScript checking
pnpm format:check     # Check formatting
pnpm format:write     # Fix formatting
```

### **Database**

```bash
pnpm db:pull          # Pull schema from PostgreSQL (auto-generate TypeScript)
pnpm db:generate      # Generate migrations from schema changes
pnpm db:push          # Run migrations + push schema changes to database
pnpm db:push:force    # Run migrations + push without prompts (Windows)
pnpm db:migrate       # Run pending migrations only
pnpm db:check         # Verify schema consistency
pnpm db:seed          # Seed database with sample data
pnpm db:studio        # Open Drizzle Studio (database GUI)
```

### **Utilities**

```bash
pnpm clean            # Clean build artifacts
pnpm check            # Run all checks (lint, type-check, format)
pnpm bundle-analyzer  # Analyze bundle size
```

## 🔧 Environment Variables

### **Required Variables**

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
AUTH_SECRET="your-auth-secret-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub
GITHUB_TOKEN="ghp_your_github_personal_access_token"

# Spotify (if enabled)
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
SPOTIFY_REFRESH_TOKEN="your-spotify-refresh-token"

# Email (Resend)
RESEND_API_KEY="re_your_resend_api_key"

# Analytics (Umami)
UMAMI_WEBSITE_ID="your-umami-website-id"
UMAMI_SCRIPT_URL="https://analytics.yourdomain.com/script.js"
```

### **Optional Variables**

```env
# AI Integration (choose one or more)
GEMINI_API_KEY="your-gemini-api-key"
OLLAMA_BASE_URL="http://localhost:11434"
ANTHROPIC_API_KEY="your-claude-api-key"

# Newsletter
CONVERTKIT_API_KEY="your-convertkit-api-key"
CONVERTKIT_FORM_ID="your-form-id"

# Translation (optional)
GOOGLE_TRANSLATE_API_KEY="your-google-translate-key"
```

### **Feature Flags**

```env
# Enable/disable features
NEXT_PUBLIC_FLAG_SPOTIFY="true"
NEXT_PUBLIC_FLAG_COMMENTS="false"
NEXT_PUBLIC_FLAG_NEWSLETTER="true"
NEXT_PUBLIC_FLAG_AI_ASSISTANT="true"
```

## 🚀 Deployment

### **Vercel (Recommended)**

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Build Settings:**

- Framework Preset: Next.js
- Build Command: `pnpm build`
- Output Directory: `apps/web/.next`
- Install Command: `pnpm install`

### **Other Platforms**

- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment with PostgreSQL
- **Docker** - Containerized deployment
- **Self-hosted** - Any Node.js hosting

### **Environment Setup**

1. Configure all required environment variables
2. Set up PostgreSQL database (or use managed service)
3. Run database migrations: `pnpm db:push:force`
4. Configure domain and SSL certificates
5. Set up monitoring and analytics

## 📊 Performance & Monitoring

### **Performance Metrics**

- **Core Web Vitals** - LCP, FID, CLS optimization
- **Bundle Analysis** - Code splitting optimization
- **Image Optimization** - WebP/AVIF formats with Next.js Image
- **Caching Strategy** - Static and dynamic caching

### **Monitoring Tools**

- **Vercel Analytics** - Performance insights and real user monitoring
- **Umami Analytics** - Privacy-focused user analytics
- **Error Tracking** - Production error monitoring via `error_tracking` table
- **Performance Metrics** - Custom metrics via `performance_metrics` table
- **API Usage Tracking** - Monitor API calls via `api_usage` table
- **Uptime Monitoring** - Service availability via `system_health_logs`

### **Database Monitoring**

- **Query Performance** - Track slow queries via `query_performance` table
- **Resource Usage** - Monitor CPU, memory, disk via `resource_usage` table
- **Alert System** - Automated alerts via `alerts` and `alert_instances` tables
- **User Activity** - Track user actions via `user_activity` table

## 🔒 Security & Privacy

### **Security Features**

- **Content Security Policy** - XSS protection
- **HTTPS Only** - Secure connections enforced
- **Input Validation** - Zod schema validation on all inputs
- **Rate Limiting** - API protection via `api_rate_limits` table
- **Authentication** - Secure user sessions with Better Auth
- **2FA Support** - Two-factor authentication via `two_factor_tokens`
- **IP Access Control** - Whitelist/blacklist via `ip_access_control`
- **Security Events** - Comprehensive logging via `security_events`
- **Account Lockout** - Brute force protection via `account_lockouts`

### **Privacy Features**

- **No Tracking** - Privacy-first analytics with Umami
- **GDPR Compliance** - Data protection and user rights
- **Cookie Consent** - User choice and transparency
- **Data Minimization** - Minimal data collection
- **PII Sanitization** - Automatic redaction in logs

## 📈 Versioning

### **Semantic Versioning**

- **Major** (1.x.x) - Breaking changes
- **Minor** (x.2.x) - New features
- **Patch** (x.x.3) - Bug fixes

### **Current Version**: 1.2.3

- **1** - Design changes
- **2** - Major tech updates
- **3** - Minor changes and bug fixes

## 🤝 Contributing

### **Development Guidelines**

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commits (enforced by commitlint)
- Maintain accessibility standards
- Follow the established code style

### **Code Quality**

- **ESLint** for code linting
- **Prettier** for code formatting
- **Pre-commit hooks** for quality checks (via lint-staged)
- **Automated testing** in CI/CD (GitHub Actions)
- **Knip** for dead code detection
- **CSpell** for spell checking

### **Commit Convention**

```bash
# Format: type(scope): subject
feat(auth): add 2FA support
fix(db): resolve constraint order issue
docs(readme): update database documentation
chore(deps): upgrade Next.js to 15.4.5
```

See `CONTRIBUTING.md` for detailed contribution guidelines.

## 📄 License

This project is under a [personal license](https://github.com/isyuricunha/website/blob/main/license.md) which allows for non-commercial use with proper credit.

**Summary:**

- ✅ Personal use
- ✅ Learning and education
- ✅ Non-commercial projects with attribution
- ❌ Commercial use without permission
- ❌ Copying AI assistant feature

## 📞 Contact

Feel free to reach out via:

- **Email**: [me@yuricunha.com](mailto:me@yuricunha.com)
- **GitHub**: [@isyuricunha](https://github.com/isyuricunha)
- **Website**: [yuricunha.com](https://yuricunha.com)

## 📸 Screenshots

### Desktop View

![Desktop](https://i.imgur.com/VQMeHTt.png)

### Mobile View

![Mobile](https://i.imgur.com/LCtrCGV.png)

## 🧪 Beta Features & Experiments

Check out my GitHub repositories for beta versions or experimental features at [isyuricunha's GitHub](https://github.com/isyuricunha?tab=repositories).

---

**Thanks for checking out my project!** 🚀

_Built with ❤️ and lots of ☕_

**Last Updated:** 2025-01-04
