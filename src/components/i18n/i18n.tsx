// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // Import language detector

// Import translation files for different languages
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
  .use(LanguageDetector) // Use the language detector to automatically detect user language
  .use(initReactI18next) // Initialize react-i18next integration
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
    fallbackLng: 'en', // Fallback language in case the detected language is not available
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'], // Detection order (navigator, HTML tag, URL path, subdomain)
      caches: ['localStorage', 'cookie'], // Where to store the detected language (localStorage and cookies)
      excludeCacheFor: ['cimode'], // Do not cache language for 'cimode'
    },
    interpolation: { escapeValue: false }, // Disable escaping of values to avoid issues with HTML rendering
  });

export default i18n;
