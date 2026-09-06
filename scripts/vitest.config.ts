import { defineConfig, mergeConfig } from 'vitest/config'

import { sharedProjectConfig } from '../vitest.shared.ts'

export default mergeConfig(
  sharedProjectConfig,
  defineConfig({
    test: {
      name: 'scripts',
      environment: 'node',
      include: ['*.test.ts']
    }
  })
)
