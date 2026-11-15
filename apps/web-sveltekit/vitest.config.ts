import { defineConfig, mergeConfig } from 'vitest/config'
import { sharedProjectConfig } from '../../vitest.shared'

export default defineConfig(
  mergeConfig(
    sharedProjectConfig,
    defineConfig({
      test: {
        name: 'web-sveltekit',
        environment: 'node',
        include: ['src/tests/**/*.test.ts']
      }
    })
  )
)
