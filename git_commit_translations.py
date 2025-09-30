#!/usr/bin/env python3
"""
Script to automatically commit translations with --no-verify
"""

import subprocess
from pathlib import Path
from datetime import datetime

def run_git_command(command, cwd=None):
    """Execute git command and return result"""
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
    """Get translation statistics"""
    blog_dir = Path("apps/web/src/content/blog")
    stats = {}
    
    for lang_dir in blog_dir.iterdir():
        if lang_dir.is_dir():
            mdx_count = len(list(lang_dir.glob('*.mdx')))
            stats[lang_dir.name] = mdx_count
    
    return stats

def main():
    print("="*60)
    print("GIT COMMIT - TRANSLATIONS")
    print("="*60 + "\n")
    
    # Check if we're in a git repository
    success, _, _ = run_git_command("git status")
    if not success:
        print("❌ ERROR: Not a git repository or git is not installed")
        return
    
    print("✅ Git repository detected\n")
    
    # Get statistics
    stats = get_translation_stats()
    print("📊 Translation statistics:")
    for lang, count in sorted(stats.items()):
        print(f"  {lang.upper()}: {count} posts")
    
    total_posts = sum(stats.values())
    total_langs = len(stats)
    print(f"\n  Total: {total_posts} posts in {total_langs} languages\n")
    
    # Add files to staging
    print("📦 Adding files to staging...")
    success, stdout, stderr = run_git_command("git add apps/web/src/content/blog/")
    
    if not success:
        print(f"❌ ERROR adding files: {stderr}")
        return
    
    print("✅ Files added to staging\n")
    
    # Check if there are changes to commit
    success, stdout, _ = run_git_command("git diff --cached --name-only")
    
    if not stdout.strip():
        print("ℹ️  No changes to commit")
        return
    
    changed_files = stdout.strip().split('\n')
    print(f"📝 {len(changed_files)} files modified\n")
    
    # Create commit message
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_message = f"chore: sync blog translations ({total_posts} posts in {total_langs} languages) - {timestamp}"
    
    print(f"💬 Commit message:\n   {commit_message}\n")
    
    # Make commit with --no-verify
    print("🚀 Committing...")
    success, stdout, stderr = run_git_command(f'git commit --no-verify -m "{commit_message}"')
    
    if not success:
        if "nothing to commit" in stderr.lower():
            print("ℹ️  No changes to commit")
        else:
            print(f"❌ ERROR committing: {stderr}")
        return
    
    print("✅ Commit successful!\n")
    print(stdout)
    
    # Show status
    print("\n📋 Repository status:")
    success, stdout, _ = run_git_command("git status")
    print(stdout)
    
    print("\n" + "="*60)
    print("COMMIT COMPLETED!")
    print("="*60)
    print("\n💡 To push, run: git push")

if __name__ == '__main__':
    main()
