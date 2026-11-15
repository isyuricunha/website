/**
 * Build-time JSX runtime that renders MDX to static HTML.
 *
 * Used by the content pipeline (`content-collections.ts`) through
 * `evaluate()` from @mdx-js/mdx: the compiled MDX body calls `jsx`/`jsxs`
 * with element tags and component functions, and this module turns those
 * calls into HTML. React is intentionally not involved anywhere in the
 * content render path.
 *
 * Runtime values are `HtmlNode` wrappers, never bare HTML strings: raw text
 * children (from markdown prose) are escaped exactly once, while rendered
 * element results pass through unescaped.
 */

export const Fragment = Symbol('mdx-html-fragment')

export type HtmlNode = { readonly html: string; toString(): string }

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr'
])

const BOOLEAN_ATTRS = new Set([
  'allowfullscreen',
  'async',
  'autoplay',
  'controls',
  'defer',
  'disabled',
  'loop',
  'muted',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected'
])

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char] ?? char)
}

function isNode(value: unknown): value is HtmlNode {
  return typeof value === 'object' && value !== null && 'html' in value
}

const node = (html: string): HtmlNode => ({ html, toString: () => html })

function attrsToString(props: Record<string, unknown>): string {
  let result = ''

  for (const [name, value] of Object.entries(props)) {
    if (name === 'children' || name === 'key' || value === undefined || value === null) {
      continue
    }

    if (value === false) {
      continue
    }

    if (value === true && BOOLEAN_ATTRS.has(name)) {
      result += ` ${name}`
      continue
    }

    if (name === 'style' && typeof value === 'object') {
      const inlineStyle = Object.entries(value as Record<string, unknown>)
        .map(([property, propertyValue]) => `${kebab(property)}:${String(propertyValue)}`)
        .join(';')

      if (inlineStyle.length > 0) {
        result += ` style="${escapeHtml(inlineStyle)}"`
      }

      continue
    }

    if (typeof value === 'function') {
      // Event handlers and similar have no static HTML representation.
      continue
    }

    result += ` ${name}="${escapeHtml(String(value))}"`
  }

  return result
}

function kebab(property: string): string {
  return property.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export function childrenToString(children: unknown): string {
  if (children === null || children === undefined || children === false || children === true) {
    return ''
  }

  if (isNode(children)) {
    return children.html
  }

  if (Array.isArray(children)) {
    return children.map((child) => childrenToString(child)).join('')
  }

  if (typeof children === 'string') {
    return escapeHtml(children)
  }

  if (typeof children === 'number') {
    return String(children)
  }

  if (typeof children === 'object') {
    return String(children)
  }

  return escapeHtml(String(children))
}

export function jsx(type: unknown, props: Record<string, unknown>): HtmlNode {
  if (type === Fragment) {
    return node(childrenToString(props.children))
  }

  if (typeof type === 'function') {
    // Component functions own their escaping: they receive raw props and
    // return ready HTML.
    return node(String(type(props)))
  }

  const tag = String(type)

  if (VOID_ELEMENTS.has(tag)) {
    return node(`<${tag}${attrsToString(props)}>`)
  }

  return node(`<${tag}${attrsToString(props)}>${childrenToString(props.children)}</${tag}>`)
}

export const jsxs = jsx

export function jsxDEV(type: unknown, props: Record<string, unknown>): HtmlNode {
  return jsx(type, props)
}
