import { mergeConfig } from 'vitest/config'

import { sharedProjectConfig } from '../../vitest.shared'

export default mergeConfig(sharedProjectConfig, {
  test: {
    name: 'i18n',
    environment: 'node',
    include: ['src/tests/**/*.test.{ts,tsx}']
  }
})
