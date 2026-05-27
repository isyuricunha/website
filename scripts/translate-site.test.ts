import { describe, expect, it } from 'vitest'

import {
  parseJsonFromModel,
  postProcessTranslatedMdxBody,
  protectMdxJsxBlocks,
  splitFrontmatter,
  translateFrontmatter,
  translateMdxJsxBlocks
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

  it('removes stray text appended to self-closing MDX component endings', () => {
    expect(postProcessTranslatedMdxBody('<ItemGrid\n  items={[]}\n/>x')).toBe(
      '<ItemGrid\n  items={[]}\n/>'
    )
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

describe('protectMdxJsxBlocks', () => {
  it('protects MDX JSX syntax while leaving child text translatable', () => {
    const { text, blocks } = protectMdxJsxBlocks(
      "Intro\n\n<Callout type='warning'>\n  Always backup your vault.\n</Callout>\n\nOutro\n"
    )

    expect(text).toBe(
      'Intro\n\n@@SITE_TRANSLATION_MDX_BLOCK_0@@\n  Always backup your vault.\n@@SITE_TRANSLATION_MDX_BLOCK_1@@\n\nOutro\n'
    )
    expect(blocks).toEqual([
      { token: '@@SITE_TRANSLATION_MDX_BLOCK_0@@', block: "<Callout type='warning'>" },
      { token: '@@SITE_TRANSLATION_MDX_BLOCK_1@@', block: '</Callout>' }
    ])
  })
})

describe('translateMdxJsxBlocks', () => {
  it('translates only allowlisted JSX text values and preserves technical fields', async () => {
    const blocks = [
      {
        token: '@@SITE_TRANSLATION_MDX_BLOCK_0@@',
        block: `<ItemGrid
  items={[
    {
      image: '/images/uses/software/docker.png',
      name: 'Docker',
      description: 'Container Platform',
      url: 'https://www.docker.com/'
    }
  ]}
/>`
      }
    ]

    const translated = await translateMdxJsxBlocks({
      blocks,
      options: {
        batchChars: 4000,
        source: 'en',
        target: 'fr',
        sourceLabel: 'English',
        targetLabel: 'Français',
        requestTimeoutMs: 1000,
        maxRetries: 0,
        translateMdxJsxBatch: async ({
          batch
        }: {
          batch: Array<{ path: string; value: string }>
        }) => {
          expect(batch).toEqual([{ path: '0.0', value: 'Container Platform' }])

          return [{ path: '0.0', value: 'Plateforme de conteneurs' }]
        }
      }
    })

    expect(translated[0]?.block).toContain("description: 'Plateforme de conteneurs'")
    expect(translated[0]?.block).toContain("image: '/images/uses/software/docker.png'")
    expect(translated[0]?.block).toContain("name: 'Docker'")
    expect(translated[0]?.block).toContain("url: 'https://www.docker.com/'")
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
          expect(batch).toEqual([{ path: 'description', value: 'A minimalist web app.' }])

          return batch.map(({ path }) => ({
            path,
            value: path === 'description' ? 'Una aplicación web minimalista.' : ''
          }))
        }
      }
    })

    expect(translated).toContain('name: Rain for Relax')
    expect(translated).toContain('description: Una aplicación web minimalista.')
    expect(translated).toContain('homepage: https://www.rain-for-relax.yuricunha.com/')
    expect(translated).toContain('github: https://github.com/isyuricunha/rain-for-relax')
    expect(translated).toContain('selected: false')
    expect(translated).toContain('status: completed')
    expect(translated).toContain('- HTML5')
    expect(translated).toContain('- CSS3')
  })
})
