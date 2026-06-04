import type { ThemeRegistration } from 'shiki'

export const YU_DARK_SHIKI_THEME: ThemeRegistration = {
  name: 'yu-dark',
  displayName: 'Yu Dark',
  type: 'dark',
  fg: '#f1ede3',
  bg: '#1a1912',
  colors: {
    'editor.background': '#1a1912',
    'editor.foreground': '#f1ede3',
    'editorLineNumber.foreground': '#5f5a50',
    'editorLineNumber.activeForeground': '#b8b2a4',
    'editor.selectionBackground': '#50789647',
    'editor.lineHighlightBackground': '#ffffff08',
    'editorCursor.foreground': '#d6a84f'
  },
  settings: [
    {
      settings: {
        foreground: '#f1ede3',
        background: '#1a1912'
      }
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: '#7e8a69'
      }
    },
    {
      scope: ['keyword', 'storage', 'storage.type', 'entity.name.tag'],
      settings: {
        foreground: '#c792ea'
      }
    },
    {
      scope: ['string', 'constant.other.symbol', 'markup.heading'],
      settings: {
        foreground: '#f2b36f'
      }
    },
    {
      scope: ['constant.numeric', 'constant.language.boolean', 'constant.language.null'],
      settings: {
        foreground: '#a3d48e'
      }
    },
    {
      scope: ['entity.name.function', 'support.function', 'variable.function'],
      settings: {
        foreground: '#f3d97b'
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
        foreground: '#88d8f5'
      }
    },
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'support.class',
        'support.type',
        'entity.name.namespace'
      ],
      settings: {
        foreground: '#7ee2c5'
      }
    },
    {
      scope: ['keyword.operator', 'punctuation', 'meta.brace'],
      settings: {
        foreground: '#c8c1b1'
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
