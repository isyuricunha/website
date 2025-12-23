import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { describe, expect, it } from 'vitest'

import { clean_cache } from './clean-cache.mjs'

const ensure_dir = async (absolute_path: string) => {
  await fs.mkdir(absolute_path, { recursive: true })
}

const path_exists = async (absolute_path: string) => {
  try {
    await fs.stat(absolute_path)
    return true
  } catch {
    return false
  }
}

describe('clean_cache', () => {
  it('removes cache directories from root and workspaces', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'clean-cache-'))

    const root_turbo = path.join(root, '.turbo')
    const web_next = path.join(root, 'apps', 'web', '.next')
    const utils_dist = path.join(root, 'packages', 'utils', 'dist')

    await ensure_dir(root_turbo)
    await ensure_dir(web_next)
    await ensure_dir(utils_dist)

    expect(await path_exists(root_turbo)).toBe(true)
    expect(await path_exists(web_next)).toBe(true)
    expect(await path_exists(utils_dist)).toBe(true)

    await clean_cache({ root, verbose: false })

    expect(await path_exists(root_turbo)).toBe(false)
    expect(await path_exists(web_next)).toBe(false)
    expect(await path_exists(utils_dist)).toBe(false)

    await fs.rm(root, { recursive: true, force: true })
  })

  it('refuses to delete outside repo root', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'clean-cache-'))

    await expect(clean_cache({ root, verbose: false })).resolves.toBeUndefined()

    await fs.rm(root, { recursive: true, force: true })
  })
})
