import type { Linter } from 'eslint'

import { sonarjsPlugin } from '@/plugins'
import { withoutDeprecatedPluginRules } from '@/rule-utils'

const rules: Linter.RulesRecord = withoutDeprecatedPluginRules(
  {
    ...sonarjsPlugin.configs.recommended.rules,
    'sonarjs/deprecation': 'off',
    'sonarjs/different-types-comparison': 'off',
    'sonarjs/cognitive-complexity': 'off',
    'sonarjs/function-return-type': 'off',
    'sonarjs/no-all-duplicated-branches': 'off',
    'sonarjs/no-alphabetical-sort': 'off',
    'sonarjs/no-hardcoded-ip': 'off',
    'sonarjs/link-with-target-blank': 'off',
    'sonarjs/no-misleading-array-reverse': 'off',
    'sonarjs/no-nested-template-literals': 'off',
    'sonarjs/no-nested-conditional': 'off',
    'sonarjs/no-dead-store': 'off',
    'sonarjs/no-redundant-jump': 'off',
    'sonarjs/no-redundant-assignments': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'sonarjs/no-nested-functions': 'off',
    'sonarjs/no-selector-parameter': 'off',
    'sonarjs/prefer-read-only-props': 'off',
    'sonarjs/pseudo-random': 'off',
    'sonarjs/slow-regex': 'off',
    'sonarjs/todo-tag': 'off'
  },
  {
    sonarjs: sonarjsPlugin
  }
)

export const sonarjs: Linter.Config[] = [
  {
    name: 'isyuricunha:sonarjs',
    plugins: {
      sonarjs: sonarjsPlugin as unknown as Record<string, unknown>
    },
    rules
  }
]
