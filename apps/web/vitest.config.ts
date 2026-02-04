import react from '@vitejs/plugin-react'
import { mergeConfig } from 'vitest/config'

import { sharedProjectConfig } from '../../vitest.shared'

const resolve = (path: string) => new URL(path, import.meta.url).pathname

export default mergeConfig(sharedProjectConfig, {
  plugins: [react()],
  test: {
    name: 'web-ui',
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    exclude: [...(sharedProjectConfig.test?.exclude ?? []), 'src/tests/trpc/**'],
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
