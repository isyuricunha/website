import { describe, expect, it } from 'vitest'

import { translateFrontmatter } from './translate-site.mjs'

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
