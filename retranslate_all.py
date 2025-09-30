#!/usr/bin/env python3
"""
Script para deletar e recriar todas as traduções com melhor qualidade
"""

import os
import shutil
from pathlib import Path
from deep_translator import GoogleTranslator
import re
import time

SOURCE_DIR = Path("apps/web/src/content/blog/en")
TARGET_LANGUAGES = {
    'es': 'es',
    'ar': 'ar', 
    'ru': 'ru',
    'hi': 'hi',
    'bn': 'bn',
    'ur': 'ur'
}

# Posts já traduzidos manualmente - NÃO DELETAR
MANUAL_TRANSLATIONS = [
    'im-proud-of-you.mdx',
    'one-day-at-a-time.mdx',
    'im-glad-youre-here-dont-go-anywhere.mdx',
    'navigating-contradictions-in-life.mdx',
    'disconnected.mdx',
    'confessing-my-stupidity.mdx'
]

def extract_frontmatter_and_content(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    
    if frontmatter_match:
        frontmatter = frontmatter_match.group(1)
        body = frontmatter_match.group(2)
        return frontmatter, body
    
    return None, content

def parse_frontmatter(frontmatter_text):
    lines = frontmatter_text.split('\n')
    data = {}
    
    for line in lines:
        if ':' in line:
            key, value = line.split(':', 1)
            data[key.strip()] = value.strip().strip('"')
    
    return data

def translate_chunk(text, target_lang, max_retries=3):
    """Traduz um chunk com retry"""
    for attempt in range(max_retries):
        try:
            translator = GoogleTranslator(source='en', target=target_lang)
            result = translator.translate(text)
            time.sleep(0.3)  # Pausa entre traduções
            return result
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"      Tentativa {attempt + 1} falhou, tentando novamente...")
                time.sleep(1)
            else:
                print(f"      ERRO após {max_retries} tentativas: {e}")
                return text
    return text

def translate_text_robust(text, target_lang):
    """Traduz texto de forma robusta, linha por linha para textos longos"""
    if not text or text.strip() == '':
        return text
    
    # Para textos curtos, traduz direto
    if len(text) < 2000:
        return translate_chunk(text, target_lang)
    
    # Para textos longos, divide por linhas
    lines = text.split('\n')
    translated_lines = []
    current_chunk = ""
    
    for line in lines:
        # Se a linha é muito longa, traduz sozinha
        if len(line) > 2000:
            if current_chunk:
                translated_lines.append(translate_chunk(current_chunk, target_lang))
                current_chunk = ""
            
            # Divide a linha longa em sentenças
            sentences = line.split('. ')
            translated_sentences = []
            for sentence in sentences:
                if sentence.strip():
                    translated_sentences.append(translate_chunk(sentence, target_lang))
            translated_lines.append('. '.join(translated_sentences))
        
        # Acumula linhas em chunks
        elif len(current_chunk) + len(line) < 2000:
            current_chunk += line + '\n'
        else:
            if current_chunk:
                translated_lines.append(translate_chunk(current_chunk.rstrip('\n'), target_lang))
            current_chunk = line + '\n'
    
    # Traduz o último chunk
    if current_chunk:
        translated_lines.append(translate_chunk(current_chunk.rstrip('\n'), target_lang))
    
    return '\n'.join(translated_lines)

def translate_post(source_file, target_lang):
    """Traduz um post completo"""
    frontmatter_text, body = extract_frontmatter_and_content(source_file)
    
    if not frontmatter_text:
        print(f"      ERRO: Não foi possível extrair frontmatter")
        return None
    
    frontmatter_data = parse_frontmatter(frontmatter_text)
    
    # Traduz title e summary
    if 'title' in frontmatter_data:
        title_clean = frontmatter_data['title'].strip('"\'')
        frontmatter_data['title'] = translate_chunk(title_clean, target_lang)
    
    if 'summary' in frontmatter_data:
        summary_clean = frontmatter_data['summary'].strip('"\'')
        frontmatter_data['summary'] = translate_chunk(summary_clean, target_lang)
    
    # Traduz o corpo
    print(f"      Traduzindo corpo ({len(body)} chars)...")
    translated_body = translate_text_robust(body.strip(), target_lang)
    
    # Reconstrói o arquivo
    new_frontmatter = '---\n'
    for key, value in frontmatter_data.items():
        value_escaped = str(value).replace('"', '\\"')
        new_frontmatter += f'{key}: "{value_escaped}"\n'
    new_frontmatter += '---\n\n'
    
    return new_frontmatter + translated_body

def main():
    source_path = Path(SOURCE_DIR)
    
    if not source_path.exists():
        print(f"ERRO: Diretório fonte não encontrado: {source_path}")
        return
    
    mdx_files = sorted(source_path.glob('*.mdx'))
    
    print("="*60)
    print("DELETANDO TRADUÇÕES AUTOMÁTICAS ANTIGAS")
    print("="*60)
    
    # Deleta traduções automáticas antigas (exceto as manuais)
    for lang_code in TARGET_LANGUAGES.keys():
        lang_dir = source_path.parent / lang_code
        if lang_dir.exists():
            for mdx_file in mdx_files:
                if mdx_file.name not in MANUAL_TRANSLATIONS:
                    target_file = lang_dir / mdx_file.name
                    if target_file.exists():
                        target_file.unlink()
                        print(f"  ❌ Deletado: {lang_code}/{mdx_file.name}")
    
    print("\n" + "="*60)
    print("RECRIANDO TRADUÇÕES COM MELHOR QUALIDADE")
    print("="*60)
    
    total_files = len([f for f in mdx_files if f.name not in MANUAL_TRANSLATIONS])
    current = 0
    
    for mdx_file in mdx_files:
        if mdx_file.name in MANUAL_TRANSLATIONS:
            print(f"\n⏭️  Pulando {mdx_file.name} (tradução manual)")
            continue
        
        current += 1
        print(f"\n📄 [{current}/{total_files}] {mdx_file.name}")
        
        for lang_code, lang_target in TARGET_LANGUAGES.items():
            print(f"  🌐 Traduzindo para {lang_code.upper()}...")
            
            target_dir = source_path.parent / lang_code
            target_dir.mkdir(exist_ok=True)
            target_file = target_dir / mdx_file.name
            
            translated_content = translate_post(mdx_file, lang_target)
            
            if translated_content:
                with open(target_file, 'w', encoding='utf-8') as f:
                    f.write(translated_content)
                print(f"      ✅ Criado com sucesso!")
            else:
                print(f"      ❌ Falha na tradução")
    
    print("\n" + "="*60)
    print("CONCLUÍDO!")
    print("="*60)

if __name__ == '__main__':
    main()
