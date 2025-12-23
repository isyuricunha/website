import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const cache_entries = [
  '.turbo',
  'coverage',
  '.next',
  '.content-collections',
  'dist',
  'build',
  '.cache',
  '.eslintcache',
  '.tsbuildinfo',
  'test-results',
  'playwright-report',
  '.vercel'
]

const workspace_roots = ['apps', 'packages']

const parse_args = (argv) => {
  const args = {
    root: process.cwd(),
    verbose: false
  }

  let i = 2
  while (i < argv.length) {
    const arg = argv[i]

    if (arg === '--root') {
      const value = argv[i + 1]
      if (!value) {
        throw new Error('Missing value for --root')
      }

      args.root = value
      i += 2
      continue
    }

    if (arg === '--verbose' || arg === '-v') {
      args.verbose = true
      i += 1
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return args
}

const is_within = (parent, child) => {
  const rel = path.relative(parent, child)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

const remove_entry = async ({ absolute_path, repo_root, verbose }) => {
  if (!is_within(repo_root, absolute_path)) {
    throw new Error(`Refusing to delete path outside repo root: ${absolute_path}`)
  }

  try {
    await fs.rm(absolute_path, { recursive: true, force: true })
    if (verbose) {
      console.log(`removed: ${path.relative(repo_root, absolute_path) || '.'}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to remove ${absolute_path}: ${message}`)
  }
}

const list_workspaces = async (repo_root) => {
  const workspaces = []

  for (const workspace_root of workspace_roots) {
    const absolute_workspace_root = path.join(repo_root, workspace_root)

    let entries
    try {
      entries = await fs.readdir(absolute_workspace_root, { withFileTypes: true })
    } catch {
      continue
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      workspaces.push(path.join(absolute_workspace_root, entry.name))
    }
  }

  return workspaces
}

export const clean_cache = async ({ root, verbose }) => {
  const repo_root = path.resolve(root)

  const delete_targets = []

  for (const cache_entry of cache_entries) {
    delete_targets.push(path.join(repo_root, cache_entry))
  }

  const workspaces = await list_workspaces(repo_root)
  for (const workspace of workspaces) {
    for (const cache_entry of cache_entries) {
      delete_targets.push(path.join(workspace, cache_entry))
    }
  }

  const unique_targets = Array.from(new Set(delete_targets))

  for (const target of unique_targets) {
    await remove_entry({ absolute_path: target, repo_root, verbose })
  }
}

export const main = async () => {
  const { root, verbose } = parse_args(process.argv)
  await clean_cache({ root, verbose })
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    console.error(message)
    process.exitCode = 1
  }
}
