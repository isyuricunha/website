import { describe, expect, it } from 'vitest'

import { build_alternates, build_absolute_language_alternates } from '@/lib/seo'

describe('alternates with partial translations', () => {
  it('never advertises a locale that has no translation', () => {
    // pt-only post: en is not a real variant and must not be advertised.
    const relative = build_alternates({
      slug: '/blog/coisas-que-eu-gostaria',
      locale: 'pt',
      locales: ['pt', 'es', 'ja']
    })
    const absolute = build_absolute_language_alternates({
      slug: '/blog/coisas-que-eu-gostaria',
      locales: ['pt', 'es', 'ja']
    })

    expect(relative.languages['en']).toBeUndefined()
    expect(absolute['en']).toBeUndefined()
  })

  it('keeps x-default pointing at an existing variant', () => {
    const absolute = build_absolute_language_alternates({
      slug: '/blog/coisas-que-eu-gostaria',
      locales: ['pt', 'es']
    })
    expect(absolute['x-default']).toContain('/pt/blog/coisas-que-eu-gostaria')
  })
})
