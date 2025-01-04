// src/i18n.ts
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // Importe o detector de idioma

import csTranslation from '../../../src/locales/cs.json';
import deTranslation from '../../../src/locales/de.json';
import enTranslation from '../../../src/locales/en.json';
import esTranslation from '../../../src/locales/es.json';
import frTranslation from '../../../src/locales/fr.json';
import hiTranslation from '../../../src/locales/hi.json';
import huTranslation from '../../../src/locales/hu.json';
import itTranslation from '../../../src/locales/it.json';
import jaTranslation from '../../../src/locales/ja.json';
import koTranslation from '../../../src/locales/ko.json';
import nlTranslation from '../../../src/locales/nl.json';
import phTranslation from '../../../src/locales/ph.json';
import ptTranslation from '../../../src/locales/pt.json';
import ruTranslation from '../../../src/locales/ru.json';
import srTranslation from '../../../src/locales/sr.json';
import zhTranslation from '../../../src/locales/zh.json';

i18n
  .use(LanguageDetector) // Use o detector de idioma
  .use(initReactI18next)
  .init({
    resources: {
      cs: { translation: csTranslation },
      de: { translation: deTranslation },
      en: { translation: enTranslation },
      es: { translation: esTranslation },
      fr: { translation: frTranslation },
      hi: { translation: hiTranslation },
      hu: { translation: huTranslation },
      it: { translation: itTranslation },
      ja: { translation: jaTranslation },
      ko: { translation: koTranslation },
      nl: { translation: nlTranslation },
      ph: { translation: phTranslation },
      pt: { translation: ptTranslation },
      ru: { translation: ruTranslation },
      sr: { translation: srTranslation },
      zh: { translation: zhTranslation },
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
