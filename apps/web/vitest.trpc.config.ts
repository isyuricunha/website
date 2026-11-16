import { mergeConfig } from 'vitest/config'

import { sharedProjectConfig } from '../../vitest.shared.ts'

const resolve = (path: string) => new URL(path, import.meta.url).pathname

export default mergeConfig(sharedProjectConfig, {
  test: {
    name: 'web-trpc',
    environment: 'node',
    include: ['src/tests/trpc/**/*.test.{ts,tsx}'],
    exclude: [...(sharedProjectConfig.test?.exclude ?? [])],
    deps: {
      inline: ['next-intl']
    }
  },
  resolve: {
    alias: [
      { find: /^@\/lib\/contact$/, replacement: resolve('../../packages/trpc-server/src/server/contact.ts') },
      { find: /^@\/lib\/newsletter\/subscribe$/, replacement: resolve('../../packages/trpc-server/src/server/newsletter/subscribe.ts') },
      { find: /^@\/lib\/newsletter\/confirm$/, replacement: resolve('../../packages/trpc-server/src/server/newsletter/confirm.ts') },
      { find: /^@\/lib\/newsletter\/unsubscribe$/, replacement: resolve('../../packages/trpc-server/src/server/newsletter/unsubscribe.ts') },
      { find: /^@\/lib\/account\/data-export$/, replacement: resolve('../../packages/trpc-server/src/server/account/data-export.ts') },
      { find: /^@\/lib\/ai\/feedback$/, replacement: resolve('../../packages/trpc-server/src/server/ai/feedback.ts') },
      { find: /^@\/lib\/ai\/content$/, replacement: resolve('../../packages/trpc-server/src/server/ai/content.ts') },
      { find: /^@\/lib\/admin\/posts$/, replacement: resolve('../../packages/trpc-server/src/server/admin/posts.ts') },
      { find: /^@\/lib\/admin\/translate$/, replacement: resolve('../../packages/trpc-server/src/server/admin/translate.ts') },
      { find: /^@\/trpc\/routers\/(.*)$/, replacement: resolve('../../packages/trpc-server/src/trpc/routers/$1') },
      { find: /^@\/lib\/ai\/chat$/, replacement: resolve('../../packages/trpc-server/src/server/ai/chat.ts') },
      { find: /^@\/lib\/ai\/(.*)$/, replacement: resolve('../../packages/trpc-server/src/lib/ai/$1') },
      { find: '@/trpc/trpc', replacement: resolve('../../packages/trpc-server/src/trpc/trpc.ts') },
      { find: '@/trpc/root', replacement: resolve('../../packages/trpc-server/src/trpc/root.ts') },
      { find: '@/lib/auth', replacement: resolve('../../packages/trpc-server/src/lib/auth.ts') },
      { find: '@/lib/audit-logger', replacement: resolve('../../packages/trpc-server/src/lib/audit-logger.ts') },
      { find: '@/lib/constants', replacement: resolve('../../packages/trpc-server/src/lib/constants.ts') },
      { find: '@/lib/ip-hash', replacement: resolve('../../packages/trpc-server/src/lib/ip-hash.ts') },
      { find: '@/lib/logger', replacement: resolve('../../packages/trpc-server/src/lib/logger.ts') },
      { find: '@/lib/r2', replacement: resolve('../../packages/trpc-server/src/lib/r2.ts') },
      { find: '@/lib/ratelimit', replacement: resolve('../../packages/trpc-server/src/lib/ratelimit.ts') },
      { find: /^@\/lib\/blog\/blog-service$/, replacement: resolve('../../packages/trpc-server/src/lib/blog/blog-service.ts') },
      { find: /^@\/lib\/admin-auth$/, replacement: resolve('../../packages/trpc-server/src/lib/admin-auth.ts') },
      { find: /^@\/lib\/rate-limit-keys$/, replacement: resolve('../../packages/trpc-server/src/lib/rate-limit-keys.ts') },
      { find: /^@\/lib\/privacy\/create-privacy-data-export$/, replacement: resolve('../../packages/trpc-server/src/lib/privacy/create-privacy-data-export.ts') },
      { find: /^@\/lib\/cron\/alerts$/, replacement: resolve('../../packages/trpc-server/src/server/cron/alerts.ts') },
      { find: /^@\/lib\/cron\/data-retention$/, replacement: resolve('../../packages/trpc-server/src/server/cron/data-retention.ts') },
      { find: /^@\/lib\/contact$/, replacement: resolve('../../packages/trpc-server/src/server/contact.ts') },
      { find: /^@\/lib\/newsletter\/subscribe$/, replacement: resolve('../../packages/trpc-server/src/server/newsletter/subscribe.ts') },
      { find: /^@\/lib\/newsletter\/confirm$/, replacement: resolve('../../packages/trpc-server/src/server/newsletter/confirm.ts') },
      { find: /^@\/lib\/newsletter\/unsubscribe$/, replacement: resolve('../../packages/trpc-server/src/server/newsletter/unsubscribe.ts') },
      { find: /^@\/lib\/account\/data-export$/, replacement: resolve('../../packages/trpc-server/src/server/account/data-export.ts') },
      { find: /^@\/lib\/ai\/feedback$/, replacement: resolve('../../packages/trpc-server/src/server/ai/feedback.ts') },
      { find: /^@\/lib\/ai\/content$/, replacement: resolve('../../packages/trpc-server/src/server/ai/content.ts') },
      { find: /^@\/lib\/admin\/posts$/, replacement: resolve('../../packages/trpc-server/src/server/admin/posts.ts') },
      { find: /^@\/lib\/admin\/translate$/, replacement: resolve('../../packages/trpc-server/src/server/admin/translate.ts') },
      { find: '@/lib/request-locale', replacement: resolve('../../packages/trpc-server/src/lib/request-locale.ts') },
      { find: '@/lib/resend', replacement: resolve('../../packages/trpc-server/src/lib/resend.ts') },
      { find: '@/lib/resend-service', replacement: resolve('../../packages/trpc-server/src/lib/resend-service.ts') },
      { find: '@/lib/secrets', replacement: resolve('../../packages/trpc-server/src/lib/secrets.ts') },
      { find: '@/lib/spam-detection', replacement: resolve('../../packages/trpc-server/src/lib/spam-detection.ts') },
      { find: '@/lib/transactional-email', replacement: resolve('../../packages/trpc-server/src/lib/transactional-email.ts') },
      { find: '@/lib/two-factor-crypto', replacement: resolve('../../packages/trpc-server/src/lib/two-factor-crypto.ts') },
      { find: '@/lib/privacy/account-deletion-policy', replacement: resolve('../../packages/trpc-server/src/lib/privacy/account-deletion-policy.ts') },
      { find: '@/utils/get-default-image', replacement: resolve('../../packages/trpc-server/src/utils/get-default-image.ts') },
      { find: '@/utils/get-ip', replacement: resolve('../../packages/trpc-server/src/utils/get-ip.ts') },
      { find: '@/utils/get-localized-path', replacement: resolve('../../packages/trpc-server/src/utils/get-localized-path.ts') },
      { find: '@', replacement: resolve('./src') },
      { find: 'next/navigation', replacement: resolve('./src/tests/stubs/next-navigation.ts') },
      { find: 'next-intl/navigation', replacement: resolve('./src/tests/stubs/next-intl-navigation.ts') },
      { find: 'content-collections', replacement: resolve('./.content-collections/generated/index.js') }
    ]


  }
})
