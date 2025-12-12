import type { Options } from '@/index'
import type { Linter } from 'eslint'

import { GLOB_TS, GLOB_TSX } from '@/globs'
import { typescriptParser, typescriptPlugin } from '@/plugins'

export const typescript = (options?: Options): Linter.Config[] => [
  {
    name: 'tszhong0411:typescript',
    plugins: {
      '@typescript-eslint': typescriptPlugin as unknown as Record<string, unknown>
    },
    files: [GLOB_TS, GLOB_TSX],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        project: options?.project,
        tsconfigRootDir: options?.tsconfigRootDir,
        sourceType: 'module'
      }
    },
    rules: {
      ...typescriptPlugin.configs['recommended-type-checked']!.rules,
      ...typescriptPlugin.configs['strict-type-checked']!.rules,
      ...typescriptPlugin.configs['stylistic-type-checked']!.rules,
      ...typescriptPlugin.configs['eslint-recommended']!.overrides![0]!.rules!,

      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/no-invalid-this': 'error',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
          ignoreVoidOperator: true,
          ignoreVoidReturningFunctions: true
        }
      ],

      '@typescript-eslint/no-require-imports': 'off',

      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',

      // Turn off due to poor performance
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off'
    }
  }
]
