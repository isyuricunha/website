const publicRoots = new Set([
  'about',
  'blog',
  'contact',
  'guestbook',
  'music',
  'now',
  'privacy',
  'projects',
  'recap',
  'sitemap',
  'snippet',
  'snippets',
  'uses'
])
const locales = new Set(['en', 'pt', 'es', 'fr', 'de', 'ja', 'zh-CN'])
const nestedRoots = new Set(['blog', 'projects', 'snippet', 'snippets'])

export const is_safe_internal_path = (path: string): boolean => {
  if (!path.startsWith('/') || path.startsWith('//') || /[\\\s\p{Cc}]/u.test(path)) return false
  try {
    const url = new URL(path, 'https://local.invalid')
    if (url.origin !== 'https://local.invalid') return false
    const parts = url.pathname
      .split('/')
      .filter(Boolean)
      .map((part) => decodeURIComponent(part))
    if (locales.has(parts[0] ?? '')) parts.shift()
    if (parts.length === 0) return true
    if (!publicRoots.has(parts[0] ?? '')) return false
    return (
      parts.length === 1 ||
      (parts.length === 2 &&
        nestedRoots.has(parts[0] ?? '') &&
        /^[\p{L}\p{N}_.-]+$/u.test(parts[1] ?? '') &&
        !['.', '..'].includes(parts[1] ?? ''))
    )
  } catch {
    return false
  }
}
