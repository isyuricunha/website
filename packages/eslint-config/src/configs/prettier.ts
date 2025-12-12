import type { Linter } from 'eslint'

import { prettierConfig } from '@/plugins'

export const prettier: Linter.Config[] = [
  {
    name: 'tszhong0411:prettier',
    rules: {
      // Avoid conflicts
      ...prettierConfig.rules,
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off'
    }
  }
]
