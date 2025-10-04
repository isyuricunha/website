# Personal Portfolio Website

Welcome to my personal portfolio website! Explore my work by visiting [yuricunha.com](https://yuricunha.com/).

## 🚨 Important Disclaimer

**Note**: This project contains a personal AI assistant feature that is my own creation and intellectual property. Please do not copy, reproduce, or implement similar AI assistant features without explicit permission. This is my personal AI/bot and should be respected as such.

## 📋 Project Overview

This project began as an adaptation of [Nelson Lai site](https://github.com/tszhong0411) but has evolved significantly into a comprehensive, modern web application with advanced features, integrations, and a robust tech stack.

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
- **PostgreSQL** - Primary database
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
│       │   │   ├── ai/          # AI service (Gemini/Ollama)
│       │   │   ├── audit-logger.ts
│       │   │   ├── logger.ts    # 🆕 Structured logger
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
│   │   │   ├── schema/          # Drizzle schemas
│   │   │   ├── migrations/      # SQL migrations
│   │   │   ├── index.ts         # Database exports
│   │   │   └── seed.ts          # Database seeding
│   │   └── drizzle.config.ts
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
│   └── kv/                      # Redis/KV storage
│
├── fresh-install-sql/           # Database setup scripts
│   └── complete-fresh-install.sql
│
├── fix-error-tracking-column.sql
├── sample-announcements.sql
├── SQL_QUERIES_REFERENCE.md     # 🆕 SQL documentation
├── .env.example                 # Environment template
├── turbo.json                   # Turborepo config
├── package.json                 # Root dependencies
└── pnpm-workspace.yaml          # PNPM workspace config
```

### **Key Directories Explained**

#### **apps/web/src/lib/**
- `logger.ts` - **NEW**: Structured logger with automatic PII sanitization
- `audit-logger.ts` - Tracks admin actions and system events
- `resend-service.ts` - Email campaign and newsletter management
- `ai/ai-service.ts` - AI integration (Gemini/Ollama support)

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
- Complete schema definitions
- Type-safe queries
- Migration management
- Seeding utilities

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

## 🗄️ Database & SQL

### **Database Architecture**
- **Primary:** PostgreSQL (Supabase)
- **ORM:** Drizzle ORM 0.44.4
- **Migrations:** Automated via drizzle-kit
- **Schema Management:** Auto-generated from Supabase
- **Seeding:** Custom seed scripts

### **Schema Synchronization** 🆕
The database schema is automatically synchronized with Supabase:

```bash
# Pull latest schema from Supabase (generates TypeScript schemas)
cd packages/db
pnpm db:pull

# Check schema consistency
pnpm db:check

# Push local schema changes to database
pnpm db:push

# Force push without interactive prompts (Windows PowerShell)
pnpm db:push:force
```

**Important Notes:**
- Schema files are auto-generated in `packages/db/src/migrations/`
- `schema.ts` contains all 48 tables with 28 ENUMs
- `relations.ts` contains all foreign key relationships
- `drizzle.config.ts` points to the generated schema as source of truth
- Never manually edit generated schema files - use `pnpm db:pull` to regenerate

### **SQL Documentation** 🆕
Complete SQL reference available in:
- **`SQL_QUERIES_REFERENCE.md`** - Common queries, examples, maintenance commands
- **`SCHEMA_DATABASE_README.md`** - Schema execution guide and documentation
- **`CRITICAL_SCHEMA_ANALYSIS.md`** - Schema validation and sync status
- **`database-schema-*.sql`** - Modular executable schema files (7 files)

### **Database Schema Files**
Modular schema organization (execute in order):
1. `database-schema-enums.sql` - All 35 ENUM types
2. `database-schema-tables.sql` - Core tables (users, posts, comments)
3. `database-schema-security.sql` - Security tables (2FA, IP control, events)
4. `database-schema-monitoring.sql` - Monitoring tables (metrics, errors, analytics)
5. `database-schema-communication.sql` - Communication tables (emails, announcements)
6. `database-schema-data-management.sql` - Data management (backups, exports, migrations)
7. `database-schema-indexes.sql` - Performance indexes

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

### **Known Issues & Solutions**

#### **Windows PowerShell Interactive Prompts**
When running `pnpm db:push`, PowerShell may not render interactive prompts correctly. Use:
```bash
pnpm db:push:force  # Skips all prompts
```

#### **Foreign Key Constraint Order**
If you encounter `there is no unique constraint matching given keys` error:
- The schema auto-generated by `drizzle-kit pull` may have constraint order issues
- Solution: Unique constraints are now defined inline (e.g., `slug: text().notNull().unique()`)
- This ensures proper execution order during schema push

## 🌍 Internationalization (i18n)

### **Supported Languages**
- English (en)
- Portuguese (pt)
- French (fr)
- German (de)
- Chinese (zh)

### **i18n Features**
- **next-intl** - Internationalization framework
- **Dynamic routing** - Language-specific URLs
- **Content translation** - All UI elements translated
- **SEO optimization** - Language-specific meta tags
- **RTL support** - Right-to-left language support

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

### **Newsletter Integration**
- **ConvertKit API** - Newsletter management
- **Mailerlite compatibility** - Alternative provider support
- **Subscription forms** - Embedded signup
- **Analytics** - Subscription tracking

### **Analytics & Privacy**
- **Umami** - Privacy-focused analytics
- **DuckDuckGo Proxy** - Enhanced privacy
- **Vercel Speed Insights** - Performance monitoring
- **No Google Analytics** - Privacy-first approach

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
- **Performance Optimization** - Core Web Vitals

### **Interactive Elements**
- **Comments System** - User engagement (currently deactivated)
- **Guestbook** - Visitor messages
- **Contact Forms** - Email integration
- **Social Sharing** - Dynamic meta tags
- **Confetti Effects** - Celebration animations
- **Mascot & AI** - Mascot with quotes (lang and page based) & integrated AI (Ollama/LLama/Gemini/Claude)

### **SEO & Performance**
- **Dynamic Meta Tags** - SEO optimization
- **Structured Data** - Rich snippets
- **Sitemap Generation** - Search engine indexing
- **Robots.txt** - Crawler directives
- **Bundle Analysis** - Performance monitoring
- **Code Splitting** - Optimized loading

## 🛠️ Development Setup

### **Prerequisites**
- **Node.js** >= 22
- **pnpm** 10.14.0 (package manager)
- **PostgreSQL** (for database)

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
   # Configure your environment variables
   ```

4. **Database setup**
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

### **Available Scripts**

```bash
# Development
pnpm dev              # Start development server
pnpm dev:web          # Start web app only
pnpm dev:packages     # Start packages only

# Building
pnpm build            # Build all packages
pnpm build:apps       # Build applications
pnpm build:packages   # Build packages
pnpm build:mdx        # Build MDX content

# Testing
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:unit:ui     # Run unit tests with UI
pnpm test:e2e:ui      # Run E2E tests with UI

# Code Quality
pnpm lint             # Run linter
pnpm lint:fix         # Fix linting issues
pnpm type-check       # TypeScript checking
pnpm format:check     # Check formatting
pnpm format:write     # Fix formatting

# Database
pnpm db:pull          # Pull schema from Supabase (auto-generate TypeScript)
pnpm db:generate      # Generate migrations from schema changes
pnpm db:push          # Push schema changes to database
pnpm db:push:force    # Push without interactive prompts (Windows)
pnpm db:migrate       # Run migrations
pnpm db:check         # Verify schema consistency
pnpm db:seed          # Seed database
pnpm db:studio        # Open database studio

# Utilities
pnpm clean            # Clean build artifacts
pnpm check            # Run all checks
pnpm bundle-analyzer  # Analyze bundle size
```

## 🔧 Environment Variables

### **Required Variables**
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
AUTH_SECRET="your-auth-secret"

# GitHub
GITHUB_TOKEN="your-github-token"

# Spotify (if enabled)
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
SPOTIFY_REFRESH_TOKEN="your-spotify-refresh-token"

# Email
RESEND_API_KEY="your-resend-api-key"

# Analytics
UMAMI_WEBSITE_ID="your-umami-id"
UMAMI_SCRIPT_URL="your-umami-script-url"
```

### **Feature Flags**
```env
# Enable/disable features
NEXT_PUBLIC_FLAG_SPOTIFY="true"
NEXT_PUBLIC_FLAG_COMMENTS="false"
NEXT_PUBLIC_FLAG_NEWSLETTER="true"
```

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### **Other Platforms**
- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment
- **Docker** - Containerized deployment

### **Environment Setup**
- Configure all required environment variables
- Set up PostgreSQL database
- Configure domain and SSL certificates
- Set up monitoring and analytics

## 📊 Performance & Monitoring

### **Performance Metrics**
- **Core Web Vitals** - LCP, FID, CLS
- **Bundle Analysis** - Code splitting optimization
- **Image Optimization** - WebP/AVIF formats
- **Caching Strategy** - Static and dynamic caching

### **Monitoring Tools**
- **Vercel Analytics** - Performance insights
- **Umami Analytics** - Privacy-focused tracking
- **Error Tracking** - Production error monitoring
- **Uptime Monitoring** - Service availability

## 🔒 Security & Privacy

### **Security Features**
- **Content Security Policy** - XSS protection
- **HTTPS Only** - Secure connections
- **Input Validation** - Zod schema validation
- **Rate Limiting** - API protection
- **Authentication** - Secure user sessions

### **Privacy Features**
- **No Tracking** - Privacy-first analytics
- **GDPR Compliance** - Data protection
- **Cookie Consent** - User choice
- **Data Minimization** - Minimal data collection

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
- Use conventional commits
- Maintain accessibility standards
- Follow the established code style

### **Code Quality**
- ESLint for code linting
- Prettier for formatting
- Pre-commit hooks for quality checks
- Automated testing in CI/CD

## 📄 License

This project is under a [personal license](https://github.com/isyuricunha/website/blob/main/license.md) which allows for non-commercial use with proper credit.

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

*Built with ❤️ and lots of ☕*
