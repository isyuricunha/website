import type { Options } from '@/index'
import type { ESLint, Linter } from 'eslint'

import { GLOB_JS, GLOB_JSX, GLOB_TS, GLOB_TSX } from '@/globs'
import { jsxA11yPlugin, reactHooksPlugin, reactPlugin, typescriptParser } from '@/plugins'

export const react = (options?: Options): Linter.Config[] => {
  const reactPluginAll = reactPlugin.configs.all

  const rawRules: Linter.RulesRecord = {
    ...reactPluginAll.rules,
    ...reactHooksPlugin.configs.recommended.rules,
    ...jsxA11yPlugin.configs.strict.rules,

    // @eslint-react — rules that were renamed in v4 (flat names, dash-separated)
    '@eslint-react/no-array-index-key': 'off',
    '@eslint-react/no-nested-component-definitions': 'off',
    '@eslint-react/prefer-destructuring-assignment': 'off',
    '@eslint-react/jsx-no-useless-fragment': 'off',

    // @eslint-react/dom (flat names in v4: @eslint-react/dom-*)
    '@eslint-react/dom-no-dangerously-set-innerhtml': 'off',

    // react-hooks
    'react-hooks/incompatible-library': 'off',
    'react-hooks/static-components': 'off',

    // jsx-a11y
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/heading-has-content': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
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
  }

  // Filter out RSC-specific rules
  const baseRules: Linter.RulesRecord = Object.fromEntries(
    Object.entries(rawRules).filter(([key]) => !key.startsWith('@eslint-react/rsc'))
  )

  return [
    {
      name: 'isyuricunha:react',
      plugins: {
        // In v4 everything lives in the single @eslint-react plugin
        '@eslint-react': reactPlugin as unknown as ESLint.Plugin,
        'react-hooks': reactHooksPlugin as unknown as ESLint.Plugin,
        'jsx-a11y': jsxA11yPlugin as unknown as ESLint.Plugin
      },
      files: [GLOB_JS, GLOB_JSX, GLOB_TS, GLOB_TSX],
      languageOptions: {
        parser: typescriptParser,
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          },
          project: options?.project,
          sourceType: 'module'
        }
      },
      rules: baseRules,
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
