import { defineConfig, mergeConfig } from 'vitest/config'
import { sharedProjectConfig } from '../../vitest.shared.ts'
import { resolve } from 'node:path'

// Package-specific aliases come first so wildcards cannot shadow them. The
// test sources use both @/ (old style) and #lib/#trpc (SvelteKit style) forms.
const aliases = [
  { find: '@/trpc/trpc', replacement: resolve('../../packages/trpc-server/src/trpc/trpc.ts') },
  { find: '#trpc/trpc', replacement: resolve('../../packages/trpc-server/src/trpc/trpc.ts') },
  { find: '@/trpc/root', replacement: resolve('../../packages/trpc-server/src/trpc/root.ts') },
  { find: '#trpc/root', replacement: resolve('../../packages/trpc-server/src/trpc/root.ts') },
  { find: '@/lib/auth', replacement: resolve('../../packages/trpc-server/src/lib/auth.ts') },
  { find: '#lib/auth', replacement: resolve('../../packages/trpc-server/src/lib/auth.ts') },
  {
    find: '@/lib/audit-logger',
    replacement: resolve('../../packages/trpc-server/src/lib/audit-logger.ts')
  },
  {
    find: '#lib/audit-logger',
    replacement: resolve('../../packages/trpc-server/src/lib/audit-logger.ts')
  },
  {
    find: '@/lib/constants',
    replacement: resolve('../../packages/trpc-server/src/lib/constants.ts')
  },
  {
    find: '#lib/constants',
    replacement: resolve('../../packages/trpc-server/src/lib/constants.ts')
  },
  { find: '@/lib/ip-hash', replacement: resolve('../../packages/trpc-server/src/lib/ip-hash.ts') },
  { find: '#lib/ip-hash', replacement: resolve('../../packages/trpc-server/src/lib/ip-hash.ts') },
  { find: '@/lib/logger', replacement: resolve('../../packages/trpc-server/src/lib/logger.ts') },
  { find: '#lib/logger', replacement: resolve('../../packages/trpc-server/src/lib/logger.ts') },
  { find: '@/lib/r2', replacement: resolve('../../packages/trpc-server/src/lib/r2.ts') },
  { find: '#lib/r2', replacement: resolve('../../packages/trpc-server/src/lib/r2.ts') },
  {
    find: '@/lib/ratelimit',
    replacement: resolve('../../packages/trpc-server/src/lib/ratelimit.ts')
  },
  {
    find: '#lib/ratelimit',
    replacement: resolve('../../packages/trpc-server/src/lib/ratelimit.ts')
  },
  {
    find: '@/lib/request-locale',
    replacement: resolve('../../packages/trpc-server/src/lib/request-locale.ts')
  },
  {
    find: '#lib/request-locale',
    replacement: resolve('../../packages/trpc-server/src/lib/request-locale.ts')
  },
  { find: '@/lib/resend', replacement: resolve('../../packages/trpc-server/src/lib/resend.ts') },
  { find: '#lib/resend', replacement: resolve('../../packages/trpc-server/src/lib/resend.ts') },
  {
    find: '@/lib/resend-service',
    replacement: resolve('../../packages/trpc-server/src/lib/resend-service.ts')
  },
  {
    find: '#lib/resend-service',
    replacement: resolve('../../packages/trpc-server/src/lib/resend-service.ts')
  },
  { find: '@/lib/secrets', replacement: resolve('../../packages/trpc-server/src/lib/secrets.ts') },
  { find: '#lib/secrets', replacement: resolve('../../packages/trpc-server/src/lib/secrets.ts') },
  {
    find: '@/lib/spam-detection',
    replacement: resolve('../../packages/trpc-server/src/lib/spam-detection.ts')
  },
  {
    find: '#lib/spam-detection',
    replacement: resolve('../../packages/trpc-server/src/lib/spam-detection.ts')
  },
  {
    find: '@/lib/transactional-email',
    replacement: resolve('../../packages/trpc-server/src/lib/transactional-email.ts')
  },
  {
    find: '#lib/transactional-email',
    replacement: resolve('../../packages/trpc-server/src/lib/transactional-email.ts')
  },
  {
    find: '@/lib/two-factor-crypto',
    replacement: resolve('../../packages/trpc-server/src/lib/two-factor-crypto.ts')
  },
  {
    find: '#lib/two-factor-crypto',
    replacement: resolve('../../packages/trpc-server/src/lib/two-factor-crypto.ts')
  },
  {
    find: '@/lib/privacy/account-deletion-policy',
    replacement: resolve('../../packages/trpc-server/src/lib/privacy/account-deletion-policy.ts')
  },
  {
    find: '#lib/privacy/account-deletion-policy',
    replacement: resolve('../../packages/trpc-server/src/lib/privacy/account-deletion-policy.ts')
  },
  {
    find: '@/utils/get-default-image',
    replacement: resolve('../../packages/trpc-server/src/utils/get-default-image.ts')
  },
  {
    find: '#lib/utils/get-default-image',
    replacement: resolve('../../packages/trpc-server/src/utils/get-default-image.ts')
  },
  {
    find: '@/utils/get-ip',
    replacement: resolve('../../packages/trpc-server/src/utils/get-ip.ts')
  },
  {
    find: '#lib/utils/get-ip',
    replacement: resolve('../../packages/trpc-server/src/utils/get-ip.ts')
  },
  {
    find: '@/utils/get-localized-path',
    replacement: resolve('../../packages/trpc-server/src/utils/get-localized-path.ts')
  },
  {
    find: '#lib/utils/get-localized-path',
    replacement: resolve('../../packages/trpc-server/src/utils/get-localized-path.ts')
  },
  { find: '#trpc/trpc', replacement: resolve('../../packages/trpc-server/src/trpc/trpc.ts') },
  { find: '#trpc/root', replacement: resolve('../../packages/trpc-server/src/trpc/root.ts') },
  { find: '#lib/auth', replacement: resolve('../../packages/trpc-server/src/lib/auth.ts') },
  {
    find: '#lib/audit-logger',
    replacement: resolve('../../packages/trpc-server/src/lib/audit-logger.ts')
  },
  {
    find: '#lib/constants',
    replacement: resolve('../../packages/trpc-server/src/lib/constants.ts')
  },
  { find: '#lib/ip-hash', replacement: resolve('../../packages/trpc-server/src/lib/ip-hash.ts') },
  { find: '#lib/logger', replacement: resolve('../../packages/trpc-server/src/lib/logger.ts') },
  { find: '#lib/r2', replacement: resolve('../../packages/trpc-server/src/lib/r2.ts') },
  {
    find: '#lib/ratelimit',
    replacement: resolve('../../packages/trpc-server/src/lib/ratelimit.ts')
  },
  {
    find: '#lib/request-locale',
    replacement: resolve('../../packages/trpc-server/src/lib/request-locale.ts')
  },
  { find: '#lib/resend', replacement: resolve('../../packages/trpc-server/src/lib/resend.ts') },
  {
    find: '#lib/resend-service',
    replacement: resolve('../../packages/trpc-server/src/lib/resend-service.ts')
  },
  { find: '#lib/secrets', replacement: resolve('../../packages/trpc-server/src/lib/secrets.ts') },
  {
    find: '#lib/spam-detection',
    replacement: resolve('../../packages/trpc-server/src/lib/spam-detection.ts')
  },
  {
    find: '#lib/transactional-email',
    replacement: resolve('../../packages/trpc-server/src/lib/transactional-email.ts')
  },
  {
    find: '#lib/two-factor-crypto',
    replacement: resolve('../../packages/trpc-server/src/lib/two-factor-crypto.ts')
  },
  {
    find: '#lib/privacy/account-deletion-policy',
    replacement: resolve('../../packages/trpc-server/src/lib/privacy/account-deletion-policy.ts')
  },
  {
    find: '#lib/utils/get-default-image',
    replacement: resolve('../../packages/trpc-server/src/utils/get-default-image.ts')
  },
  {
    find: '#lib/utils/get-ip',
    replacement: resolve('../../packages/trpc-server/src/utils/get-ip.ts')
  },
  {
    find: '#lib/utils/get-localized-path',
    replacement: resolve('../../packages/trpc-server/src/utils/get-localized-path.ts')
  },
  { find: '@', replacement: resolve('./src') },
  { find: 'next/navigation', replacement: resolve('./src/tests/stubs/next-navigation.ts') },
  {
    find: 'next-intl/navigation',
    replacement: resolve('./src/tests/stubs/next-intl-navigation.ts')
  },
  {
    find: 'content-collections',
    replacement: resolve('./.content-collections/generated/index.js')
  },
  {
    find: /^@\/trpc\/routers\/(.*)$/,
    replacement: resolve('../../packages/trpc-server/src/trpc/routers/$1')
  },
  { find: /^@\/lib\/ai\/(.*)$/, replacement: resolve('../../packages/trpc-server/src/lib/ai/$1') },
  { find: /^#lib\/ai\/(.*)$/, replacement: resolve('../../packages/trpc-server/src/lib/ai/$1') },
  {
    find: /^#trpc\/routers\/(.*)$/,
    replacement: resolve('../../packages/trpc-server/src/trpc/routers/$1')
  },
  { find: '@', replacement: resolve('./src') },
  { find: /^#lib\/components\/(.*)$/, replacement: resolve('./src/lib/components/$1') },
  { find: /^#lib\/(.*)$/, replacement: resolve('./src/lib/$1') },
  { find: /^#tests\/(.*)$/, replacement: resolve('./src/tests/$1') },
  { find: 'next/navigation', replacement: resolve('./src/tests/stubs/next-navigation.ts') },
  {
    find: 'next-intl/navigation',
    replacement: resolve('./src/tests/stubs/next-intl-navigation.ts')
  },
  { find: 'content-collections', replacement: resolve('./.content-collections/generated/index.js') }
]

export default defineConfig(
  mergeConfig(
    sharedProjectConfig,
    defineConfig({
      test: {
        name: 'web-sveltekit',
        environment: 'node',
        include: ['src/tests/**/*.test.ts']
      },
      resolve: { alias: aliases }
    })
  )
)
