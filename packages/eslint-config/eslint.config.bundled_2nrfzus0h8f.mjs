// dist/chunk-KLT7SCSF.js
var GLOB_SRC_EXT = '?([cm])[jt]s?(x)'
var GLOB_JS = '**/*.?([cm])js'
var GLOB_JSX = '**/*.?([cm])jsx'
var GLOB_TS = '**/*.?([cm])ts'
var GLOB_TSX = '**/*.?([cm])tsx'
var GLOB_E2E = `**/e2e/**/*.{test,spec}.${GLOB_SRC_EXT}`
var GLOB_TEST = `**/tests/**/*.{test,spec}.${GLOB_SRC_EXT}`
var GLOB_EXCLUDE = [
  '**/node_modules',
  '**/dist',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/bun.lockb',
  '**/output',
  '**/coverage',
  '**/temp',
  '**/.temp',
  '**/tmp',
  '**/.tmp',
  '**/.history',
  '**/.next',
  '**/.vercel',
  '**/.changeset',
  '**/.cache',
  '**/CHANGELOG*.md',
  '**/LICENSE*'
]

// dist/chunk-EVFEIXMB.js
import { default as default2 } from '@eslint/js'
import { default as default3 } from '@eslint-react/eslint-plugin'
import { default as default4 } from '@next/eslint-plugin-next'
import { default as default5 } from '@typescript-eslint/eslint-plugin'
import { default as default6 } from '@typescript-eslint/parser'
import { default as default7 } from 'eslint-config-prettier'
import { default as default8 } from 'eslint-plugin-eslint-comments'
import * as importPlugin from 'eslint-plugin-import'
import { default as default9 } from 'eslint-plugin-jsx-a11y'
import { default as default10 } from 'eslint-plugin-playwright'
import { default as default11 } from 'eslint-plugin-prettier'
import { default as default12 } from 'eslint-plugin-react-hooks'
import { default as default13 } from 'eslint-plugin-simple-import-sort'
import * as sonarjsPlugin from 'eslint-plugin-sonarjs'
import { default as default14 } from 'eslint-plugin-testing-library'
import * as turboPlugin from 'eslint-plugin-turbo'
import { default as default15 } from 'eslint-plugin-unicorn'
import { default as default16 } from 'eslint-plugin-unused-imports'

// dist/chunk-Q67Y2PJA.js
var typescript = (options) => [
  {
    name: 'tszhong0411:typescript',
    plugins: {
      '@typescript-eslint': default5
    },
    files: [GLOB_TS, GLOB_TSX],
    languageOptions: {
      parser: default6,
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
      ...default5.configs['recommended-type-checked'].rules,
      ...default5.configs['strict-type-checked'].rules,
      ...default5.configs['stylistic-type-checked'].rules,
      ...default5.configs['eslint-recommended'].overrides[0].rules,
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-invalid-this': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports'
        }
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
          ignoreVoidOperator: true,
          ignoreVoidReturningFunctions: true
        }
      ],
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Turn off due to poor performance
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off'
    }
  }
]

// dist/chunk-YGQSUSG7.js
var unicorn = [
  {
    name: 'tszhong0411:unicorn',
    plugins: {
      unicorn: default15
    },
    rules: {
      ...default15.configs.recommended.rules,
      'unicorn/no-await-expression-member': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-export-from': ['error', { ignoreUsedVariables: true }],
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-string-raw': 'off',
      'unicorn/prefer-spread': 'off'
    }
  }
]

// dist/chunk-3MS64ZJH.js
var next = [
  {
    name: 'tszhong0411:next',
    plugins: {
      '@next/next': default4
    },
    rules: {
      ...default4.configs.recommended.rules,
      ...default4.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': 'off'
    }
  }
]

// dist/chunk-6TYUC3E7.js
var playwright = [
  {
    name: 'tszhong0411:playwright',
    ...default10.configs['flat/recommended'],
    files: [GLOB_E2E]
  }
]

// dist/chunk-DJX4274D.js
var prettier = [
  {
    name: 'tszhong0411:prettier',
    plugins: {
      prettier: default11
    },
    rules: {
      // Avoid conflicts
      ...default7.rules,
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off'
    }
  }
]

// dist/chunk-QYICJKUS.js
var react = (options) => {
  const reactPluginAll = default3.configs.all
  return [
    {
      name: 'tszhong0411:react',
      plugins: {
        ...reactPluginAll.plugins,
        'react-hooks': default12,
        'jsx-a11y': default9
      },
      files: [GLOB_JS, GLOB_JSX, GLOB_TS, GLOB_TSX],
      languageOptions: {
        parser: default6,
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          },
          project: options?.project,
          sourceType: 'module'
        }
      },
      rules: {
        ...reactPluginAll.rules,
        ...default12.configs.recommended.rules,
        ...default9.configs.strict.rules,
        // @eslint-react
        '@eslint-react/no-leaked-conditional-rendering': 'error',
        '@eslint-react/avoid-shorthand-boolean': 'off',
        '@eslint-react/avoid-shorthand-fragment': 'off',
        '@eslint-react/prefer-destructuring-assignment': 'off',
        '@eslint-react/no-array-index-key': 'off',
        '@eslint-react/no-complex-conditional-rendering': 'off',
        // @eslint-react/hooks-extra
        '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'off',
        // @eslint-react/dom
        '@eslint-react/dom/no-dangerously-set-innerhtml': 'off',
        // @eslint-react/naming-convention
        '@eslint-react/naming-convention/filename': [
          'error',
          {
            rule: 'kebab-case'
          }
        ],
        // jsx-a11y
        'jsx-a11y/alt-text': [
          'error',
          {
            elements: ['img'],
            img: ['Image']
          }
        ],
        'jsx-a11y/lang': 'error',
        'jsx-a11y/no-aria-hidden-on-focusable': 'error',
        'jsx-a11y/no-noninteractive-element-to-interactive-role': [
          'error',
          {
            ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
            ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
            li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
            table: ['grid'],
            td: ['gridcell']
          }
        ]
      },
      settings: {
        'jsx-a11y': {
          components: {
            Button: 'button',
            Image: 'img',
            Input: 'input',
            Textarea: 'textarea',
            Link: 'a'
          }
        },
        ...reactPluginAll.settings
      }
    }
  ]
}

// dist/chunk-KMYJ7O2J.js
var sonarjs = [
  {
    name: 'tszhong0411:sonarjs',
    plugins: {
      sonarjs: sonarjsPlugin
    },
    rules: {
      ...sonarjsPlugin.configs.recommended.rules,
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/pseudo-random': 'off'
    }
  }
]

// dist/chunk-SOPDY2KU.js
var testingLibrary = [
  {
    name: 'tszhong0411:testing-library',
    plugins: {
      'testing-library': default14
    },
    rules: {
      ...default14.configs.react.rules
    },
    files: [GLOB_TEST]
  }
]

// dist/chunk-IDASO4DG.js
var turbo = [
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

// dist/chunk-PBBRDSBZ.js
var comments = [
  {
    name: 'tszhong0411:comments',
    plugins: {
      'eslint-comments': default8
    },
    rules: {
      ...default8.configs.recommended.rules,
      'eslint-comments/require-description': 'error'
    }
  }
]

// dist/chunk-QOJ3KGUY.js
var ignores = [
  {
    ignores: GLOB_EXCLUDE
  }
]

// dist/chunk-GEBMW5GH.js
var importSort = [
  {
    name: 'tszhong0411:import-sort',
    plugins: {
      'simple-import-sort': default13
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Type imports
            [
              '^.*\\u0000$',
              '^node:.*\\u0000$',
              '^@?\\w.*\\u0000$',
              '^\\.\\..*\\u0000$',
              '^\\..*\\u0000$'
            ],
            // Side effect imports (e.g., `import 'some-module'`)
            ['^\\u0000'],
            // Node.js builtins prefixed with `node:`
            ['^node:'],
            // Things that start with a letter (or digit or underscore), or `@` followed by a letter
            ['^@?\\w'],
            // Absolute imports (e.g., `import something from 'src/utils'`)
            ['^[^.]'],
            // Parent directory relative imports (e.g., `import something from '../utils'`)
            ['^\\.\\.'],
            // Current directory relative imports (e.g., `import something from './utils'`)
            ['^\\.']
          ]
        }
      ],
      'simple-import-sort/exports': 'error'
    }
  }
]

// dist/chunk-KR7RMZ7V.js
var imports = [
  {
    name: 'tszhong0411:imports',
    plugins: {
      import: importPlugin
    },
    rules: {
      'import/no-amd': 'error',
      'import/no-commonjs': 'error',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-named-default': 'error',
      'import/no-self-import': 'error',
      'import/no-webpack-loader-syntax': 'error',
      'import/newline-after-import': ['error', { count: 1 }]
    }
  }
]

