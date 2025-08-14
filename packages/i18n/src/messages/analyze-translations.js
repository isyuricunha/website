import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get all nested keys from an object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Load all translation files
const languages = ['en', 'pt', 'zh', 'de', 'fr'];
const translations = {};

languages.forEach(lang => {
  try {
    const filePath = path.join(__dirname, `${lang}.json`);
    translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading ${lang}.json:`, error.message);
  }
});

// Get all keys from English (baseline)
const englishKeys = getAllKeys(translations.en).sort();
console.log(`Total keys in English: ${englishKeys.length}`);

// Analyze each language
languages.forEach(lang => {
  if (lang === 'en') return; // Skip English as it's the baseline
  
  console.log(`\n=== ${lang.toUpperCase()} Analysis ===`);
  const langKeys = getAllKeys(translations[lang]).sort();
  console.log(`Total keys in ${lang}: ${langKeys.length}`);
  
  // Find missing keys
  const missingKeys = englishKeys.filter(key => !langKeys.includes(key));
  if (missingKeys.length > 0) {
    console.log(`\nMissing keys in ${lang} (${missingKeys.length}):`);
    missingKeys.forEach(key => console.log(`  - ${key}`));
  } else {
    console.log(`✅ No missing keys in ${lang}`);
  }
  
  // Find extra keys (keys that exist in this language but not in English)
  const extraKeys = langKeys.filter(key => !englishKeys.includes(key));
  if (extraKeys.length > 0) {
    console.log(`\nExtra keys in ${lang} (${extraKeys.length}):`);
    extraKeys.forEach(key => console.log(`  + ${key}`));
  }
});

// Summary
console.log('\n=== SUMMARY ===');
languages.forEach(lang => {
  if (lang === 'en') return;
  const langKeys = getAllKeys(translations[lang]);
  const missingCount = englishKeys.filter(key => !langKeys.includes(key)).length;
  const completeness = ((langKeys.length - missingCount) / englishKeys.length * 100).toFixed(1);
  console.log(`${lang.toUpperCase()}: ${completeness}% complete (${langKeys.length}/${englishKeys.length} keys)`);
});
