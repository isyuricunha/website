import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { discoverLocalizedRouteRoots } from '@/lib/localized-route-roots'

const fixtures: string[] = []
function fixture() {
  const dir = mkdtempSync(path.join(tmpdir(), 'localized-route-roots-'))
  fixtures.push(dir)
  const app = path.join(dir, 'app')
  const publicDir = path.join(dir, 'public')
  mkdirSync(app)
  mkdirSync(publicDir)
  return { app, publicDir }
}

afterEach(() => {
  for (const dir of fixtures.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('build-time route discovery', () => {
  it('finds grouped route families and assets without treating the error catch-all as a page family', () => {
    const { app, publicDir } = fixture()
    for (const route of [
      '[locale]/(main)/blog/[slug]',
      '[locale]/(main)/(nested)/new-page',
      '[locale]/(admin)/admin',
      '[locale]/[...rest]',
      '[locale]/404',
      'api',
      '_private'
    ]) {
      mkdirSync(path.join(app, route), { recursive: true })
    }
    mkdirSync(path.join(publicDir, 'images'))
    writeFileSync(path.join(publicDir, 'asset.txt'), '')
    expect(discoverLocalizedRouteRoots(app, publicDir)).toEqual([
      '404',
      'admin',
      'api',
      'asset.txt',
      'blog',
      'images',
      'new-page'
    ])
  })

  it.each(['[slug]', '[[...parts]]', '@modal', '(.)intercept'])(
    'disables optimization when routing cannot be classified safely: %s',
    (name) => {
      const { app, publicDir } = fixture()
      mkdirSync(path.join(app, '[locale]', name), { recursive: true })
      expect(discoverLocalizedRouteRoots(app, publicDir)).toBeNull()
    }
  )
})