// dist/chunk-JD7QW7C6.js
import globals from 'globals'
var javascript = [
  {
    name: 'tszhong0411:javascript',
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    plugins: {
      'unused-imports': default16
    },
    rules: {
      ...default2.configs.recommended.rules,
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ]
    }
  }
]

// dist/index.js
import { isPackageExists } from 'local-pkg'
var hasTypeScript = isPackageExists('typescript')
var tszhong0411 = async (options = {}, ...userConfigs) => {
  const {
    typescript: enableTypeScript = hasTypeScript,
    react: enableReact = false,
    turbo: enableTurbo = false,
    next: enableNext = false,
    playwright: enablePlaywright = false,
    testingLibrary: enableTestingLibrary = false,
    gitignore: enableGitignore = true
  } = options
  const configs = []
  if (enableGitignore) {
    configs.push((await import('eslint-config-flat-gitignore')).default())
  }
  configs.push(
    ...ignores,
    ...javascript,
    ...unicorn,
    ...comments,
    ...importSort,
    ...sonarjs,
    ...imports,
    ...prettier
  )
  if (enableTypeScript) {
    configs.push(...typescript(options))
  }
  if (enableReact) {
    configs.push(...react(options))
  }
  if (enableTurbo) {
    configs.push(...turbo)
  }
  if (enableNext) {
    configs.push(...next)
  }
  if (enablePlaywright) {
    configs.push(...playwright)
  }
  if (enableTestingLibrary) {
    configs.push(...testingLibrary)
  }
  configs.push(...userConfigs)
  return configs
}
var index_default = tszhong0411

