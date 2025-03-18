import type { Linter } from 'eslint'

import { sonarjsPlugin } from '@/plugins'

export const sonarjs: Linter.Config[] = [
  {
    name: 'tszhong0411:sonarjs',
    plugins: {
      sonarjs: sonarjsPlugin as unknown as Record<string, unknown>
    },
    rules: {
      ...sonarjsPlugin.configs.recommended.rules,
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/pseudo-random': 'off'
    }
  }
]
