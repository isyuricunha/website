# Personal Portfolio Website

Welcome to my personal portfolio website! Explore my work by visiting [yuricunha.com](https://yuricunha.com/).

## 🚨 Important Disclaimer

**Note**: This project contains a personal AI assistant feature that is my own creation and intellectual property. Please do not copy, reproduce, or implement similar AI assistant features without explicit permission. This is my personal AI/bot and should be respected as such.

## 📋 Project Overview

This project began as an adaptation of [Michael's site](https://github.com/mah51) but has evolved significantly into a comprehensive, modern web application with advanced features, integrations, and a robust tech stack.

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
pnpm db:generate      # Generate database client
pnpm db:push          # Push schema changes
pnpm db:migrate       # Run migrations
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
- **Email**: [yuri@yuricunha.com](mailto:yuri@yuricunha.com)
- **GitHub**: [@isyuricunha](https://github.com/isyuricunha)
- **Website**: [yuricunha.com](https://yuricunha.com)

## 📸 Screenshots

### Desktop View
![Desktop](https://i.imgur.com/lB9KLgw.png)

### Mobile View
![Mobile](https://i.imgur.com/2iBdfJk.png)

## 🧪 Beta Features & Experiments

Check out my GitHub repositories for beta versions or experimental features at [isyuricunha's GitHub](https://github.com/isyuricunha?tab=repositories).

---

**Thanks for checking out my project!** 🚀

*Built with ❤️ and lots of ☕*