// eslint.config.mjs
var eslint_config_default = index_default({
  project: './tsconfig.json',
  tsconfigRootDir: import.meta.dirname,
  react: true,
  next: true,
  playwright: true,
  testingLibrary: true,
  turbo: true,
  typescript: true
})
export { eslint_config_default as default }
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZGlzdC9jaHVuay1LTFQ3U0NTRi5qcyIsICJkaXN0L2NodW5rLUVWRkVJWE1CLmpzIiwgImRpc3QvY2h1bmstUTY3WTJQSkEuanMiLCAiZGlzdC9jaHVuay1ZR1FTVVNHNy5qcyIsICJkaXN0L2NodW5rLTNNUzY0WkpILmpzIiwgImRpc3QvY2h1bmstNlRZVUMzRTcuanMiLCAiZGlzdC9jaHVuay1ESlg0Mjc0RC5qcyIsICJkaXN0L2NodW5rLVFZSUNKS1VTLmpzIiwgImRpc3QvY2h1bmstS01ZSjdPMkouanMiLCAiZGlzdC9jaHVuay1TT1BEWTJLVS5qcyIsICJkaXN0L2NodW5rLUlEQVNPNERHLmpzIiwgImRpc3QvY2h1bmstUEJCUkRTQlouanMiLCAiZGlzdC9jaHVuay1RT0ozS0dVWS5qcyIsICJkaXN0L2NodW5rLUdFQk1XNUdILmpzIiwgImRpc3QvY2h1bmstS1I3Uk1aN1YuanMiLCAiZGlzdC9jaHVuay1KRDdRVzdDNi5qcyIsICJkaXN0L2luZGV4LmpzIiwgImVzbGludC5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcXFxcY2h1bmstS0xUN1NDU0YuanNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcaXN5XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcd2Vic2l0ZS1hcHBzXFxcXHBhY2thZ2VzXFxcXGVzbGludC1jb25maWdcXFxcZGlzdFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vQzovVXNlcnMvaXN5L0RvY3VtZW50cy9HaXRIdWIvd2Vic2l0ZS1hcHBzL3BhY2thZ2VzL2VzbGludC1jb25maWcvZGlzdC9jaHVuay1LTFQ3U0NTRi5qc1wiOy8vIHNyYy9nbG9icy50c1xudmFyIEdMT0JfU1JDX0VYVCA9IFwiPyhbY21dKVtqdF1zPyh4KVwiO1xudmFyIEdMT0JfSlMgPSBcIioqLyouPyhbY21dKWpzXCI7XG52YXIgR0xPQl9KU1ggPSBcIioqLyouPyhbY21dKWpzeFwiO1xudmFyIEdMT0JfVFMgPSBcIioqLyouPyhbY21dKXRzXCI7XG52YXIgR0xPQl9UU1ggPSBcIioqLyouPyhbY21dKXRzeFwiO1xudmFyIEdMT0JfRTJFID0gYCoqL2UyZS8qKi8qLnt0ZXN0LHNwZWN9LiR7R0xPQl9TUkNfRVhUfWA7XG52YXIgR0xPQl9URVNUID0gYCoqL3Rlc3RzLyoqLyoue3Rlc3Qsc3BlY30uJHtHTE9CX1NSQ19FWFR9YDtcbnZhciBHTE9CX0VYQ0xVREUgPSBbXG4gIFwiKiovbm9kZV9tb2R1bGVzXCIsXG4gIFwiKiovZGlzdFwiLFxuICBcIioqL3BhY2thZ2UtbG9jay5qc29uXCIsXG4gIFwiKioveWFybi5sb2NrXCIsXG4gIFwiKiovcG5wbS1sb2NrLnlhbWxcIixcbiAgXCIqKi9idW4ubG9ja2JcIixcbiAgXCIqKi9vdXRwdXRcIixcbiAgXCIqKi9jb3ZlcmFnZVwiLFxuICBcIioqL3RlbXBcIixcbiAgXCIqKi8udGVtcFwiLFxuICBcIioqL3RtcFwiLFxuICBcIioqLy50bXBcIixcbiAgXCIqKi8uaGlzdG9yeVwiLFxuICBcIioqLy5uZXh0XCIsXG4gIFwiKiovLnZlcmNlbFwiLFxuICBcIioqLy5jaGFuZ2VzZXRcIixcbiAgXCIqKi8uY2FjaGVcIixcbiAgXCIqKi9DSEFOR0VMT0cqLm1kXCIsXG4gIFwiKiovTElDRU5TRSpcIlxuXTtcblxuZXhwb3J0IHtcbiAgR0xPQl9KUyxcbiAgR0xPQl9KU1gsXG4gIEdMT0JfVFMsXG4gIEdMT0JfVFNYLFxuICBHTE9CX0UyRSxcbiAgR0xPQl9URVNULFxuICBHTE9CX0VYQ0xVREVcbn07XG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxkaXN0XFxcXGNodW5rLUVWRkVJWE1CLmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0M6L1VzZXJzL2lzeS9Eb2N1bWVudHMvR2l0SHViL3dlYnNpdGUtYXBwcy9wYWNrYWdlcy9lc2xpbnQtY29uZmlnL2Rpc3QvY2h1bmstRVZGRUlYTUIuanNcIjsvLyBzcmMvcGx1Z2lucy50c1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBkZWZhdWx0MiB9IGZyb20gXCJAZXNsaW50L2pzXCI7XG5pbXBvcnQgeyBkZWZhdWx0IGFzIGRlZmF1bHQzIH0gZnJvbSBcIkBlc2xpbnQtcmVhY3QvZXNsaW50LXBsdWdpblwiO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBkZWZhdWx0NCB9IGZyb20gXCJAbmV4dC9lc2xpbnQtcGx1Z2luLW5leHRcIjtcbmltcG9ydCB7IGRlZmF1bHQgYXMgZGVmYXVsdDUgfSBmcm9tIFwiQHR5cGVzY3JpcHQtZXNsaW50L2VzbGludC1wbHVnaW5cIjtcbmltcG9ydCB7IGRlZmF1bHQgYXMgZGVmYXVsdDYgfSBmcm9tIFwiQHR5cGVzY3JpcHQtZXNsaW50L3BhcnNlclwiO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBkZWZhdWx0NyB9IGZyb20gXCJlc2xpbnQtY29uZmlnLXByZXR0aWVyXCI7XG5pbXBvcnQgeyBkZWZhdWx0IGFzIGRlZmF1bHQ4IH0gZnJvbSBcImVzbGludC1wbHVnaW4tZXNsaW50LWNvbW1lbnRzXCI7XG5pbXBvcnQgKiBhcyBpbXBvcnRQbHVnaW4gZnJvbSBcImVzbGludC1wbHVnaW4taW1wb3J0XCI7XG5pbXBvcnQgeyBkZWZhdWx0IGFzIGRlZmF1bHQ5IH0gZnJvbSBcImVzbGludC1wbHVnaW4tanN4LWExMXlcIjtcbmltcG9ydCB7IGRlZmF1bHQgYXMgZGVmYXVsdDEwIH0gZnJvbSBcImVzbGludC1wbHVnaW4tcGxheXdyaWdodFwiO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBkZWZhdWx0MTEgfSBmcm9tIFwiZXNsaW50LXBsdWdpbi1wcmV0dGllclwiO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBkZWZhdWx0MTIgfSBmcm9tIFwiZXNsaW50LXBsdWdpbi1yZWFjdC1ob29rc1wiO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBkZWZhdWx0MTMgfSBmcm9tIFwiZXNsaW50LXBsdWdpbi1zaW1wbGUtaW1wb3J0LXNvcnRcIjtcbmltcG9ydCAqIGFzIHNvbmFyanNQbHVnaW4gZnJvbSBcImVzbGludC1wbHVnaW4tc29uYXJqc1wiO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBkZWZhdWx0MTQgfSBmcm9tIFwiZXNsaW50LXBsdWdpbi10ZXN0aW5nLWxpYnJhcnlcIjtcbmltcG9ydCAqIGFzIHR1cmJvUGx1Z2luIGZyb20gXCJlc2xpbnQtcGx1Z2luLXR1cmJvXCI7XG5pbXBvcnQgeyBkZWZhdWx0IGFzIGRlZmF1bHQxNSB9IGZyb20gXCJlc2xpbnQtcGx1Z2luLXVuaWNvcm5cIjtcbmltcG9ydCB7IGRlZmF1bHQgYXMgZGVmYXVsdDE2IH0gZnJvbSBcImVzbGludC1wbHVnaW4tdW51c2VkLWltcG9ydHNcIjtcblxuZXhwb3J0IHtcbiAgZGVmYXVsdDIgYXMgZGVmYXVsdCxcbiAgZGVmYXVsdDMgYXMgZGVmYXVsdDIsXG4gIGRlZmF1bHQ0IGFzIGRlZmF1bHQzLFxuICBkZWZhdWx0NSBhcyBkZWZhdWx0NCxcbiAgZGVmYXVsdDYgYXMgZGVmYXVsdDUsXG4gIGRlZmF1bHQ3IGFzIGRlZmF1bHQ2LFxuICBkZWZhdWx0OCBhcyBkZWZhdWx0NyxcbiAgaW1wb3J0UGx1Z2luLFxuICBkZWZhdWx0OSBhcyBkZWZhdWx0OCxcbiAgZGVmYXVsdDEwIGFzIGRlZmF1bHQ5LFxuICBkZWZhdWx0MTEgYXMgZGVmYXVsdDEwLFxuICBkZWZhdWx0MTIgYXMgZGVmYXVsdDExLFxuICBkZWZhdWx0MTMgYXMgZGVmYXVsdDEyLFxuICBzb25hcmpzUGx1Z2luLFxuICBkZWZhdWx0MTQgYXMgZGVmYXVsdDEzLFxuICB0dXJib1BsdWdpbixcbiAgZGVmYXVsdDE1IGFzIGRlZmF1bHQxNCxcbiAgZGVmYXVsdDE2IGFzIGRlZmF1bHQxNVxufTtcbiIsICJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcXFxcY2h1bmstUTY3WTJQSkEuanNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcaXN5XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcd2Vic2l0ZS1hcHBzXFxcXHBhY2thZ2VzXFxcXGVzbGludC1jb25maWdcXFxcZGlzdFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vQzovVXNlcnMvaXN5L0RvY3VtZW50cy9HaXRIdWIvd2Vic2l0ZS1hcHBzL3BhY2thZ2VzL2VzbGludC1jb25maWcvZGlzdC9jaHVuay1RNjdZMlBKQS5qc1wiO2ltcG9ydCB7XG4gIEdMT0JfVFMsXG4gIEdMT0JfVFNYXG59IGZyb20gXCIuL2NodW5rLUtMVDdTQ1NGLmpzXCI7XG5pbXBvcnQge1xuICBkZWZhdWx0NCBhcyBkZWZhdWx0MixcbiAgZGVmYXVsdDUgYXMgZGVmYXVsdDNcbn0gZnJvbSBcIi4vY2h1bmstRVZGRUlYTUIuanNcIjtcblxuLy8gc3JjL2NvbmZpZ3MvdHlwZXNjcmlwdC50c1xudmFyIHR5cGVzY3JpcHQgPSAob3B0aW9ucykgPT4gW1xuICB7XG4gICAgbmFtZTogXCJ0c3pob25nMDQxMTp0eXBlc2NyaXB0XCIsXG4gICAgcGx1Z2luczoge1xuICAgICAgXCJAdHlwZXNjcmlwdC1lc2xpbnRcIjogZGVmYXVsdDJcbiAgICB9LFxuICAgIGZpbGVzOiBbR0xPQl9UUywgR0xPQl9UU1hdLFxuICAgIGxhbmd1YWdlT3B0aW9uczoge1xuICAgICAgcGFyc2VyOiBkZWZhdWx0MyxcbiAgICAgIHBhcnNlck9wdGlvbnM6IHtcbiAgICAgICAgZWNtYUZlYXR1cmVzOiB7XG4gICAgICAgICAganN4OiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHByb2plY3Q6IG9wdGlvbnM/LnByb2plY3QsXG4gICAgICAgIHRzY29uZmlnUm9vdERpcjogb3B0aW9ucz8udHNjb25maWdSb290RGlyLFxuICAgICAgICBzb3VyY2VUeXBlOiBcIm1vZHVsZVwiXG4gICAgICB9XG4gICAgfSxcbiAgICBydWxlczoge1xuICAgICAgLi4uZGVmYXVsdDIuY29uZmlnc1tcInJlY29tbWVuZGVkLXR5cGUtY2hlY2tlZFwiXS5ydWxlcyxcbiAgICAgIC4uLmRlZmF1bHQyLmNvbmZpZ3NbXCJzdHJpY3QtdHlwZS1jaGVja2VkXCJdLnJ1bGVzLFxuICAgICAgLi4uZGVmYXVsdDIuY29uZmlnc1tcInN0eWxpc3RpYy10eXBlLWNoZWNrZWRcIl0ucnVsZXMsXG4gICAgICAuLi5kZWZhdWx0Mi5jb25maWdzW1wiZXNsaW50LXJlY29tbWVuZGVkXCJdLm92ZXJyaWRlc1swXS5ydWxlcyxcbiAgICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L2FycmF5LXR5cGVcIjogW1wiZXJyb3JcIiwgeyBkZWZhdWx0OiBcImFycmF5LXNpbXBsZVwiIH1dLFxuICAgICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvbm8taW52YWxpZC10aGlzXCI6IFwiZXJyb3JcIixcbiAgICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L25vLXNoYWRvd1wiOiBcImVycm9yXCIsXG4gICAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9jb25zaXN0ZW50LXR5cGUtaW1wb3J0c1wiOiBbXG4gICAgICAgIFwiZXJyb3JcIixcbiAgICAgICAge1xuICAgICAgICAgIHByZWZlcjogXCJ0eXBlLWltcG9ydHNcIixcbiAgICAgICAgICBmaXhTdHlsZTogXCJpbmxpbmUtdHlwZS1pbXBvcnRzXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXRlbXBsYXRlLWV4cHJlc3Npb25zXCI6IFtcImVycm9yXCIsIHsgYWxsb3dOdW1iZXI6IHRydWUgfV0sXG4gICAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9uby1jb25mdXNpbmctdm9pZC1leHByZXNzaW9uXCI6IFtcbiAgICAgICAgXCJlcnJvclwiLFxuICAgICAgICB7XG4gICAgICAgICAgaWdub3JlQXJyb3dTaG9ydGhhbmQ6IHRydWUsXG4gICAgICAgICAgaWdub3JlVm9pZE9wZXJhdG9yOiB0cnVlLFxuICAgICAgICAgIGlnbm9yZVZvaWRSZXR1cm5pbmdGdW5jdGlvbnM6IHRydWVcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L25vLW5hbWVzcGFjZVwiOiBcIm9mZlwiLFxuICAgICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWNhbGxcIjogXCJvZmZcIixcbiAgICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1hc3NpZ25tZW50XCI6IFwib2ZmXCIsXG4gICAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtbWVtYmVyLWFjY2Vzc1wiOiBcIm9mZlwiLFxuICAgICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvY29uc2lzdGVudC10eXBlLWRlZmluaXRpb25zXCI6IFwib2ZmXCIsXG4gICAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cIjogXCJvZmZcIixcbiAgICAgIC8vIFR1cm4gb2ZmIGR1ZSB0byBwb29yIHBlcmZvcm1hbmNlXG4gICAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9uby1taXN1c2VkLXByb21pc2VzXCI6IFwib2ZmXCIsXG4gICAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9uby1mbG9hdGluZy1wcm9taXNlc1wiOiBcIm9mZlwiXG4gICAgfVxuICB9XG5dO1xuXG5leHBvcnQge1xuICB0eXBlc2NyaXB0XG59O1xuIiwgImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcaXN5XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcd2Vic2l0ZS1hcHBzXFxcXHBhY2thZ2VzXFxcXGVzbGludC1jb25maWdcXFxcZGlzdFxcXFxjaHVuay1ZR1FTVVNHNy5qc1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxkaXN0XCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9DOi9Vc2Vycy9pc3kvRG9jdW1lbnRzL0dpdEh1Yi93ZWJzaXRlLWFwcHMvcGFja2FnZXMvZXNsaW50LWNvbmZpZy9kaXN0L2NodW5rLVlHUVNVU0c3LmpzXCI7aW1wb3J0IHtcbiAgZGVmYXVsdDE0IGFzIGRlZmF1bHQyXG59IGZyb20gXCIuL2NodW5rLUVWRkVJWE1CLmpzXCI7XG5cbi8vIHNyYy9jb25maWdzL3VuaWNvcm4udHNcbnZhciB1bmljb3JuID0gW1xuICB7XG4gICAgbmFtZTogXCJ0c3pob25nMDQxMTp1bmljb3JuXCIsXG4gICAgcGx1Z2luczoge1xuICAgICAgdW5pY29ybjogZGVmYXVsdDJcbiAgICB9LFxuICAgIHJ1bGVzOiB7XG4gICAgICAuLi5kZWZhdWx0Mi5jb25maWdzLnJlY29tbWVuZGVkLnJ1bGVzLFxuICAgICAgXCJ1bmljb3JuL25vLWF3YWl0LWV4cHJlc3Npb24tbWVtYmVyXCI6IFwib2ZmXCIsXG4gICAgICBcInVuaWNvcm4vbm8tbnVsbFwiOiBcIm9mZlwiLFxuICAgICAgXCJ1bmljb3JuL3ByZWZlci1leHBvcnQtZnJvbVwiOiBbXCJlcnJvclwiLCB7IGlnbm9yZVVzZWRWYXJpYWJsZXM6IHRydWUgfV0sXG4gICAgICBcInVuaWNvcm4vcHJldmVudC1hYmJyZXZpYXRpb25zXCI6IFwib2ZmXCIsXG4gICAgICBcInVuaWNvcm4vcHJlZmVyLXN0cmluZy1yYXdcIjogXCJvZmZcIixcbiAgICAgIFwidW5pY29ybi9wcmVmZXItc3ByZWFkXCI6IFwib2ZmXCJcbiAgICB9XG4gIH1cbl07XG5cbmV4cG9ydCB7XG4gIHVuaWNvcm5cbn07XG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxkaXN0XFxcXGNodW5rLTNNUzY0WkpILmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0M6L1VzZXJzL2lzeS9Eb2N1bWVudHMvR2l0SHViL3dlYnNpdGUtYXBwcy9wYWNrYWdlcy9lc2xpbnQtY29uZmlnL2Rpc3QvY2h1bmstM01TNjRaSkguanNcIjtpbXBvcnQge1xuICBkZWZhdWx0MyBhcyBkZWZhdWx0MlxufSBmcm9tIFwiLi9jaHVuay1FVkZFSVhNQi5qc1wiO1xuXG4vLyBzcmMvY29uZmlncy9uZXh0LnRzXG52YXIgbmV4dCA9IFtcbiAge1xuICAgIG5hbWU6IFwidHN6aG9uZzA0MTE6bmV4dFwiLFxuICAgIHBsdWdpbnM6IHtcbiAgICAgIFwiQG5leHQvbmV4dFwiOiBkZWZhdWx0MlxuICAgIH0sXG4gICAgcnVsZXM6IHtcbiAgICAgIC4uLmRlZmF1bHQyLmNvbmZpZ3MucmVjb21tZW5kZWQucnVsZXMsXG4gICAgICAuLi5kZWZhdWx0Mi5jb25maWdzW1wiY29yZS13ZWItdml0YWxzXCJdLnJ1bGVzLFxuICAgICAgXCJAbmV4dC9uZXh0L25vLWh0bWwtbGluay1mb3ItcGFnZXNcIjogXCJvZmZcIlxuICAgIH1cbiAgfVxuXTtcblxuZXhwb3J0IHtcbiAgbmV4dFxufTtcbiIsICJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcXFxcY2h1bmstNlRZVUMzRTcuanNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcaXN5XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcd2Vic2l0ZS1hcHBzXFxcXHBhY2thZ2VzXFxcXGVzbGludC1jb25maWdcXFxcZGlzdFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vQzovVXNlcnMvaXN5L0RvY3VtZW50cy9HaXRIdWIvd2Vic2l0ZS1hcHBzL3BhY2thZ2VzL2VzbGludC1jb25maWcvZGlzdC9jaHVuay02VFlVQzNFNy5qc1wiO2ltcG9ydCB7XG4gIEdMT0JfRTJFXG59IGZyb20gXCIuL2NodW5rLUtMVDdTQ1NGLmpzXCI7XG5pbXBvcnQge1xuICBkZWZhdWx0OSBhcyBkZWZhdWx0MlxufSBmcm9tIFwiLi9jaHVuay1FVkZFSVhNQi5qc1wiO1xuXG4vLyBzcmMvY29uZmlncy9wbGF5d3JpZ2h0LnRzXG52YXIgcGxheXdyaWdodCA9IFtcbiAge1xuICAgIG5hbWU6IFwidHN6aG9uZzA0MTE6cGxheXdyaWdodFwiLFxuICAgIC4uLmRlZmF1bHQyLmNvbmZpZ3NbXCJmbGF0L3JlY29tbWVuZGVkXCJdLFxuICAgIGZpbGVzOiBbR0xPQl9FMkVdXG4gIH1cbl07XG5cbmV4cG9ydCB7XG4gIHBsYXl3cmlnaHRcbn07XG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxkaXN0XFxcXGNodW5rLURKWDQyNzRELmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0M6L1VzZXJzL2lzeS9Eb2N1bWVudHMvR2l0SHViL3dlYnNpdGUtYXBwcy9wYWNrYWdlcy9lc2xpbnQtY29uZmlnL2Rpc3QvY2h1bmstREpYNDI3NEQuanNcIjtpbXBvcnQge1xuICBkZWZhdWx0MTAgYXMgZGVmYXVsdDMsXG4gIGRlZmF1bHQ2IGFzIGRlZmF1bHQyXG59IGZyb20gXCIuL2NodW5rLUVWRkVJWE1CLmpzXCI7XG5cbi8vIHNyYy9jb25maWdzL3ByZXR0aWVyLnRzXG52YXIgcHJldHRpZXIgPSBbXG4gIHtcbiAgICBuYW1lOiBcInRzemhvbmcwNDExOnByZXR0aWVyXCIsXG4gICAgcGx1Z2luczoge1xuICAgICAgcHJldHRpZXI6IGRlZmF1bHQzXG4gICAgfSxcbiAgICBydWxlczoge1xuICAgICAgLy8gQXZvaWQgY29uZmxpY3RzXG4gICAgICAuLi5kZWZhdWx0Mi5ydWxlcyxcbiAgICAgIFwicHJldHRpZXIvcHJldHRpZXJcIjogW1wiZXJyb3JcIiwgeyBlbmRPZkxpbmU6IFwiYXV0b1wiIH1dLFxuICAgICAgXCJhcnJvdy1ib2R5LXN0eWxlXCI6IFwib2ZmXCIsXG4gICAgICBcInByZWZlci1hcnJvdy1jYWxsYmFja1wiOiBcIm9mZlwiXG4gICAgfVxuICB9XG5dO1xuXG5leHBvcnQge1xuICBwcmV0dGllclxufTtcbiIsICJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcXFxcY2h1bmstUVlJQ0pLVVMuanNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcaXN5XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcd2Vic2l0ZS1hcHBzXFxcXHBhY2thZ2VzXFxcXGVzbGludC1jb25maWdcXFxcZGlzdFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vQzovVXNlcnMvaXN5L0RvY3VtZW50cy9HaXRIdWIvd2Vic2l0ZS1hcHBzL3BhY2thZ2VzL2VzbGludC1jb25maWcvZGlzdC9jaHVuay1RWUlDSktVUy5qc1wiO2ltcG9ydCB7XG4gIEdMT0JfSlMsXG4gIEdMT0JfSlNYLFxuICBHTE9CX1RTLFxuICBHTE9CX1RTWFxufSBmcm9tIFwiLi9jaHVuay1LTFQ3U0NTRi5qc1wiO1xuaW1wb3J0IHtcbiAgZGVmYXVsdDExIGFzIGRlZmF1bHQ1LFxuICBkZWZhdWx0MixcbiAgZGVmYXVsdDUgYXMgZGVmYXVsdDMsXG4gIGRlZmF1bHQ4IGFzIGRlZmF1bHQ0XG59IGZyb20gXCIuL2NodW5rLUVWRkVJWE1CLmpzXCI7XG5cbi8vIHNyYy9jb25maWdzL3JlYWN0LnRzXG52YXIgcmVhY3QgPSAob3B0aW9ucykgPT4ge1xuICBjb25zdCByZWFjdFBsdWdpbkFsbCA9IGRlZmF1bHQyLmNvbmZpZ3MuYWxsO1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIG5hbWU6IFwidHN6aG9uZzA0MTE6cmVhY3RcIixcbiAgICAgIHBsdWdpbnM6IHtcbiAgICAgICAgLi4ucmVhY3RQbHVnaW5BbGwucGx1Z2lucyxcbiAgICAgICAgXCJyZWFjdC1ob29rc1wiOiBkZWZhdWx0NSxcbiAgICAgICAgXCJqc3gtYTExeVwiOiBkZWZhdWx0NFxuICAgICAgfSxcbiAgICAgIGZpbGVzOiBbR0xPQl9KUywgR0xPQl9KU1gsIEdMT0JfVFMsIEdMT0JfVFNYXSxcbiAgICAgIGxhbmd1YWdlT3B0aW9uczoge1xuICAgICAgICBwYXJzZXI6IGRlZmF1bHQzLFxuICAgICAgICBwYXJzZXJPcHRpb25zOiB7XG4gICAgICAgICAgZWNtYUZlYXR1cmVzOiB7XG4gICAgICAgICAgICBqc3g6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByb2plY3Q6IG9wdGlvbnM/LnByb2plY3QsXG4gICAgICAgICAgc291cmNlVHlwZTogXCJtb2R1bGVcIlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcnVsZXM6IHtcbiAgICAgICAgLi4ucmVhY3RQbHVnaW5BbGwucnVsZXMsXG4gICAgICAgIC4uLmRlZmF1bHQ1LmNvbmZpZ3MucmVjb21tZW5kZWQucnVsZXMsXG4gICAgICAgIC4uLmRlZmF1bHQ0LmNvbmZpZ3Muc3RyaWN0LnJ1bGVzLFxuICAgICAgICAvLyBAZXNsaW50LXJlYWN0XG4gICAgICAgIFwiQGVzbGludC1yZWFjdC9uby1sZWFrZWQtY29uZGl0aW9uYWwtcmVuZGVyaW5nXCI6IFwiZXJyb3JcIixcbiAgICAgICAgXCJAZXNsaW50LXJlYWN0L2F2b2lkLXNob3J0aGFuZC1ib29sZWFuXCI6IFwib2ZmXCIsXG4gICAgICAgIFwiQGVzbGludC1yZWFjdC9hdm9pZC1zaG9ydGhhbmQtZnJhZ21lbnRcIjogXCJvZmZcIixcbiAgICAgICAgXCJAZXNsaW50LXJlYWN0L3ByZWZlci1kZXN0cnVjdHVyaW5nLWFzc2lnbm1lbnRcIjogXCJvZmZcIixcbiAgICAgICAgXCJAZXNsaW50LXJlYWN0L25vLWFycmF5LWluZGV4LWtleVwiOiBcIm9mZlwiLFxuICAgICAgICBcIkBlc2xpbnQtcmVhY3Qvbm8tY29tcGxleC1jb25kaXRpb25hbC1yZW5kZXJpbmdcIjogXCJvZmZcIixcbiAgICAgICAgLy8gQGVzbGludC1yZWFjdC9ob29rcy1leHRyYVxuICAgICAgICBcIkBlc2xpbnQtcmVhY3QvaG9va3MtZXh0cmEvbm8tZGlyZWN0LXNldC1zdGF0ZS1pbi11c2UtZWZmZWN0XCI6IFwib2ZmXCIsXG4gICAgICAgIC8vIEBlc2xpbnQtcmVhY3QvZG9tXG4gICAgICAgIFwiQGVzbGludC1yZWFjdC9kb20vbm8tZGFuZ2Vyb3VzbHktc2V0LWlubmVyaHRtbFwiOiBcIm9mZlwiLFxuICAgICAgICAvLyBAZXNsaW50LXJlYWN0L25hbWluZy1jb252ZW50aW9uXG4gICAgICAgIFwiQGVzbGludC1yZWFjdC9uYW1pbmctY29udmVudGlvbi9maWxlbmFtZVwiOiBbXG4gICAgICAgICAgXCJlcnJvclwiLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHJ1bGU6IFwia2ViYWItY2FzZVwiXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICAvLyBqc3gtYTExeVxuICAgICAgICBcImpzeC1hMTF5L2FsdC10ZXh0XCI6IFtcbiAgICAgICAgICBcImVycm9yXCIsXG4gICAgICAgICAge1xuICAgICAgICAgICAgZWxlbWVudHM6IFtcImltZ1wiXSxcbiAgICAgICAgICAgIGltZzogW1wiSW1hZ2VcIl1cbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIFwianN4LWExMXkvbGFuZ1wiOiBcImVycm9yXCIsXG4gICAgICAgIFwianN4LWExMXkvbm8tYXJpYS1oaWRkZW4tb24tZm9jdXNhYmxlXCI6IFwiZXJyb3JcIixcbiAgICAgICAgXCJqc3gtYTExeS9uby1ub25pbnRlcmFjdGl2ZS1lbGVtZW50LXRvLWludGVyYWN0aXZlLXJvbGVcIjogW1xuICAgICAgICAgIFwiZXJyb3JcIixcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1bDogW1wibGlzdGJveFwiLCBcIm1lbnVcIiwgXCJtZW51YmFyXCIsIFwicmFkaW9ncm91cFwiLCBcInRhYmxpc3RcIiwgXCJ0cmVlXCIsIFwidHJlZWdyaWRcIl0sXG4gICAgICAgICAgICBvbDogW1wibGlzdGJveFwiLCBcIm1lbnVcIiwgXCJtZW51YmFyXCIsIFwicmFkaW9ncm91cFwiLCBcInRhYmxpc3RcIiwgXCJ0cmVlXCIsIFwidHJlZWdyaWRcIl0sXG4gICAgICAgICAgICBsaTogW1wibWVudWl0ZW1cIiwgXCJvcHRpb25cIiwgXCJyb3dcIiwgXCJ0YWJcIiwgXCJ0cmVlaXRlbVwiXSxcbiAgICAgICAgICAgIHRhYmxlOiBbXCJncmlkXCJdLFxuICAgICAgICAgICAgdGQ6IFtcImdyaWRjZWxsXCJdXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgXCJqc3gtYTExeVwiOiB7XG4gICAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgQnV0dG9uOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgSW1hZ2U6IFwiaW1nXCIsXG4gICAgICAgICAgICBJbnB1dDogXCJpbnB1dFwiLFxuICAgICAgICAgICAgVGV4dGFyZWE6IFwidGV4dGFyZWFcIixcbiAgICAgICAgICAgIExpbms6IFwiYVwiXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAuLi5yZWFjdFBsdWdpbkFsbC5zZXR0aW5nc1xuICAgICAgfVxuICAgIH1cbiAgXTtcbn07XG5cbmV4cG9ydCB7XG4gIHJlYWN0XG59O1xuIiwgImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcaXN5XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcd2Vic2l0ZS1hcHBzXFxcXHBhY2thZ2VzXFxcXGVzbGludC1jb25maWdcXFxcZGlzdFxcXFxjaHVuay1LTVlKN08ySi5qc1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxkaXN0XCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9DOi9Vc2Vycy9pc3kvRG9jdW1lbnRzL0dpdEh1Yi93ZWJzaXRlLWFwcHMvcGFja2FnZXMvZXNsaW50LWNvbmZpZy9kaXN0L2NodW5rLUtNWUo3TzJKLmpzXCI7aW1wb3J0IHtcbiAgc29uYXJqc1BsdWdpblxufSBmcm9tIFwiLi9jaHVuay1FVkZFSVhNQi5qc1wiO1xuXG4vLyBzcmMvY29uZmlncy9zb25hcmpzLnRzXG52YXIgc29uYXJqcyA9IFtcbiAge1xuICAgIG5hbWU6IFwidHN6aG9uZzA0MTE6c29uYXJqc1wiLFxuICAgIHBsdWdpbnM6IHtcbiAgICAgIHNvbmFyanM6IHNvbmFyanNQbHVnaW5cbiAgICB9LFxuICAgIHJ1bGVzOiB7XG4gICAgICAuLi5zb25hcmpzUGx1Z2luLmNvbmZpZ3MucmVjb21tZW5kZWQucnVsZXMsXG4gICAgICBcInNvbmFyanMvbm8tZHVwbGljYXRlLXN0cmluZ1wiOiBcIm9mZlwiLFxuICAgICAgXCJzb25hcmpzL25vLW5lc3RlZC1mdW5jdGlvbnNcIjogXCJvZmZcIixcbiAgICAgIFwic29uYXJqcy9wc2V1ZG8tcmFuZG9tXCI6IFwib2ZmXCJcbiAgICB9XG4gIH1cbl07XG5cbmV4cG9ydCB7XG4gIHNvbmFyanNcbn07XG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxkaXN0XFxcXGNodW5rLVNPUERZMktVLmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0M6L1VzZXJzL2lzeS9Eb2N1bWVudHMvR2l0SHViL3dlYnNpdGUtYXBwcy9wYWNrYWdlcy9lc2xpbnQtY29uZmlnL2Rpc3QvY2h1bmstU09QRFkyS1UuanNcIjtpbXBvcnQge1xuICBHTE9CX1RFU1Rcbn0gZnJvbSBcIi4vY2h1bmstS0xUN1NDU0YuanNcIjtcbmltcG9ydCB7XG4gIGRlZmF1bHQxMyBhcyBkZWZhdWx0MlxufSBmcm9tIFwiLi9jaHVuay1FVkZFSVhNQi5qc1wiO1xuXG4vLyBzcmMvY29uZmlncy90ZXN0aW5nLWxpYnJhcnkudHNcbnZhciB0ZXN0aW5nTGlicmFyeSA9IFtcbiAge1xuICAgIG5hbWU6IFwidHN6aG9uZzA0MTE6dGVzdGluZy1saWJyYXJ5XCIsXG4gICAgcGx1Z2luczoge1xuICAgICAgXCJ0ZXN0aW5nLWxpYnJhcnlcIjogZGVmYXVsdDJcbiAgICB9LFxuICAgIHJ1bGVzOiB7XG4gICAgICAuLi5kZWZhdWx0Mi5jb25maWdzLnJlYWN0LnJ1bGVzXG4gICAgfSxcbiAgICBmaWxlczogW0dMT0JfVEVTVF1cbiAgfVxuXTtcblxuZXhwb3J0IHtcbiAgdGVzdGluZ0xpYnJhcnlcbn07XG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxkaXN0XFxcXGNodW5rLUlEQVNPNERHLmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0M6L1VzZXJzL2lzeS9Eb2N1bWVudHMvR2l0SHViL3dlYnNpdGUtYXBwcy9wYWNrYWdlcy9lc2xpbnQtY29uZmlnL2Rpc3QvY2h1bmstSURBU080REcuanNcIjtpbXBvcnQge1xuICB0dXJib1BsdWdpblxufSBmcm9tIFwiLi9jaHVuay1FVkZFSVhNQi5qc1wiO1xuXG4vLyBzcmMvY29uZmlncy90dXJiby50c1xudmFyIHR1cmJvID0gW1xuICB7XG4gICAgbmFtZTogXCJ0c3pob25nMDQxMTp0dXJib1wiLFxuICAgIHBsdWdpbnM6IHtcbiAgICAgIHR1cmJvOiB0dXJib1BsdWdpblxuICAgIH0sXG4gICAgcnVsZXM6IHtcbiAgICAgIC4uLnR1cmJvUGx1Z2luLmNvbmZpZ3MucmVjb21tZW5kZWQucnVsZXNcbiAgICB9XG4gIH1cbl07XG5cbmV4cG9ydCB7XG4gIHR1cmJvXG59O1xuIiwgImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcaXN5XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcd2Vic2l0ZS1hcHBzXFxcXHBhY2thZ2VzXFxcXGVzbGludC1jb25maWdcXFxcZGlzdFxcXFxjaHVuay1QQkJSRFNCWi5qc1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxkaXN0XCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9DOi9Vc2Vycy9pc3kvRG9jdW1lbnRzL0dpdEh1Yi93ZWJzaXRlLWFwcHMvcGFja2FnZXMvZXNsaW50LWNvbmZpZy9kaXN0L2NodW5rLVBCQlJEU0JaLmpzXCI7aW1wb3J0IHtcbiAgZGVmYXVsdDcgYXMgZGVmYXVsdDJcbn0gZnJvbSBcIi4vY2h1bmstRVZGRUlYTUIuanNcIjtcblxuLy8gc3JjL2NvbmZpZ3MvY29tbWVudHMudHNcbnZhciBjb21tZW50cyA9IFtcbiAge1xuICAgIG5hbWU6IFwidHN6aG9uZzA0MTE6Y29tbWVudHNcIixcbiAgICBwbHVnaW5zOiB7XG4gICAgICBcImVzbGludC1jb21tZW50c1wiOiBkZWZhdWx0MlxuICAgIH0sXG4gICAgcnVsZXM6IHtcbiAgICAgIC4uLmRlZmF1bHQyLmNvbmZpZ3MucmVjb21tZW5kZWQucnVsZXMsXG4gICAgICBcImVzbGludC1jb21tZW50cy9yZXF1aXJlLWRlc2NyaXB0aW9uXCI6IFwiZXJyb3JcIlxuICAgIH1cbiAgfVxuXTtcblxuZXhwb3J0IHtcbiAgY29tbWVudHNcbn07XG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxkaXN0XFxcXGNodW5rLVFPSjNLR1VZLmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0M6L1VzZXJzL2lzeS9Eb2N1bWVudHMvR2l0SHViL3dlYnNpdGUtYXBwcy9wYWNrYWdlcy9lc2xpbnQtY29uZmlnL2Rpc3QvY2h1bmstUU9KM0tHVVkuanNcIjtpbXBvcnQge1xuICBHTE9CX0VYQ0xVREVcbn0gZnJvbSBcIi4vY2h1bmstS0xUN1NDU0YuanNcIjtcblxuLy8gc3JjL2NvbmZpZ3MvaWdub3Jlcy50c1xudmFyIGlnbm9yZXMgPSBbXG4gIHtcbiAgICBpZ25vcmVzOiBHTE9CX0VYQ0xVREVcbiAgfVxuXTtcblxuZXhwb3J0IHtcbiAgaWdub3Jlc1xufTtcbiIsICJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcXFxcY2h1bmstR0VCTVc1R0guanNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcaXN5XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcd2Vic2l0ZS1hcHBzXFxcXHBhY2thZ2VzXFxcXGVzbGludC1jb25maWdcXFxcZGlzdFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vQzovVXNlcnMvaXN5L0RvY3VtZW50cy9HaXRIdWIvd2Vic2l0ZS1hcHBzL3BhY2thZ2VzL2VzbGludC1jb25maWcvZGlzdC9jaHVuay1HRUJNVzVHSC5qc1wiO2ltcG9ydCB7XG4gIGRlZmF1bHQxMiBhcyBkZWZhdWx0MlxufSBmcm9tIFwiLi9jaHVuay1FVkZFSVhNQi5qc1wiO1xuXG4vLyBzcmMvY29uZmlncy9pbXBvcnQtc29ydC50c1xudmFyIGltcG9ydFNvcnQgPSBbXG4gIHtcbiAgICBuYW1lOiBcInRzemhvbmcwNDExOmltcG9ydC1zb3J0XCIsXG4gICAgcGx1Z2luczoge1xuICAgICAgXCJzaW1wbGUtaW1wb3J0LXNvcnRcIjogZGVmYXVsdDJcbiAgICB9LFxuICAgIHJ1bGVzOiB7XG4gICAgICBcInNpbXBsZS1pbXBvcnQtc29ydC9pbXBvcnRzXCI6IFtcbiAgICAgICAgXCJlcnJvclwiLFxuICAgICAgICB7XG4gICAgICAgICAgZ3JvdXBzOiBbXG4gICAgICAgICAgICAvLyBUeXBlIGltcG9ydHNcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgXCJeLipcXFxcdTAwMDAkXCIsXG4gICAgICAgICAgICAgIFwiXm5vZGU6LipcXFxcdTAwMDAkXCIsXG4gICAgICAgICAgICAgIFwiXkA/XFxcXHcuKlxcXFx1MDAwMCRcIixcbiAgICAgICAgICAgICAgXCJeXFxcXC5cXFxcLi4qXFxcXHUwMDAwJFwiLFxuICAgICAgICAgICAgICBcIl5cXFxcLi4qXFxcXHUwMDAwJFwiXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgLy8gU2lkZSBlZmZlY3QgaW1wb3J0cyAoZS5nLiwgYGltcG9ydCAnc29tZS1tb2R1bGUnYClcbiAgICAgICAgICAgIFtcIl5cXFxcdTAwMDBcIl0sXG4gICAgICAgICAgICAvLyBOb2RlLmpzIGJ1aWx0aW5zIHByZWZpeGVkIHdpdGggYG5vZGU6YFxuICAgICAgICAgICAgW1wiXm5vZGU6XCJdLFxuICAgICAgICAgICAgLy8gVGhpbmdzIHRoYXQgc3RhcnQgd2l0aCBhIGxldHRlciAob3IgZGlnaXQgb3IgdW5kZXJzY29yZSksIG9yIGBAYCBmb2xsb3dlZCBieSBhIGxldHRlclxuICAgICAgICAgICAgW1wiXkA/XFxcXHdcIl0sXG4gICAgICAgICAgICAvLyBBYnNvbHV0ZSBpbXBvcnRzIChlLmcuLCBgaW1wb3J0IHNvbWV0aGluZyBmcm9tICdzcmMvdXRpbHMnYClcbiAgICAgICAgICAgIFtcIl5bXi5dXCJdLFxuICAgICAgICAgICAgLy8gUGFyZW50IGRpcmVjdG9yeSByZWxhdGl2ZSBpbXBvcnRzIChlLmcuLCBgaW1wb3J0IHNvbWV0aGluZyBmcm9tICcuLi91dGlscydgKVxuICAgICAgICAgICAgW1wiXlxcXFwuXFxcXC5cIl0sXG4gICAgICAgICAgICAvLyBDdXJyZW50IGRpcmVjdG9yeSByZWxhdGl2ZSBpbXBvcnRzIChlLmcuLCBgaW1wb3J0IHNvbWV0aGluZyBmcm9tICcuL3V0aWxzJ2ApXG4gICAgICAgICAgICBbXCJeXFxcXC5cIl1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBcInNpbXBsZS1pbXBvcnQtc29ydC9leHBvcnRzXCI6IFwiZXJyb3JcIlxuICAgIH1cbiAgfVxuXTtcblxuZXhwb3J0IHtcbiAgaW1wb3J0U29ydFxufTtcbiIsICJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcXFxcY2h1bmstS1I3Uk1aN1YuanNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcaXN5XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcd2Vic2l0ZS1hcHBzXFxcXHBhY2thZ2VzXFxcXGVzbGludC1jb25maWdcXFxcZGlzdFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vQzovVXNlcnMvaXN5L0RvY3VtZW50cy9HaXRIdWIvd2Vic2l0ZS1hcHBzL3BhY2thZ2VzL2VzbGludC1jb25maWcvZGlzdC9jaHVuay1LUjdSTVo3Vi5qc1wiO2ltcG9ydCB7XG4gIGltcG9ydFBsdWdpblxufSBmcm9tIFwiLi9jaHVuay1FVkZFSVhNQi5qc1wiO1xuXG4vLyBzcmMvY29uZmlncy9pbXBvcnRzLnRzXG52YXIgaW1wb3J0cyA9IFtcbiAge1xuICAgIG5hbWU6IFwidHN6aG9uZzA0MTE6aW1wb3J0c1wiLFxuICAgIHBsdWdpbnM6IHtcbiAgICAgIGltcG9ydDogaW1wb3J0UGx1Z2luXG4gICAgfSxcbiAgICBydWxlczoge1xuICAgICAgXCJpbXBvcnQvbm8tYW1kXCI6IFwiZXJyb3JcIixcbiAgICAgIFwiaW1wb3J0L25vLWNvbW1vbmpzXCI6IFwiZXJyb3JcIixcbiAgICAgIFwiaW1wb3J0L2ZpcnN0XCI6IFwiZXJyb3JcIixcbiAgICAgIFwiaW1wb3J0L25vLWR1cGxpY2F0ZXNcIjogXCJlcnJvclwiLFxuICAgICAgXCJpbXBvcnQvbm8tbXV0YWJsZS1leHBvcnRzXCI6IFwiZXJyb3JcIixcbiAgICAgIFwiaW1wb3J0L25vLW5hbWVkLWRlZmF1bHRcIjogXCJlcnJvclwiLFxuICAgICAgXCJpbXBvcnQvbm8tc2VsZi1pbXBvcnRcIjogXCJlcnJvclwiLFxuICAgICAgXCJpbXBvcnQvbm8td2VicGFjay1sb2FkZXItc3ludGF4XCI6IFwiZXJyb3JcIixcbiAgICAgIFwiaW1wb3J0L25ld2xpbmUtYWZ0ZXItaW1wb3J0XCI6IFtcImVycm9yXCIsIHsgY291bnQ6IDEgfV1cbiAgICB9XG4gIH1cbl07XG5cbmV4cG9ydCB7XG4gIGltcG9ydHNcbn07XG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxkaXN0XFxcXGNodW5rLUpEN1FXN0M2LmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0M6L1VzZXJzL2lzeS9Eb2N1bWVudHMvR2l0SHViL3dlYnNpdGUtYXBwcy9wYWNrYWdlcy9lc2xpbnQtY29uZmlnL2Rpc3QvY2h1bmstSkQ3UVc3QzYuanNcIjtpbXBvcnQge1xuICBkZWZhdWx0IGFzIGRlZmF1bHQyLFxuICBkZWZhdWx0MTUgYXMgZGVmYXVsdDNcbn0gZnJvbSBcIi4vY2h1bmstRVZGRUlYTUIuanNcIjtcblxuLy8gc3JjL2NvbmZpZ3MvamF2YXNjcmlwdC50c1xuaW1wb3J0IGdsb2JhbHMgZnJvbSBcImdsb2JhbHNcIjtcbnZhciBqYXZhc2NyaXB0ID0gW1xuICB7XG4gICAgbmFtZTogXCJ0c3pob25nMDQxMTpqYXZhc2NyaXB0XCIsXG4gICAgbGFuZ3VhZ2VPcHRpb25zOiB7XG4gICAgICBlY21hVmVyc2lvbjogMjAyMixcbiAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgLi4uZ2xvYmFscy5icm93c2VyLFxuICAgICAgICAuLi5nbG9iYWxzLm5vZGUsXG4gICAgICAgIC4uLmdsb2JhbHMuZXMyMDIyLFxuICAgICAgICBkb2N1bWVudDogXCJyZWFkb25seVwiLFxuICAgICAgICBuYXZpZ2F0b3I6IFwicmVhZG9ubHlcIixcbiAgICAgICAgd2luZG93OiBcInJlYWRvbmx5XCJcbiAgICAgIH0sXG4gICAgICBwYXJzZXJPcHRpb25zOiB7XG4gICAgICAgIGVjbWFGZWF0dXJlczoge1xuICAgICAgICAgIGpzeDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBlY21hVmVyc2lvbjogMjAyMixcbiAgICAgICAgc291cmNlVHlwZTogXCJtb2R1bGVcIlxuICAgICAgfVxuICAgIH0sXG4gICAgbGludGVyT3B0aW9uczoge1xuICAgICAgcmVwb3J0VW51c2VkRGlzYWJsZURpcmVjdGl2ZXM6IHRydWVcbiAgICB9LFxuICAgIHBsdWdpbnM6IHtcbiAgICAgIFwidW51c2VkLWltcG9ydHNcIjogZGVmYXVsdDNcbiAgICB9LFxuICAgIHJ1bGVzOiB7XG4gICAgICAuLi5kZWZhdWx0Mi5jb25maWdzLnJlY29tbWVuZGVkLnJ1bGVzLFxuICAgICAgXCJ1bnVzZWQtaW1wb3J0cy9uby11bnVzZWQtaW1wb3J0c1wiOiBcImVycm9yXCIsXG4gICAgICBcInVudXNlZC1pbXBvcnRzL25vLXVudXNlZC12YXJzXCI6IFtcbiAgICAgICAgXCJlcnJvclwiLFxuICAgICAgICB7XG4gICAgICAgICAgdmFyczogXCJhbGxcIixcbiAgICAgICAgICB2YXJzSWdub3JlUGF0dGVybjogXCJeX1wiLFxuICAgICAgICAgIGFyZ3M6IFwiYWZ0ZXItdXNlZFwiLFxuICAgICAgICAgIGFyZ3NJZ25vcmVQYXR0ZXJuOiBcIl5fXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgfVxuXTtcblxuZXhwb3J0IHtcbiAgamF2YXNjcmlwdFxufTtcbiIsICJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIkM6XFxcXFVzZXJzXFxcXGlzeVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHdlYnNpdGUtYXBwc1xcXFxwYWNrYWdlc1xcXFxlc2xpbnQtY29uZmlnXFxcXGRpc3RcXFxcaW5kZXguanNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcaXN5XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcd2Vic2l0ZS1hcHBzXFxcXHBhY2thZ2VzXFxcXGVzbGludC1jb25maWdcXFxcZGlzdFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vQzovVXNlcnMvaXN5L0RvY3VtZW50cy9HaXRIdWIvd2Vic2l0ZS1hcHBzL3BhY2thZ2VzL2VzbGludC1jb25maWcvZGlzdC9pbmRleC5qc1wiO2ltcG9ydCB7XG4gIHR5cGVzY3JpcHRcbn0gZnJvbSBcIi4vY2h1bmstUTY3WTJQSkEuanNcIjtcbmltcG9ydCB7XG4gIHVuaWNvcm5cbn0gZnJvbSBcIi4vY2h1bmstWUdRU1VTRzcuanNcIjtcbmltcG9ydCB7XG4gIG5leHRcbn0gZnJvbSBcIi4vY2h1bmstM01TNjRaSkguanNcIjtcbmltcG9ydCB7XG4gIHBsYXl3cmlnaHRcbn0gZnJvbSBcIi4vY2h1bmstNlRZVUMzRTcuanNcIjtcbmltcG9ydCB7XG4gIHByZXR0aWVyXG59IGZyb20gXCIuL2NodW5rLURKWDQyNzRELmpzXCI7XG5pbXBvcnQge1xuICByZWFjdFxufSBmcm9tIFwiLi9jaHVuay1RWUlDSktVUy5qc1wiO1xuaW1wb3J0IHtcbiAgc29uYXJqc1xufSBmcm9tIFwiLi9jaHVuay1LTVlKN08ySi5qc1wiO1xuaW1wb3J0IHtcbiAgdGVzdGluZ0xpYnJhcnlcbn0gZnJvbSBcIi4vY2h1bmstU09QRFkyS1UuanNcIjtcbmltcG9ydCB7XG4gIHR1cmJvXG59IGZyb20gXCIuL2NodW5rLUlEQVNPNERHLmpzXCI7XG5pbXBvcnQge1xuICBjb21tZW50c1xufSBmcm9tIFwiLi9jaHVuay1QQkJSRFNCWi5qc1wiO1xuaW1wb3J0IHtcbiAgaWdub3Jlc1xufSBmcm9tIFwiLi9jaHVuay1RT0ozS0dVWS5qc1wiO1xuaW1wb3J0IHtcbiAgR0xPQl9FMkUsXG4gIEdMT0JfRVhDTFVERSxcbiAgR0xPQl9KUyxcbiAgR0xPQl9KU1gsXG4gIEdMT0JfVEVTVCxcbiAgR0xPQl9UUyxcbiAgR0xPQl9UU1hcbn0gZnJvbSBcIi4vY2h1bmstS0xUN1NDU0YuanNcIjtcbmltcG9ydCB7XG4gIGltcG9ydFNvcnRcbn0gZnJvbSBcIi4vY2h1bmstR0VCTVc1R0guanNcIjtcbmltcG9ydCB7XG4gIGltcG9ydHNcbn0gZnJvbSBcIi4vY2h1bmstS1I3Uk1aN1YuanNcIjtcbmltcG9ydCB7XG4gIGphdmFzY3JpcHRcbn0gZnJvbSBcIi4vY2h1bmstSkQ3UVc3QzYuanNcIjtcbmltcG9ydCBcIi4vY2h1bmstRVZGRUlYTUIuanNcIjtcblxuLy8gc3JjL2luZGV4LnRzXG5pbXBvcnQgeyBpc1BhY2thZ2VFeGlzdHMgfSBmcm9tIFwibG9jYWwtcGtnXCI7XG52YXIgaGFzVHlwZVNjcmlwdCA9IGlzUGFja2FnZUV4aXN0cyhcInR5cGVzY3JpcHRcIik7XG52YXIgdHN6aG9uZzA0MTEgPSBhc3luYyAob3B0aW9ucyA9IHt9LCAuLi51c2VyQ29uZmlncykgPT4ge1xuICBjb25zdCB7XG4gICAgdHlwZXNjcmlwdDogZW5hYmxlVHlwZVNjcmlwdCA9IGhhc1R5cGVTY3JpcHQsXG4gICAgcmVhY3Q6IGVuYWJsZVJlYWN0ID0gZmFsc2UsXG4gICAgdHVyYm86IGVuYWJsZVR1cmJvID0gZmFsc2UsXG4gICAgbmV4dDogZW5hYmxlTmV4dCA9IGZhbHNlLFxuICAgIHBsYXl3cmlnaHQ6IGVuYWJsZVBsYXl3cmlnaHQgPSBmYWxzZSxcbiAgICB0ZXN0aW5nTGlicmFyeTogZW5hYmxlVGVzdGluZ0xpYnJhcnkgPSBmYWxzZSxcbiAgICBnaXRpZ25vcmU6IGVuYWJsZUdpdGlnbm9yZSA9IHRydWVcbiAgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IGNvbmZpZ3MgPSBbXTtcbiAgaWYgKGVuYWJsZUdpdGlnbm9yZSkge1xuICAgIGNvbmZpZ3MucHVzaCgoYXdhaXQgaW1wb3J0KFwiZXNsaW50LWNvbmZpZy1mbGF0LWdpdGlnbm9yZVwiKSkuZGVmYXVsdCgpKTtcbiAgfVxuICBjb25maWdzLnB1c2goXG4gICAgLi4uaWdub3JlcyxcbiAgICAuLi5qYXZhc2NyaXB0LFxuICAgIC4uLnVuaWNvcm4sXG4gICAgLi4uY29tbWVudHMsXG4gICAgLi4uaW1wb3J0U29ydCxcbiAgICAuLi5zb25hcmpzLFxuICAgIC4uLmltcG9ydHMsXG4gICAgLi4ucHJldHRpZXJcbiAgKTtcbiAgaWYgKGVuYWJsZVR5cGVTY3JpcHQpIHtcbiAgICBjb25maWdzLnB1c2goLi4udHlwZXNjcmlwdChvcHRpb25zKSk7XG4gIH1cbiAgaWYgKGVuYWJsZVJlYWN0KSB7XG4gICAgY29uZmlncy5wdXNoKC4uLnJlYWN0KG9wdGlvbnMpKTtcbiAgfVxuICBpZiAoZW5hYmxlVHVyYm8pIHtcbiAgICBjb25maWdzLnB1c2goLi4udHVyYm8pO1xuICB9XG4gIGlmIChlbmFibGVOZXh0KSB7XG4gICAgY29uZmlncy5wdXNoKC4uLm5leHQpO1xuICB9XG4gIGlmIChlbmFibGVQbGF5d3JpZ2h0KSB7XG4gICAgY29uZmlncy5wdXNoKC4uLnBsYXl3cmlnaHQpO1xuICB9XG4gIGlmIChlbmFibGVUZXN0aW5nTGlicmFyeSkge1xuICAgIGNvbmZpZ3MucHVzaCguLi50ZXN0aW5nTGlicmFyeSk7XG4gIH1cbiAgY29uZmlncy5wdXNoKC4uLnVzZXJDb25maWdzKTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59O1xudmFyIGluZGV4X2RlZmF1bHQgPSB0c3pob25nMDQxMTtcbmV4cG9ydCB7XG4gIEdMT0JfRTJFLFxuICBHTE9CX0VYQ0xVREUsXG4gIEdMT0JfSlMsXG4gIEdMT0JfSlNYLFxuICBHTE9CX1RFU1QsXG4gIEdMT0JfVFMsXG4gIEdMT0JfVFNYLFxuICBpbmRleF9kZWZhdWx0IGFzIGRlZmF1bHRcbn07XG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1xcXFxlc2xpbnQuY29uZmlnLm1qc1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFxpc3lcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFx3ZWJzaXRlLWFwcHNcXFxccGFja2FnZXNcXFxcZXNsaW50LWNvbmZpZ1wiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vQzovVXNlcnMvaXN5L0RvY3VtZW50cy9HaXRIdWIvd2Vic2l0ZS1hcHBzL3BhY2thZ2VzL2VzbGludC1jb25maWcvZXNsaW50LmNvbmZpZy5tanNcIjtpbXBvcnQgdHN6aG9uZzA0MTEgZnJvbSAnLi9kaXN0L2luZGV4LmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHN6aG9uZzA0MTEoe1xyXG4gIHByb2plY3Q6ICcuL3RzY29uZmlnLmpzb24nLFxyXG4gIHRzY29uZmlnUm9vdERpcjogaW1wb3J0Lm1ldGEuZGlybmFtZSxcclxuICByZWFjdDogdHJ1ZSxcclxuICBuZXh0OiB0cnVlLFxyXG4gIHBsYXl3cmlnaHQ6IHRydWUsXHJcbiAgdGVzdGluZ0xpYnJhcnk6IHRydWUsXHJcbiAgdHVyYm86IHRydWUsXHJcbiAgdHlwZXNjcmlwdDogdHJ1ZVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsSUFBSSxlQUFlO0FBQ25CLElBQUksVUFBVTtBQUNkLElBQUksV0FBVztBQUNmLElBQUksVUFBVTtBQUNkLElBQUksV0FBVztBQUNmLElBQUksV0FBVywyQkFBMkIsWUFBWTtBQUN0RCxJQUFJLFlBQVksNkJBQTZCLFlBQVk7QUFDekQsSUFBSSxlQUFl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
