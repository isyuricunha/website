/**
 * Content component map for the MDX-to-HTML build render.
 *
 * Each entry mirrors the React component used by the Next.js implementation
 * with the same YuTheme classes, but returns static HTML. Interactive bits
 * (copy buttons, expandable sections) use native HTML plus a tiny delegated
 * client script instead of a React runtime.
 */

import { childrenToString, escapeHtml, jsx } from '@isyuricunha/mdx-render/runtime'

type Props = Record<string, unknown>

function icon(paths: string, className: string, label?: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${label ? ` aria-label="${escapeHtml(label)}"` : ''} class="${escapeHtml(className)}">${paths
    .split('|')
    .map((path) => `<path d="${path}"/>`)
    .join('')}</svg>`
}

const LINK_ICON =
  'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71|M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'
const INFO_ICON = 'M12 16v-4|M12 8h.01|'
const WARNING_ICON =
  'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3|M12 9v4|M12 17h.01'
const ERROR_ICON =
  'M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3|M12 9v4|M12 17h.01'
const COPY_ICON =
  'M8 8m0-2 0 2 0 10 2 10 8 10 2 8 2|M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'
const EXTERNAL_ICON =
  'M15 3h6v6|M10 14 21 3|M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'

function localizeHref(href: string, locale: string): string {
  if (
    !href ||
    href.startsWith('/') === false ||
    href.startsWith('//') ||
    href.startsWith('/api/') ||
    href.startsWith('/og') ||
    href.startsWith('/fonts/') ||
    href.startsWith('/images/') ||
    href.startsWith('/videos/') ||
    href.startsWith('/rss.xml') ||
    href.startsWith('/sitemap.xml')
  ) {
    return href
  }

  if (locale === 'en') {
    return href
  }

  return `/${locale}${href}`
}

function anchor(props: Props, locale: string): string {
  const { href, children, className, ...rest } = props
  const hrefString = typeof href === 'string' ? href : ''

  if (!hrefString) {
    return childrenToString(children)
  }

  const attrs: Record<string, unknown> = { class: className, ...rest }

  if (/^https?:\/\//.test(hrefString)) {
    attrs.href = hrefString
    attrs.target = '_blank'
    attrs.rel = 'noopener noreferrer'
  } else {
    attrs.href = localizeHref(hrefString, locale)
  }

  const rendered = jsx('a', { ...attrs, children })
  return rendered.html
}

function heading(tag: string) {
  return (props: Props) => {
    const { id, children, className } = props
    const inner = `${childrenToString(children)}${icon(LINK_ICON, 'text-muted-foreground ml-2 inline size-4 opacity-0 transition-opacity group-hover:opacity-100')}`

    return `<${tag} class="scroll-m-32 ${escapeHtml(String(className ?? ''))}" id="${escapeHtml(String(id ?? ''))}"><a href="#${escapeHtml(String(id ?? ''))}" class="group">${inner}</a></${tag}>`
  }
}

function codeBlock(props: Props): string {
  const { 'data-lang': lang, title, children, className, ...rest } = props
  const langString = typeof lang === 'string' ? lang : ''

  const titleBar =
    title !== undefined && title !== null
      ? `<div class="flex min-h-8 flex-row items-center gap-2 border-b border-[var(--border-faint)] bg-[var(--yu-bg-titlebar)] px-4 py-1.5"><div class="text-muted-foreground font-mono text-xs">${escapeHtml(langString)}</div><figcaption class="text-muted-foreground flex-1 truncate font-mono text-xs">${escapeHtml(String(title))}</figcaption><button type="button" data-mdx-copy aria-label="Copy code" class="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent/50">${icon(COPY_ICON, 'size-3.5')}</button></div>`
      : `<button type="button" data-mdx-copy aria-label="Copy code" class="absolute top-2 right-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent/50">${icon(COPY_ICON, 'size-3.5')}</button>`

  void rest

  return `<figure class="not-prose bg-bg-editor group shadow-feature-card relative my-6 overflow-hidden rounded-lg border border-[var(--border-subtle)] text-sm">${titleBar}<div class="overflow-x-auto"><pre class="p-4 font-mono text-[13px] leading-relaxed text-[var(--syntax-fg)] ${escapeHtml(String(className ?? ''))}">${childrenToString(children)}</pre></div></figure>`
}

function callout(props: Props): string {
  const { title, type = 'info', icon: iconProp, className, children } = props
  const calloutType = typeof type === 'string' ? type : 'info'

  const icons: Record<string, { paths: string; className: string }> = {
    info: { paths: INFO_ICON, className: 'text-status-info size-4' },
    warning: { paths: WARNING_ICON, className: 'text-accent-gold size-4' },
    error: { paths: ERROR_ICON, className: 'text-status-danger size-4' }
  }

  const variants: Record<string, string> = {
    info: 'border-[var(--status-info-border)] bg-status-info-soft',
    warning: 'border-[var(--action-primary-border)] bg-action-primary-soft',
    error: 'border-[var(--status-danger-border)] bg-status-danger-soft'
  }

  const variant = variants[calloutType] ?? variants.info
  const iconData = icons[calloutType] ?? icons.info
  const iconHtml =
    typeof iconProp === 'string' ? iconProp : icon(iconData.paths, iconData.className)

  return `<div role="alert" class="text-muted-foreground my-6 flex w-full flex-row items-start gap-2 rounded-lg border p-3 text-sm shadow-none ${variant} ${escapeHtml(String(className ?? ''))}"><div class="mt-0.5 shrink-0">${iconHtml}</div><div class="w-0 flex-1">${title ? `<div class="text-card-foreground mb-2 font-medium">${childrenToString(title)}</div>` : ''}<div>${childrenToString(children)}</div></div></div>`
}

type GridItem = {
  image?: string
  name: string
  description?: string
  url: string
}

function itemGrid(props: Props): string {
  const { items } = props
  const list = Array.isArray(items) ? (items as GridItem[]) : []

  const cells = list
    .map((item) => {
      const image = item.image
        ? `<div class="bg-muted/10 flex h-16 w-16 shrink-0 items-center justify-center rounded-lg p-3 sm:h-20 sm:w-20"><img src="${escapeHtml(item.image)}" width="80" height="80" alt="${escapeHtml(item.name)}" loading="lazy" class="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"/></div>`
        : ''
      const external = `<span aria-hidden="true" class="inline-flex">${icon(EXTERNAL_ICON, 'h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100')}</span>`
      const description = item.description
        ? `<div class="text-muted-foreground line-clamp-2 text-xs sm:text-sm">${escapeHtml(item.description)}</div>`
        : ''

      return `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="group bg-bg-surface shadow-feature-card hover:bg-bg-hover relative flex min-h-[120px] gap-4 rounded-lg border border-[var(--border-subtle)] p-4 no-underline transition-colors sm:min-h-[160px] sm:flex-col sm:gap-3">${image}<div class="flex flex-1 flex-col justify-center gap-2"><div class="line-clamp-2 flex items-center gap-2 text-sm font-medium sm:text-base">${escapeHtml(item.name)}${external}</div>${description}</div></a>`
    })
    .join('')

  return `<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">${cells}</div>`
}

