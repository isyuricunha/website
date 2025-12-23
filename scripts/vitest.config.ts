import { defineConfig, mergeConfig } from 'vitest/config'

import { sharedProjectConfig } from '../vitest.shared'

export default mergeConfig(
  sharedProjectConfig,
  defineConfig({
    test: {
      name: 'scripts',
      environment: 'node',
      include: ['scripts/**/*.test.ts']
    }
  })
)
