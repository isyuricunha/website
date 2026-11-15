/**
 * Minimal ICU MessageFormat subset used by the message catalogs.
 *
 * The catalogs only use simple `{name}` placeholders and `{name, plural, =0
 * {...} =1 {...} other {...}}` selectors with `#` as the count placeholder.
 * ICU quoting (`''`, `'{'`) is not present in any catalog; apostrophes inside
 * prose are treated literally.
 */

export type MessageVariables = Record<string, string | number>

type PluralBranch = { selector: string; text: string }

type BranchParse = { branches: PluralBranch[]; end: number }

/** Reads `=1 {..} other {..}` branches starting at `start` (after the comma). */
function readBranches(source: string, start: number): BranchParse {
  const branches: PluralBranch[] = []
  let index = start

  while (index < source.length) {
    while (index < source.length && /\s/.test(source[index])) index += 1
    if (index >= source.length || source[index] === '}') {
      // Consume the brace that closes the placeholder itself.
      if (source[index] === '}') {
        index += 1
      }
      break
    }

    let selector = ''
    while (index < source.length && !/[\s{]/.test(source[index])) {
      selector += source[index]
      index += 1
    }

    while (index < source.length && /\s/.test(source[index])) index += 1
    if (source[index] !== '{') break

    let depth = 1
    let text = ''
    index += 1
    while (index < source.length && depth > 0) {
      const char = source[index]

      if (char === '{') depth += 1
      else if (char === '}') {
        depth -= 1
        if (depth === 0) break
      }

      text += char
      index += 1
    }
    index += 1

    branches.push({ selector, text })
  }

  return { branches, end: index }
}

function selectBranch(branches: PluralBranch[], value: number, locale: string): string {
  const exact = branches.find((branch) => branch.selector === `=${value}`)

  if (exact) {
    return exact.text
  }

  const rule = new Intl.PluralRules(locale).select(value)
  const byRule = branches.find((branch) => branch.selector === rule)
  const other = branches.find((branch) => branch.selector === 'other')

  return (byRule ?? other)?.text ?? ''
}

export function formatMessage(
  pattern: string,
  variables: MessageVariables | undefined,
  locale: string
): string {
  if (!variables) {
    return pattern
  }

  let result = ''
  let cursor = 0

  while (cursor < pattern.length) {
    const open = pattern.indexOf('{', cursor)

    if (open === -1) {
      result += pattern.slice(cursor)
      break
    }

    result += pattern.slice(cursor, open)

    const close = pattern.indexOf('}', open)

    if (close === -1) {
      // Unclosed placeholder: keep the raw remainder.
      result += pattern.slice(open)
      break
    }

    const comma = pattern.indexOf(',', open)

    if (comma !== -1 && comma < close) {
      // Read the formatter keyword between the first and second commas,
      // skipping any whitespace around the token.
      let kindEnd = comma + 1
      while (kindEnd < pattern.length && /\s/.test(pattern[kindEnd])) kindEnd += 1
      const kindStart = kindEnd
      while (
        kindEnd < pattern.length &&
        pattern[kindEnd] !== ',' &&
        pattern[kindEnd] !== '{' &&
        !/\s/.test(pattern[kindEnd])
      ) {
        kindEnd += 1
      }

      const kind = pattern.slice(kindStart, kindEnd).trim()

      if (kind === 'plural') {
        const kindComma = pattern.indexOf(',', comma + 1)
        const name = pattern.slice(open + 1, comma).trim()
        const value = variables[name]
        const { branches, end } = readBranches(pattern, kindComma + 1)

        if (value === undefined) {
          // Keep the raw placeholder when the variable is missing.
          result += pattern.slice(open, end)
          cursor = end
          continue
        }

        const numeric = typeof value === 'number' ? value : Number(value)

        result += Number.isNaN(numeric)
          ? pattern.slice(open, end)
          : selectBranch(branches, numeric, locale).replace(/#/g, String(value))

        cursor = end
        continue
      }
    }

    const name = pattern.slice(open + 1, close).trim()
    const value = variables[name]
    result += value === undefined ? pattern.slice(open, close + 1) : String(value)
    cursor = close + 1
  }

  return result
}
