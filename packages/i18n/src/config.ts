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
    code: 'fr',
    label: 'Français'
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
    code: 'zh',
    label: '中文'
  },
  {
    code: 'ar',
    label: 'العربية'
  },
  {
    code: 'hi',
    label: 'हिन्दी'
  },
  {
    code: 'bn',
    label: 'বাংলা'
  },
  {
    code: 'ru',
    label: 'Русский'
  },
  {
    code: 'ur',
    label: 'اردو'
  }
]

export const i18n = {
  locales: supportedLanguages.map(({ code }) => code),
  defaultLocale: supportedLanguages.find(({ default: isDefault }) => isDefault)?.code ?? 'en'
} as const
