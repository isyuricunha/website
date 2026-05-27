import { describe, expect, it } from 'vitest'

import {
  parseJsonFromModel,
  postProcessTranslatedMdxBody,
  splitFrontmatter,
  translateFrontmatter
} from './translate-site.mjs'

describe('parseJsonFromModel', () => {
  it('repairs literal control characters inside model JSON strings', () => {
    expect(parseJsonFromModel('[{"path":"hero","value":"linha 1\nlinha 2"}]')).toEqual([
      { path: 'hero', value: 'linha 1\nlinha 2' }
    ])
  })
})

describe('splitFrontmatter', () => {
  it('supports empty MDX frontmatter', () => {
    expect(splitFrontmatter('---\n---\n\n## About\n')).toEqual({
      frontmatter: '',
      body: '\n## About\n',
      hasFrontmatter: true
    })
  })

  it('does not treat markdown dividers as YAML frontmatter', () => {
    const content = `---\n\nthis is markdown, not frontmatter.\n\nthe list is:\n\n---\n\n## Body\n`

    expect(splitFrontmatter(content)).toEqual({
      frontmatter: '',
      body: content,
      hasFrontmatter: false
    })
  })
})

describe('postProcessTranslatedMdxBody', () => {
  it('escapes text emoticons that MDX would parse as JSX', () => {
    expect(postProcessTranslatedMdxBody('texto com “<3”')).toBe('texto com “&lt;3”')
  })

  it('separates adjacent MDX component tags and closes open expandable sections', () => {
    expect(
      postProcessTranslatedMdxBody(
        "<ExpandableSection title='Infra' icon='Shield'><ItemGrid\n  items={[]}\n/>\n<ExpandableSection title='Stacks' icon='Code'>x\n</ExpandableSection>"
      )
    ).toBe(
      "<ExpandableSection title='Infra' icon='Shield'>\n\n<ItemGrid\n  items={[]}\n/>\n</ExpandableSection>\n\n<ExpandableSection title='Stacks' icon='Code'>\n</ExpandableSection>"
    )
  })
})

describe('translateFrontmatter', () => {
  it('translates only allowlisted project text fields and preserves technical metadata', async () => {
    const frontmatter = `name: Rain for Relax
description: A minimalist web app.
homepage: https://www.rain-for-relax.yuricunha.com/
github: https://github.com/isyuricunha/rain-for-relax
techstack:
  - HTML5
  - CSS3
selected: false
status: completed
`

    const translated = await translateFrontmatter({
      frontmatter,
      collection: 'projects',
      options: {
        source: 'en',
        target: 'es',
        sourceLabel: 'English',
        targetLabel: 'Español',
        requestTimeoutMs: 1000,
        maxRetries: 0,
        translateFrontmatterBatch: async ({ batch }: { batch: Array<{ path: string }> }) => {
          expect(batch).toEqual([
            { path: 'name', value: 'Rain for Relax' },
            { path: 'description', value: 'A minimalist web app.' }
          ])

          return batch.map(({ path }) => ({
            path,
            value: path === 'name' ? 'Lluvia para Relajarse' : 'Una aplicación web minimalista.'
          }))
        }
      }
    })

    expect(translated).toContain('name: Lluvia para Relajarse')
    expect(translated).toContain('description: Una aplicación web minimalista.')
    expect(translated).toContain('homepage: https://www.rain-for-relax.yuricunha.com/')
    expect(translated).toContain('github: https://github.com/isyuricunha/rain-for-relax')
    expect(translated).toContain('selected: false')
    expect(translated).toContain('status: completed')
    expect(translated).toContain('- HTML5')
    expect(translated).toContain('- CSS3')
  })
})
