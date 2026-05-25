import type { Linter } from 'eslint'

import { unicornPlugin } from '@/plugins'
import { withoutDeprecatedPluginRules } from '@/rule-utils'

const rules: Linter.RulesRecord = withoutDeprecatedPluginRules(
  {
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
    'unicorn/prefer-string-replace-all': 'off',
    'unicorn/switch-case-braces': 'off',
    'unicorn/prefer-export-from': ['error', { ignoreUsedVariables: true }],
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/prefer-string-raw': 'off',
    'unicorn/prefer-spread': 'off'
  },
  {
    unicorn: unicornPlugin
  }
)

export const unicorn: Linter.Config[] = [
  {
    name: 'isyuricunha:unicorn',
    plugins: {
      unicorn: unicornPlugin
    },
    rules
  }
]
