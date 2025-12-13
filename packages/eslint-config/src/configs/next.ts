import type { Linter } from 'eslint'

import { nextPlugin } from '@/plugins'

export const next: Linter.Config[] = [
  {
    name: 'isyuricunha:next',
    plugins: {
      '@next/next': nextPlugin as unknown as any
    },
    rules: {
      ...(nextPlugin.configs.recommended.rules as unknown as Linter.RulesRecord),
      ...(nextPlugin.configs['core-web-vitals'].rules as unknown as Linter.RulesRecord),

      '@next/next/no-html-link-for-pages': 'off'
    }
  }
]
