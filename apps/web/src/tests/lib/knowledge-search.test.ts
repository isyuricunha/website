import { describe, expect, it } from 'vitest'

import { createKnowledgeIndex, tokenizeKnowledge } from '@/lib/ai/knowledge-search'

const entry = (title: string, content: string, slug: string) => ({
  title,
  content,
  slug,
  href: '/' + slug,
  type: 'post',
  description: ''
})

describe('knowledge search', () => {
  it('matches accented Latin and CJK words without dropping them', () => {
    expect(tokenizeKnowledge('infraestrutura automação')).toContain('automacao')
    expect(tokenizeKnowledge('自動化')).not.toHaveLength(0)
    expect(tokenizeKnowledge('数据库')).not.toHaveLength(0)
  })
  it('matches body content and excludes unrelated stop-word-only matches', () => {
    const search = createKnowledgeIndex([
      entry('The Art of Starting Over', 'love and relationships', 'love'),
      entry('Operations', 'Docker infrastructure, automation and backups', 'operations'),
      entry('データベース', '自動化とバックアップ', 'ja'),
      entry('数据库', '管理和自动化', 'zh')
    ])
    expect(
      search('Please recommend a blog post about Docker').map((item) => item.entry.slug)
    ).toEqual(['operations'])
    expect(search('自動化').map((item) => item.entry.slug)).toContain('ja')
    expect(search('数据库').map((item) => item.entry.slug)).toContain('zh')
    expect(search('nonexistent topic xyz')).toHaveLength(0)
  })
})