function image(props: Props): string {
  const { src, alt, width, height, className, ...rest } = props

  if (typeof src !== 'string' || src.trim().length === 0) {
    return ''
  }

  const attrs: Record<string, unknown> = {
    src,
    alt: String(alt ?? ''),
    class: `rounded-lg border ${escapeHtml(String(className ?? ''))}`,
    ...rest
  }

  if (typeof width === 'number') {
    attrs.width = String(width)
  }

  if (typeof height === 'number') {
    attrs.height = String(height)
  }

  // Priority images load eagerly; everything else is lazy.
  if (props.priority === true) {
    attrs.loading = 'eager'
    attrs.fetchpriority = 'high'
  } else {
    attrs.loading = 'lazy'
  }

  delete attrs.priority
  delete attrs.lazy

  const imgAttrs = Object.entries(attrs)
    .map(([name, value]) => ` ${name}="${escapeHtml(String(value))}"`)
    .join('')

  return `<figure class="not-prose my-6"><img${imgAttrs}/>${alt ? `<figcaption class="text-muted-foreground mt-4 text-center">${escapeHtml(String(alt))}</figcaption>` : ''}</figure>`
}

type ComparisonItem = { name: string; pros: string[]; cons: string[] }

function comparisonTable(props: Props): string {
  const { items } = props
  const list = Array.isArray(items) ? (items as ComparisonItem[]) : []

  const rows = list
    .map((item) => {
      const pros = (item.pros ?? []).map((pro) => `<li>${escapeHtml(pro)}</li>`).join('')
      const cons = (item.cons ?? []).map((con) => `<li>${escapeHtml(con)}</li>`).join('')

      return `<tr><td class="font-medium">${escapeHtml(item.name)}</td><td><ul class="ml-4 list-disc">${pros}</ul></td><td><ul class="ml-4 list-disc">${cons}</ul></td></tr>`
    })
    .join('')

  return `<div class="not-prose mb-8 overflow-x-auto rounded-lg border border-[var(--border-subtle)]"><table class="w-full text-sm"><thead><tr class="border-b border-[var(--border-subtle)]"><th class="p-3 text-left">Tool</th><th class="p-3 text-left">Pros</th><th class="p-3 text-left">Cons</th></tr></thead><tbody>${rows}</tbody></table></div>`
}

