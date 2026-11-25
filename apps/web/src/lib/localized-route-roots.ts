import { readdirSync } from 'node:fs'
import path from 'node:path'

// App Router route groups do not add URL segments. Unknown routing
// conventions fail closed (disable the fast path), rather than shadow pages.
export function discoverLocalizedRouteRoots(appDirectory: string, publicDirectory: string) {
  const roots = new Set<string>()

  function scan(directory: string, localized: boolean): boolean {
    const entries = readdirSync(directory, { withFileTypes: true })
    for (const entry of entries) {
      const name = entry.name
      if (entry.isSymbolicLink()) return false
      if (!entry.isDirectory() || name.startsWith('_')) continue
      // The existing notFound() catch-all is the fallback, not a real page.
      if (localized && name === '[...rest]') continue
      if (
        name.startsWith('(') &&
        name.endsWith(')') &&
        !name.startsWith('(..') &&
        !name.startsWith('(.)')
      ) {
        if (!scan(path.join(directory, name), localized)) return false
      } else if (!localized && name === '[locale]') {
        if (!scan(path.join(directory, name), true)) return false
      } else if (name.startsWith('[') || name.startsWith('@') || name.startsWith('(')) {
        return false
      } else {
        roots.add(name.toLowerCase())
      }
    }
    return true
  }

  if (!scan(appDirectory, false)) return null
  for (const entry of readdirSync(publicDirectory)) roots.add(entry.toLowerCase())
  return [...roots].toSorted((a, b) => a.localeCompare(b))
}
