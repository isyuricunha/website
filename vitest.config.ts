import { coverageConfigDefaults, defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  esbuild: {
    jsx: 'automatic'
  },
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL('apps/web/src/', import.meta.url))
      },
      {
        find: /^content-collections$/,
        replacement: fileURLToPath(
          new URL('apps/web/.content-collections/generated/', import.meta.url)
        )
      }
    ]
  },
  test: {
    projects: [
      'apps/*/vitest.config.ts',
      'apps/web/vitest.trpc.config.ts',
      'packages/*/vitest.config.ts'
    ],
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov', 'html'],
      all: true,
      provider: 'v8',
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/dist/**',
        '**/coverage/**',
        '**/fixtures/**',
        '**/tests/**',
        './turbo/**',
        './scripts/**'
      ]
    }
  }
})
