import { defineConfig, mergeConfig } from 'vitest/config'
import { sharedProjectConfig } from '../../vitest.shared.ts'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Resolve aliases against this file, not the process cwd: the root vitest
// config loads this project with cwd at the monorepo root.
const here = fileURLToPath(new URL('.', import.meta.url))

// Package-specific aliases come first so wildcards cannot shadow them. The
// test sources use both @/ (old style) and #lib/#trpc (SvelteKit style) forms.
const aliases = [
  {
    find: '@/trpc/trpc',
    replacement: path.resolve(here, '../../packages/trpc-server/src/trpc/trpc.ts')
  },
  {
    find: '#trpc/trpc',
    replacement: path.resolve(here, '../../packages/trpc-server/src/trpc/trpc.ts')
  },
  {
    find: '@/trpc/root',
    replacement: path.resolve(here, '../../packages/trpc-server/src/trpc/root.ts')
  },
  {
    find: '#trpc/root',
    replacement: path.resolve(here, '../../packages/trpc-server/src/trpc/root.ts')
  },
  {
    find: '@/lib/auth',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/auth.ts')
  },
  {
    find: '#lib/auth',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/auth.ts')
  },
  {
    find: '@/lib/audit-logger',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/audit-logger.ts')
  },
  {
    find: '#lib/audit-logger',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/audit-logger.ts')
  },
  {
    find: '@/lib/constants',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/constants.ts')
  },
  {
    find: '#lib/constants',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/constants.ts')
  },
  {
    find: '@/lib/ip-hash',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/ip-hash.ts')
  },
  {
    find: '#lib/ip-hash',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/ip-hash.ts')
  },
  {
    find: '@/lib/logger',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/logger.ts')
  },
  {
    find: '#lib/logger',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/logger.ts')
  },
  { find: '@/lib/r2', replacement: path.resolve(here, '../../packages/trpc-server/src/lib/r2.ts') },
  { find: '#lib/r2', replacement: path.resolve(here, '../../packages/trpc-server/src/lib/r2.ts') },
  {
    find: '@/lib/ratelimit',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/ratelimit.ts')
  },
  {
    find: '#lib/ratelimit',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/ratelimit.ts')
  },
  {
    find: '@/lib/request-locale',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/request-locale.ts')
  },
  {
    find: '#lib/request-locale',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/request-locale.ts')
  },
  {
    find: '@/lib/resend',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/resend.ts')
  },
  {
    find: '#lib/resend',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/resend.ts')
  },
  {
    find: '@/lib/resend-service',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/resend-service.ts')
  },
  {
    find: '#lib/resend-service',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/resend-service.ts')
  },
  {
    find: '@/lib/secrets',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/secrets.ts')
  },
  {
    find: '#lib/secrets',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/secrets.ts')
  },
  {
    find: '@/lib/spam-detection',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/spam-detection.ts')
  },
  {
    find: '#lib/spam-detection',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/spam-detection.ts')
  },
  {
    find: '@/lib/transactional-email',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/transactional-email.ts')
  },
  {
    find: '#lib/transactional-email',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/transactional-email.ts')
  },
  {
    find: '@/lib/two-factor-crypto',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/two-factor-crypto.ts')
  },
  {
    find: '#lib/two-factor-crypto',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/two-factor-crypto.ts')
  },
  {
    find: '@/lib/privacy/account-deletion-policy',
    replacement: path.resolve(
      here,
      '../../packages/trpc-server/src/lib/privacy/account-deletion-policy.ts'
    )
  },
  {
    find: '#lib/privacy/account-deletion-policy',
    replacement: path.resolve(
      here,
      '../../packages/trpc-server/src/lib/privacy/account-deletion-policy.ts'
    )
  },
  {
    find: '@/utils/get-default-image',
    replacement: path.resolve(here, '../../packages/trpc-server/src/utils/get-default-image.ts')
  },
  {
    find: '#lib/utils/get-default-image',
    replacement: path.resolve(here, '../../packages/trpc-server/src/utils/get-default-image.ts')
  },
  {
    find: '@/utils/get-ip',
    replacement: path.resolve(here, '../../packages/trpc-server/src/utils/get-ip.ts')
  },
  {
    find: '#lib/utils/get-ip',
    replacement: path.resolve(here, '../../packages/trpc-server/src/utils/get-ip.ts')
  },
  {
    find: '@/utils/get-localized-path',
    replacement: path.resolve(here, '../../packages/trpc-server/src/utils/get-localized-path.ts')
  },
  {
    find: '#lib/utils/get-localized-path',
    replacement: path.resolve(here, '../../packages/trpc-server/src/utils/get-localized-path.ts')
  },
  {
    find: '#trpc/trpc',
    replacement: path.resolve(here, '../../packages/trpc-server/src/trpc/trpc.ts')
  },
  {
    find: '#trpc/root',
    replacement: path.resolve(here, '../../packages/trpc-server/src/trpc/root.ts')
  },
  {
    find: '#lib/auth',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/auth.ts')
  },
  {
    find: '#lib/audit-logger',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/audit-logger.ts')
  },
  {
    find: '#lib/constants',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/constants.ts')
  },
  {
    find: '#lib/ip-hash',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/ip-hash.ts')
  },
  {
    find: '#lib/logger',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/logger.ts')
  },
  { find: '#lib/r2', replacement: path.resolve(here, '../../packages/trpc-server/src/lib/r2.ts') },
  {
    find: '#lib/ratelimit',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/ratelimit.ts')
  },
  {
    find: '#lib/request-locale',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/request-locale.ts')
  },
  {
    find: '#lib/resend',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/resend.ts')
  },
  {
    find: '#lib/resend-service',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/resend-service.ts')
  },
  {
    find: '#lib/secrets',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/secrets.ts')
  },
  {
    find: '#lib/spam-detection',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/spam-detection.ts')
  },
  {
    find: '#lib/transactional-email',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/transactional-email.ts')
  },
  {
    find: '#lib/two-factor-crypto',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/two-factor-crypto.ts')
  },
  {
    find: '#lib/privacy/account-deletion-policy',
    replacement: path.resolve(
      here,
      '../../packages/trpc-server/src/lib/privacy/account-deletion-policy.ts'
    )
  },
  {
    find: '#lib/utils/get-default-image',
    replacement: path.resolve(here, '../../packages/trpc-server/src/utils/get-default-image.ts')
  },
  {
    find: '#lib/utils/get-ip',
    replacement: path.resolve(here, '../../packages/trpc-server/src/utils/get-ip.ts')
  },
  {
    find: '#lib/utils/get-localized-path',
    replacement: path.resolve(here, '../../packages/trpc-server/src/utils/get-localized-path.ts')
  },
  {
    find: 'next/navigation',
    replacement: path.resolve(here, './src/tests/stubs/next-navigation.ts')
  },
  {
    find: 'next-intl/navigation',
    replacement: path.resolve(here, './src/tests/stubs/next-intl-navigation.ts')
  },
  {
    find: 'content-collections',
    replacement: path.resolve(here, './.content-collections/generated/index.js')
  },
  {
    find: '@/trpc/routers',
    replacement: path.resolve(here, '../../packages/trpc-server/src/trpc/routers')
  },
  {
    find: '@/trpc/routers/views',
    replacement: path.resolve(here, '../../packages/trpc-server/src/trpc/routers/views.ts')
  },
  { find: '@/lib/ai', replacement: path.resolve(here, '../../packages/trpc-server/src/lib/ai') },
  {
    find: '@/lib/admin-auth',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/admin-auth.ts')
  },
  {
    find: '#lib/announcement-priority',
    replacement: path.resolve(
      here,
      '../../packages/trpc-server/src/utils/announcements/announcement-priority.ts'
    )
  },
  {
    find: '#lib/utils/announcement-storage',
    replacement: path.resolve(
      here,
      '../../packages/trpc-server/src/utils/announcements/announcement-storage.ts'
    )
  },
  {
    find: '@upstash/ratelimit',
    replacement: path.resolve(here, '../../packages/trpc-server/node_modules/@upstash/ratelimit')
  },
  {
    find: '@/lib/blog',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/blog')
  },
  {
    find: '@/lib/privacy',
    replacement: path.resolve(here, '../../packages/trpc-server/src/lib/privacy')
  },
  { find: '#lib/ai', replacement: path.resolve(here, '../../packages/trpc-server/src/lib/ai') },
  {
    find: '#trpc/routers',
    replacement: path.resolve(here, '../../packages/trpc-server/src/trpc/routers')
  },
  { find: '#lib/components', replacement: path.resolve(here, './src/lib/components') },
  { find: '#lib', replacement: path.resolve(here, './src/lib') },
  { find: '#tests', replacement: path.resolve(here, './src/tests') },
  {
    find: 'next/navigation',
    replacement: path.resolve(here, './src/tests/stubs/next-navigation.ts')
  },
  {
    find: 'next-intl/navigation',
    replacement: path.resolve(here, './src/tests/stubs/next-intl-navigation.ts')
  },
  {
    find: 'content-collections',
    replacement: path.resolve(here, './.content-collections/generated/index.js')
  },
  { find: '@', replacement: path.resolve(here, './src') }
]

export default defineConfig(
  mergeConfig(
    sharedProjectConfig,
    defineConfig({
      test: {
        name: 'web-sveltekit',
        environment: 'node',
        setupFiles: ['src/tests/setup-storage.ts'],
        include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
        // Workspace packages must run through the Vite transform, otherwise
        // their imports bypass vi mocks and hit real db/redis clients.
        server: {
          deps: {
            inline: [/@isyuricunha\/(env|db|kv|trpc-server)/]
          }
        }
      },
      resolve: { alias: aliases }
    })
  )
)
