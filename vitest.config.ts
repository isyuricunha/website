import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic'
    }
  },
  test: {
    projects: [
      'apps/*/vitest.config.ts',
      'packages/*/vitest.config.ts',
      'scripts/vitest.config.ts'
    ],
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov', 'html'],
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
