import { mergeConfig } from 'vitest/config'

import { sharedProjectConfig } from '../../vitest.shared'

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
    alias: {
      '@': resolve('./src'),
      'next/navigation': resolve('./src/tests/stubs/next-navigation.ts'),
      'next-intl/navigation': resolve('./src/tests/stubs/next-intl-navigation.ts'),
      'content-collections': resolve('./.content-collections/generated/index.js')
    }
  }
})
