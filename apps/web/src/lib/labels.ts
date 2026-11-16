import type { Translator } from '#lib/i18n/translator.ts'

/**
 * Build a flat label map for a page from the current catalog. Keys are
 * relative to the namespace (e.g. 'coding.total' under 'recap').
 */
export function buildLabels(
  t: Translator,
  namespace: string,
  keys: readonly string[]
): Record<string, string> {
  const labels: Record<string, string> = {}

  for (const key of keys) {
    labels[key] = t(`${namespace}.${key}`)
  }

  return labels
}
