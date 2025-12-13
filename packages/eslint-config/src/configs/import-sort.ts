import type { Linter } from 'eslint'

import { simpleImportSortPlugin } from '@/plugins'

export const importSort: Linter.Config[] = [
  {
    name: 'isyuricunha:import-sort',
    plugins: {
      'simple-import-sort': simpleImportSortPlugin
    },
    rules: {
      'simple-import-sort/imports': 'off',
      'simple-import-sort/exports': 'off'
    }
  }
]
