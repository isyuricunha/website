import { mergeConfig } from 'vitest/config'

import { sharedProjectConfig } from '../../vitest.shared'

const resolve = (path: string) => new URL(path, import.meta.url).pathname

export default mergeConfig(sharedProjectConfig, {
  test: {
    name: 'web-trpc',
    environment: 'node',
    include: ['src/tests/trpc/**/*.test.{ts,tsx}'],
    exclude: [...(sharedProjectConfig.test?.exclude ?? [])]
  },
  resolve: {
    alias: {
      '@': resolve('./src'),
      'content-collections': resolve('./.content-collections/generated/index.js')
    }
  }
})