function expandableSection(props: Props): string {
  const { title, icon: iconProp, children } = props
  const iconHtml =
    typeof iconProp === 'string'
      ? `<span class="mr-2 inline-flex">${escapeHtml(iconProp)}</span>`
      : ''

  return `<details class="not-prose group my-4 rounded-lg border border-[var(--border-subtle)] bg-bg-surface"><summary class="cursor-pointer list-none p-4 font-medium">${iconHtml}${escapeHtml(String(title ?? ''))}</summary><div class="px-4 pb-4">${childrenToString(children)}</div></details>`
}

function nowProject(props: Props): string {
  const { repo, name, website } = props

  // Dynamic GitHub data is resolved per request on the now page; the static
  // HTML only carries the slot.
  return `<div data-mdx-now-project="${escapeHtml(String(repo ?? ''))}" data-name="${escapeHtml(String(name ?? ''))}" data-website="${escapeHtml(String(website ?? ''))}"></div>`
}

function video(props: Props): string {
  const { src, children, ...rest } = props

  if (typeof src === 'string') {
    return `<div class="not-prose my-6 overflow-hidden rounded-lg border border-[var(--border-subtle)]"><iframe src="${escapeHtml(src)}" loading="lazy" allowfullscreen class="aspect-video w-full"></iframe></div>`
  }

  return `<video controls loading="lazy" class="my-6 w-full rounded-lg border border-[var(--border-subtle)]">${childrenToString(children)}</video>`
}

function linkCard(props: Props): string {
  const { href, title, description } = props

  return `<a href="${escapeHtml(String(href ?? ''))}" target="_blank" rel="noopener noreferrer" class="group my-4 block rounded-lg border border-[var(--border-subtle)] bg-bg-surface p-4 no-underline transition-colors hover:bg-bg-hover"><div class="flex items-center gap-2 text-sm font-medium">${escapeHtml(String(title ?? ''))}${icon(EXTERNAL_ICON, 'h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100')}</div><div class="text-muted-foreground mt-1 text-xs">${escapeHtml(String(description ?? ''))}</div></a>`
}

function kbd(props: Props): string {
  return `<kbd class="bg-muted inline-flex h-6 min-w-6 items-center justify-center rounded border border-[var(--border-subtle)] px-1.5 font-mono text-xs font-medium">${childrenToString(props.children)}</kbd>`
}

type ContentComponents = Record<string, (props: Props) => string>

export function createContentComponents(locale: string): ContentComponents {
  return {
    h2: heading('h2'),
    h3: heading('h3'),
    h4: heading('h4'),
    h5: heading('h5'),
    h6: heading('h6'),
    a: (props: Props) => anchor(props, locale),
    pre: codeBlock,
    Image: image,
    Callout: callout,
    ItemGrid: itemGrid,
    ComparisonTable: comparisonTable,
    ExpandableSection: expandableSection,
    NowProject: nowProject,
    Video: video,
    LinkCard: linkCard,
    Kbd: kbd
  }
}
