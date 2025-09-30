#!/usr/bin/env python3
"""
Script para sincronizar traduções usando Ollama API com modelo yue-f
Traduz apenas posts que ainda não existem nas línguas de destino
"""

import os
from pathlib import Path
import requests
import re
import time
import json

SOURCE_DIR = Path("apps/web/src/content/blog/en")
ALL_LANGUAGES = ['ar', 'bn', 'de', 'en', 'es', 'fr', 'hi', 'ja', 'pt', 'ru', 'ur', 'zh']

# Configuração do Ollama
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "yue-f"

# Mapeamento de códigos de língua para nomes completos
LANG_NAMES = {
    'ar': 'Arabic',
    'bn': 'Bengali',
    'de': 'German',
    'es': 'Spanish',
    'fr': 'French',
    'hi': 'Hindi',
    'ja': 'Japanese',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ur': 'Urdu',
    'zh': 'Chinese'
}

def extract_frontmatter_and_content(file_path):
    """Extrai frontmatter e conteúdo do arquivo MDX"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    
    if frontmatter_match:
        frontmatter = frontmatter_match.group(1)
        body = frontmatter_match.group(2)
        return frontmatter, body
    
    return None, content

def parse_frontmatter(frontmatter_text):
    """Parse frontmatter em dicionário"""
    lines = frontmatter_text.split('\n')
    data = {}
    
    for line in lines:
        if ':' in line:
            key, value = line.split(':', 1)
            data[key.strip()] = value.strip().strip('"')
    
    return data

def translate_with_ollama(text, target_lang, max_retries=3):
    """Traduz texto usando Ollama API"""
    lang_name = LANG_NAMES.get(target_lang, target_lang)
    
    prompt = f"""Translate the following text from English to {lang_name}. 
Only provide the translation, without any explanations or additional text.
Preserve all markdown formatting, code blocks, and links exactly as they are.

Text to translate:
{text}

Translation:"""
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                OLLAMA_API_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                translation = result.get('response', '').strip()
                time.sleep(0.5)
                return translation
            else:
                print(f"        Erro HTTP {response.status_code}")
                if attempt < max_retries - 1:
                    time.sleep(2)
        
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"        Tentativa {attempt + 1} falhou: {e}")
                time.sleep(2)
            else:
                print(f"        ERRO após {max_retries} tentativas: {e}")
                return text
    
    return text

def translate_text_robust(text, target_lang):
    """Traduz texto de forma robusta usando Ollama"""
    if not text or text.strip() == '':
        return text
    
    # Para textos curtos, traduz direto
    if len(text) < 3000:
        return translate_with_ollama(text, target_lang)
    
    # Para textos longos, divide por parágrafos
    paragraphs = text.split('\n\n')
    translated_paragraphs = []
    
    for para in paragraphs:
        if para.strip():
            translated_para = translate_with_ollama(para, target_lang)
            translated_paragraphs.append(translated_para)
        else:
            translated_paragraphs.append('')
    
    return '\n\n'.join(translated_paragraphs)

def translate_post(source_file, target_lang):
    """Traduz um post completo"""
    frontmatter_text, body = extract_frontmatter_and_content(source_file)
    
    if not frontmatter_text:
        print(f"        ERRO: Não foi possível extrair frontmatter")
        return None
    
    frontmatter_data = parse_frontmatter(frontmatter_text)
    
    # Traduz title
    if 'title' in frontmatter_data:
        title_clean = frontmatter_data['title'].strip('"\'')
        print(f"        Traduzindo título...")
        frontmatter_data['title'] = translate_with_ollama(title_clean, target_lang)
    
    # Traduz summary
    if 'summary' in frontmatter_data:
        summary_clean = frontmatter_data['summary'].strip('"\'')
        print(f"        Traduzindo resumo...")
        frontmatter_data['summary'] = translate_with_ollama(summary_clean, target_lang)
    
    # Traduz corpo
    print(f"        Traduzindo corpo ({len(body)} chars)...")
    translated_body = translate_text_robust(body.strip(), target_lang)
    
    # Reconstrói arquivo
    new_frontmatter = '---\n'
    for key, value in frontmatter_data.items():
        value_escaped = str(value).replace('"', '\\"')
        new_frontmatter += f'{key}: "{value_escaped}"\n'
    new_frontmatter += '---\n\n'
    
    return new_frontmatter + translated_body

def check_missing_translations():
    """Verifica quais traduções estão faltando"""
    source_path = Path(SOURCE_DIR)
    
    if not source_path.exists():
        print(f"ERRO: Diretório fonte não encontrado: {source_path}")
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

def test_ollama_connection():
    """Testa conexão com Ollama"""
    try:
        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": "Hello",
                "stream": False
            },
            timeout=10
        )
        return response.status_code == 200
    except Exception as e:
        print(f"ERRO: Não foi possível conectar ao Ollama: {e}")
        return False

def main():
    print("="*60)
    print("SINCRONIZAÇÃO DE TRADUÇÕES - OLLAMA (yue-f)")
    print("="*60)
    
    # Testa conexão com Ollama
    print("\n🔌 Testando conexão com Ollama...")
    if not test_ollama_connection():
        print("❌ Falha ao conectar com Ollama")
        print("   Certifique-se de que o Ollama está rodando e o modelo yue-f está instalado")
        return
    print("✅ Conexão com Ollama estabelecida\n")
    
    missing = check_missing_translations()
    
    if not missing:
        print("✅ Todas as traduções estão sincronizadas!")
        return
    
    total_missing = sum(len(files) for files in missing.values())
    print(f"📊 Encontradas {total_missing} traduções faltantes em {len(missing)} línguas\n")
    
    for lang, files in missing.items():
        print(f"  {lang.upper()}: {len(files)} posts faltando")
    
    print("\n" + "="*60)
    print("INICIANDO TRADUÇÕES")
    print("="*60 + "\n")
    
    source_path = Path(SOURCE_DIR)
    current = 0
    
    for lang, files in missing.items():
        for filename in sorted(files):
            current += 1
            source_file = source_path / filename
            
            print(f"📄 [{current}/{total_missing}] {filename} -> {lang.upper()}")
            
            target_dir = source_path.parent / lang
            target_dir.mkdir(exist_ok=True)
            target_file = target_dir / filename
            
            translated_content = translate_post(source_file, lang)
            
            if translated_content:
                with open(target_file, 'w', encoding='utf-8') as f:
                    f.write(translated_content)
                print(f"    ✅ Traduzido com sucesso!\n")
            else:
                print(f"    ❌ Falha na tradução\n")
    
    print("="*60)
    print("SINCRONIZAÇÃO CONCLUÍDA!")
    print("="*60)

if __name__ == '__main__':
    main()
