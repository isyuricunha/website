import type { Linter } from 'eslint'

import { turboPlugin } from '@/plugins'

export const turbo: Linter.Config[] = [
  {
    name: 'tszhong0411:turbo',
    plugins: {
      turbo: turboPlugin
    },
    rules: {
      ...turboPlugin.configs.recommended.rules
    }
  }
]
