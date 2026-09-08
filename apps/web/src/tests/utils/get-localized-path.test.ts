import { describe, expect, it } from 'vitest'

import { getLocalizedPath } from '@/utils/get-localized-path'

describe('getLocalizedPath', () => {
  it('does not duplicate a locale already present in a path', () => {
    expect(getLocalizedPath({ slug: '/pt/rss.xml', locale: 'pt' })).toBe('/pt/rss.xml')
  })

  it('still prefixes an unlocalized path for non-default locales', () => {
    expect(getLocalizedPath({ slug: '/rss.xml', locale: 'pt' })).toBe('/pt/rss.xml')
  })
})
