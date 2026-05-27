export const supportedLanguages = [
  {
    code: 'en',
    label: 'English',
    default: true
  },
  {
    code: 'pt',
    label: 'Português'
  },
  {
    code: 'es',
    label: 'Español'
  },
  {
    code: 'ja',
    label: '日本語'
  },
  {
    code: 'zh-CN',
    label: '中文（简体）'
  }
]

export const i18n = {
  locales: supportedLanguages.map(({ code }) => code),
  defaultLocale: supportedLanguages.find(({ default: isDefault }) => isDefault)?.code ?? 'en'
} as const
