#!/usr/bin/env python3
"""
Script to sync translations using Google Translator
Translates only posts that don't exist in target languages
"""

import os
from pathlib import Path
from deep_translator import GoogleTranslator
import re
import time

SOURCE_DIR = Path("apps/web/src/content/blog/en")
ALL_LANGUAGES = ['ar', 'bn', 'de', 'en', 'es', 'fr', 'hi', 'ja', 'pt', 'ru', 'ur', 'zh']

# Mapeamento de códigos de língua para Google Translator
LANG_MAP = {
    'ar': 'ar',
    'bn': 'bn',
    'de': 'de',
    'es': 'es',
    'fr': 'fr',
    'hi': 'hi',
    'ja': 'ja',
    'pt': 'pt',
    'ru': 'ru',
    'ur': 'ur',
    'zh': 'zh-CN'
}

def extract_frontmatter_and_content(file_path):
    """Extract frontmatter and content from MDX file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    
    if frontmatter_match:
        frontmatter = frontmatter_match.group(1)
        body = frontmatter_match.group(2)
        return frontmatter, body
    
    return None, content

def parse_frontmatter(frontmatter_text):
    """Parse frontmatter into dictionary"""
    lines = frontmatter_text.split('\n')
    data = {}
    
    for line in lines:
        if ':' in line:
            key, value = line.split(':', 1)
            data[key.strip()] = value.strip().strip('"')
    
    return data

def translate_chunk(text, target_lang, max_retries=3):
    """Translate a chunk with retry"""
    for attempt in range(max_retries):
        try:
            translator = GoogleTranslator(source='en', target=target_lang)
            result = translator.translate(text)
            time.sleep(0.3)
            return result
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"        Attempt {attempt + 1} failed, retrying...")
                time.sleep(1)
            else:
                print(f"        ERROR after {max_retries} attempts: {e}")
                return text
    return text

def translate_text_robust(text, target_lang):
    """Translate text robustly"""
    if not text or text.strip() == '':
        return text
    
    if len(text) < 2000:
        return translate_chunk(text, target_lang)
    
    lines = text.split('\n')
    translated_lines = []
    current_chunk = ""
    
    for line in lines:
        if len(line) > 2000:
            if current_chunk:
                translated_lines.append(translate_chunk(current_chunk, target_lang))
                current_chunk = ""
            
            sentences = line.split('. ')
            translated_sentences = []
            for sentence in sentences:
                if sentence.strip():
                    translated_sentences.append(translate_chunk(sentence, target_lang))
            translated_lines.append('. '.join(translated_sentences))
        
        elif len(current_chunk) + len(line) < 2000:
            current_chunk += line + '\n'
        else:
            if current_chunk:
                translated_lines.append(translate_chunk(current_chunk.rstrip('\n'), target_lang))
            current_chunk = line + '\n'
    
    if current_chunk:
        translated_lines.append(translate_chunk(current_chunk.rstrip('\n'), target_lang))
    
    return '\n'.join(translated_lines)

def translate_post(source_file, target_lang):
    """Translate a complete post"""
    frontmatter_text, body = extract_frontmatter_and_content(source_file)
    
    if not frontmatter_text:
        print(f"        ERROR: Could not extract frontmatter")
        return None
    
    frontmatter_data = parse_frontmatter(frontmatter_text)
    
    if 'title' in frontmatter_data:
        title_clean = frontmatter_data['title'].strip('"\'')
        frontmatter_data['title'] = translate_chunk(title_clean, target_lang)
    
    if 'summary' in frontmatter_data:
        summary_clean = frontmatter_data['summary'].strip('"\'')
        frontmatter_data['summary'] = translate_chunk(summary_clean, target_lang)
    
    translated_body = translate_text_robust(body.strip(), target_lang)
    
    new_frontmatter = '---\n'
    for key, value in frontmatter_data.items():
        value_escaped = str(value).replace('"', '\\"')
        new_frontmatter += f'{key}: "{value_escaped}"\n'
    new_frontmatter += '---\n\n'
    
    return new_frontmatter + translated_body

def check_missing_translations():
    """Check which translations are missing"""
    source_path = Path(SOURCE_DIR)
    
    if not source_path.exists():
        print(f"ERROR: Source directory not found: {source_path}")
        return {}
    
    en_files = set([f.name for f in source_path.glob('*.mdx')])
    missing = {}
    
    for lang in ALL_LANGUAGES:
        if lang == 'en':
            continue
        
        lang_dir = source_path.parent / lang
        if not lang_dir.exists():
            missing[lang] = list(en_files)
            continue
        
        lang_files = set([f.name for f in lang_dir.glob('*.mdx')])
        missing_files = en_files - lang_files
        
        if missing_files:
            missing[lang] = list(missing_files)
    
    return missing

def main():
    print("="*60)
    print("TRANSLATION SYNC - GOOGLE TRANSLATOR")
    print("="*60)
    
    missing = check_missing_translations()
    
    if not missing:
        print("\n✅ All translations are synced!")
        return
    
    total_missing = sum(len(files) for files in missing.values())
    print(f"\n📊 Found {total_missing} missing translations in {len(missing)} languages\n")
    
    for lang, files in missing.items():
        print(f"  {lang.upper()}: {len(files)} posts missing")
    
    print("\n" + "="*60)
    print("STARTING TRANSLATIONS")
    print("="*60 + "\n")
    
    source_path = Path(SOURCE_DIR)
    current = 0
    
    for lang, files in missing.items():
        google_lang = LANG_MAP.get(lang, lang)
        
        for filename in sorted(files):
            current += 1
            source_file = source_path / filename
            
            print(f"📄 [{current}/{total_missing}] {filename} -> {lang.upper()}")
            
            target_dir = source_path.parent / lang
            target_dir.mkdir(exist_ok=True)
            target_file = target_dir / filename
            
            translated_content = translate_post(source_file, google_lang)
            
            if translated_content:
                with open(target_file, 'w', encoding='utf-8') as f:
                    f.write(translated_content)
                print(f"    ✅ Translated successfully!\n")
            else:
                print(f"    ❌ Translation failed\n")
    
    print("="*60)
    print("SYNC COMPLETED!")
    print("="*60)

if __name__ == '__main__':
    main()
