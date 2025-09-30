#!/usr/bin/env python3
"""
Script para fazer commit automático das traduções com --no-verify
"""

import subprocess
from pathlib import Path
from datetime import datetime

def run_git_command(command, cwd=None):
    """Executa comando git e retorna resultado"""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=True,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def get_translation_stats():
    """Obtém estatísticas das traduções"""
    blog_dir = Path("apps/web/src/content/blog")
    stats = {}
    
    for lang_dir in blog_dir.iterdir():
        if lang_dir.is_dir():
            mdx_count = len(list(lang_dir.glob('*.mdx')))
            stats[lang_dir.name] = mdx_count
    
    return stats

def main():
    print("="*60)
    print("GIT COMMIT - TRADUÇÕES")
    print("="*60 + "\n")
    
    # Verifica se estamos em um repositório git
    success, _, _ = run_git_command("git status")
    if not success:
        print("❌ ERRO: Não é um repositório git ou git não está instalado")
        return
    
    print("✅ Repositório git detectado\n")
    
    # Obtém estatísticas
    stats = get_translation_stats()
    print("📊 Estatísticas das traduções:")
    for lang, count in sorted(stats.items()):
        print(f"  {lang.upper()}: {count} posts")
    
    total_posts = sum(stats.values())
    total_langs = len(stats)
    print(f"\n  Total: {total_posts} posts em {total_langs} línguas\n")
    
    # Adiciona arquivos ao staging
    print("📦 Adicionando arquivos ao staging...")
    success, stdout, stderr = run_git_command("git add apps/web/src/content/blog/")
    
    if not success:
        print(f"❌ ERRO ao adicionar arquivos: {stderr}")
        return
    
    print("✅ Arquivos adicionados ao staging\n")
    
    # Verifica se há mudanças para commitar
    success, stdout, _ = run_git_command("git diff --cached --name-only")
    
    if not stdout.strip():
        print("ℹ️  Nenhuma mudança para commitar")
        return
    
    changed_files = stdout.strip().split('\n')
    print(f"📝 {len(changed_files)} arquivos modificados\n")
    
    # Cria mensagem de commit
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_message = f"chore: sync blog translations ({total_posts} posts in {total_langs} languages) - {timestamp}"
    
    print(f"💬 Mensagem do commit:\n   {commit_message}\n")
    
    # Faz o commit com --no-verify
    print("🚀 Fazendo commit...")
    success, stdout, stderr = run_git_command(f'git commit --no-verify -m "{commit_message}"')
    
    if not success:
        if "nothing to commit" in stderr.lower():
            print("ℹ️  Nenhuma mudança para commitar")
        else:
            print(f"❌ ERRO ao fazer commit: {stderr}")
        return
    
    print("✅ Commit realizado com sucesso!\n")
    print(stdout)
    
    # Mostra status
    print("\n📋 Status do repositório:")
    success, stdout, _ = run_git_command("git status")
    print(stdout)
    
    print("\n" + "="*60)
    print("COMMIT CONCLUÍDO!")
    print("="*60)
    print("\n💡 Para fazer push, execute: git push")

if __name__ == '__main__':
    main()
