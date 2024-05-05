// src/i18n.ts
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // Importe o detector de idioma

import enTranslation from '../../../src/locales/en.json';
import ptTranslation from '../../../src/locales/pt.json';

i18n
  .use(LanguageDetector) // Use o detector de idioma
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      pt: { translation: ptTranslation },
    },
    fallbackLng: 'en', // idioma de fallback
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'], // ordem de detecção
      caches: ['localStorage', 'cookie'], // onde armazenar o idioma detectado
      excludeCacheFor: ['cimode'], // não use o cache se o idioma for 'cimode'
    },
    interpolation: { escapeValue: false },
  });

export default i18n;