import type { ThemeRegistration } from 'shiki'

export const YU_DARK_SHIKI_THEME: ThemeRegistration = {
  name: 'yu-dark',
  displayName: 'Yu Dark',
  type: 'dark',
  fg: '#f4f1e8',
  bg: '#10100f',
  colors: {
    'editor.background': '#10100f',
    'editor.foreground': '#f4f1e8',
    'editorLineNumber.foreground': '#666157',
    'editorLineNumber.activeForeground': '#b8b2a4',
    'editor.selectionBackground': '#50789647',
    'editor.lineHighlightBackground': '#ffffff08',
    'editorCursor.foreground': '#d6a84f'
  },
  settings: [
    {
      settings: {
        foreground: '#f4f1e8',
        background: '#10100f'
      }
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: '#87826f',
        fontStyle: 'italic'
      }
    },
    {
      scope: ['keyword', 'storage', 'storage.type', 'entity.name.tag'],
      settings: {
        foreground: '#d9a8f5'
      }
    },
    {
      scope: ['string', 'constant.other.symbol', 'markup.heading'],
      settings: {
        foreground: '#8fd6a0'
      }
    },
    {
      scope: ['constant.numeric', 'constant.language.boolean', 'constant.language.null'],
      settings: {
        foreground: '#e8c07a'
      }
    },
    {
      scope: ['entity.name.function', 'support.function', 'variable.function'],
      settings: {
        foreground: '#7fdcff'
      }
    },
    {
      scope: ['variable.parameter', 'meta.function.parameters'],
      settings: {
        foreground: '#f0d2a2'
      }
    },
    {
      scope: ['variable', 'string constant.other.placeholder'],
      settings: {
        foreground: '#f4f1e8'
      }
    },
    {
      scope: [
        'variable.other.property',
        'support.type.property-name',
        'entity.other.attribute-name'
      ],
      settings: {
        foreground: '#e8c07a'
      }
    },
    {
      scope: ['entity.name.class', 'support.class', 'entity.name.namespace'],
      settings: {
        foreground: '#7fdcff'
      }
    },
    {
      scope: ['entity.name.type', 'support.type'],
      settings: {
        foreground: '#f0b35a'
      }
    },
    {
      scope: ['keyword.operator', 'punctuation', 'meta.brace'],
      settings: {
        foreground: '#9a9488'
      }
    },
    {
      scope: ['string.regexp', 'constant.character.escape'],
      settings: {
        foreground: '#ff9f7e'
      }
    },
    {
      scope: ['meta.decorator', 'entity.name.function.decorator'],
      settings: {
        foreground: '#bf5af2'
      }
    },
    {
      scope: ['invalid', 'invalid.illegal'],
      settings: {
        foreground: '#ff6961'
      }
    }
  ]
}
