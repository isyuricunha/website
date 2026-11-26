import { describe, expect, it } from 'vitest'
import { allPosts, allProjects, allSnippets } from 'content-collections'
import { i18n } from '@isyuricunha/i18n/config'

import { executeSiteTool } from '@/lib/ai/assistant-tools'
import { find_citations, list_site_content, read_site_content } from '@/lib/ai/site-index'
import { publicContact } from '@/lib/public-contact'
import { getLocalizedPath } from '@/utils/get-localized-path'

describe('Nery public knowledge against compiled website content', () => {
  it.each(i18n.locales)('returns actual publication and update order in %s', (locale) => {
    const posts = allPosts.filter((post) => post.locale === locale)
    const newest = Math.max(...posts.map((post) => Date.parse(post.date)))
    const oldest = Math.min(...posts.map((post) => Date.parse(post.date)))
    const updated = Math.max(...posts.map((post) => Date.parse(post.modifiedTime)))
    const params = { locale, type: 'post' as const }
    expect(
      Date.parse(list_site_content({ ...params, order: 'newest' })[0]?.publishedAt ?? '')
    ).toBe(newest)
    expect(
      Date.parse(list_site_content({ ...params, order: 'oldest' })[0]?.publishedAt ?? '')
    ).toBe(oldest)
    expect(Date.parse(list_site_content({ ...params, order: 'updated' })[0]?.updatedAt ?? '')).toBe(
      updated
    )
    const snippets = allSnippets.filter((snippet) => snippet.locale === locale)
    const latestSnippet = Math.max(...snippets.map((snippet) => Date.parse(snippet.date)))
    expect(
      Date.parse(
        list_site_content({ locale, type: 'snippet', order: 'newest' })[0]?.publishedAt ?? ''
      )
    ).toBe(latestSnippet)
  })

  it.each(i18n.locales)('reads published contact and privacy data in %s', (locale) => {
    const contact = read_site_content('/contact', locale)
    expect(contact?.content).toContain(publicContact.email)
    expect(contact?.content).toContain(publicContact.github)
    expect(contact?.content).toContain(publicContact.linkedin)
    expect(contact?.citation.href).toBe(getLocalizedPath({ slug: '/contact', locale }))
    const privacy = read_site_content('/privacy', locale)
    expect(privacy?.content).toContain('Nery AI')
    expect(privacy?.content).not.toContain('Yue AI')
    expect(read_site_content('/admin', locale)).toBeNull()
  })

  it('grounds privacy policy questions in the published notice rather than a generic description', () => {
    const hit = find_citations({
      message: 'What does the privacy policy say about AI providers?',
      locale: 'en'
    }).find((citation) => citation.href === '/privacy')
    expect(hit?.evidence).toContain('external AI provider')
    expect(hit?.evidence).toContain('Umami')
    expect(hit?.evidence).toContain('Nery AI')
  })

  it('returns project metadata and its published repository as grounded evidence', () => {
    const project = allProjects.find((entry) => entry.locale === 'en' && entry.slug === 'gitflect')
    expect(project).toBeDefined()
    const hit = find_citations({ message: 'Gitflect', locale: 'en' })[0]
    expect(hit?.project?.techstack).toEqual(project?.techstack)
    expect(hit?.repositoryHref).toBe(project?.github)
    expect(read_site_content('/projects/gitflect', 'en')?.citation.project?.repository).toBe(
      project?.github
    )
  })

  it.each([
    '{"type":"page","order":"newest"}',
    '{"type":"post","order":"random"}',
    '{"type":"post","order":"newest","admin":true}'
  ])('rejects invalid chronology arguments: %s', (raw) => {
    const result = executeSiteTool('list_site_content', raw, { locale: 'en' })
    expect(result.result).toHaveProperty('error')
    expect(result.citations).toEqual([])
    expect(result.action).toBeUndefined()
  })
})
