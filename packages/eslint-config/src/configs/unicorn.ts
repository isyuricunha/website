import type { Linter } from 'eslint'

import { unicornPlugin } from '@/plugins'

export const unicorn: Linter.Config[] = [
  {
    name: 'tszhong0411:unicorn',
    plugins: {
      unicorn: unicornPlugin
    },
    rules: {
      ...unicornPlugin.configs.recommended.rules,
      'unicorn/no-await-expression-member': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-useless-switch-case': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-push-push': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/switch-case-braces': 'off',
      'unicorn/prefer-export-from': ['error', { ignoreUsedVariables: true }],
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-string-raw': 'off',
      'unicorn/prefer-spread': 'off'
    }
  }
]
