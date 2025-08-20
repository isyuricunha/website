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
    code: 'zh',
    label: '中文'
  },
  {
    code: 'de',
    label: 'Deutsch'
  },
  {
    code: 'ja',
    label: '日本語'
  },
  {
    code: 'fr',
    label: 'Français'
  },
  // {
  //   code: 'ko',
  //   label: '한국어'
  // }
]

export const i18n = {
  locales: supportedLanguages.map(({ code }) => code),
  defaultLocale: supportedLanguages.find(({ default: isDefault }) => isDefault)?.code ?? 'en'
} as const
