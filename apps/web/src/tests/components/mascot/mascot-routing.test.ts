import { describe, expect, it } from 'vitest'

import { canExplainSelectionOnPage, getMascotPageKey } from '@/components/mascot/mascot-routing'

describe('mascot routing helpers', () => {
  it.each([
    ['/', 'home'],
    ['/pt', 'home'],
    ['/blog', 'blog'],
    ['/pt/blog/deep-dive', 'blogPost'],
    ['/snippet', 'snippet'],
    ['/pt/snippet/docker-notes', 'snippet'],
    ['/snippets/legacy-note', 'snippet'],
    ['/projects', 'projects'],
    ['/pt/projects/site', 'projectsDetail'],
    ['/contact', 'contact'],
    ['/pt/now', 'now'],
    ['/settings', 'settings'],
    ['/pt/notifications', 'notifications'],
    ['/sitemap', 'sitemap'],
    ['/pt/offline', 'offline'],
    ['/music', 'music'],
    ['/admin/users', 'admin'],
    ['/search?q=next', 'search'],
    ['/not-found', '404'],
    ['/unknown', 'home']
  ])('maps %s to %s', (path, pageKey) => {
    expect(getMascotPageKey(path)).toBe(pageKey)
  })

  it('limits selection explain prompts to readable content pages', () => {
    expect(canExplainSelectionOnPage('blogPost')).toBe(true)
    expect(canExplainSelectionOnPage('snippet')).toBe(true)
    expect(canExplainSelectionOnPage('projects')).toBe(false)
    expect(canExplainSelectionOnPage('home')).toBe(false)
  })
})
