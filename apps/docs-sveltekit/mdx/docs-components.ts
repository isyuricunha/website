/**
 * Docs MDX component map: build-time string HTML mirroring the Next.js docs
 * component surface. Component previews emit data slots that the docs route
 * resolves at build time (React SSR runs there, where the Vite resolver can
 * handle the yutheme/next peer imports that pure Node ESM cannot).
 */

import { escapeHtml, childrenToString, jsx } from '@isyuricunha/mdx-render/runtime'

type Props = Record<string, unknown>

const LINK_ICON =
  'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71|M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'
const INFO_ICON = 'M12 16v-4|M12 8h.01|'
const WARNING_ICON =
  'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3|M12 9v4|M12 17h.01'
const ERROR_ICON =
  'M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3|M12 9v4|M12 17h.01'
const COPY_ICON =
  'M8 8m0-2 0 2 0 10 2 10 8 10 2 8 2|M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'

function icon(paths: string, className: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="${escapeHtml(className)}">${paths
    .split('|')
    .map((path) => (path ? `<path d="${path}"/>` : ''))
    .join('')}</svg>`
}

function heading(tag: string) {
  return (props: Props) => {
    const { id, children, className } = props
    const inner = `${childrenToString(children)}${icon(LINK_ICON, 'text-muted-foreground ml-2 inline size-4 opacity-0 transition-opacity group-hover:opacity-100')}`

    return `<${tag} class="scroll-m-32 ${escapeHtml(String(className ?? ''))}" id="${escapeHtml(String(id ?? ''))}"><a href="#${escapeHtml(String(id ?? ''))}" class="group">${inner}</a></${tag}>`
  }
}

function anchor(props: Props): string {
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
    attrs.href = hrefString
  }

  return jsx('a', { ...attrs, children }).html
}

function codeBlock(props: Props): string {
  const { 'data-lang': lang, title, children, className } = props
  const langString = typeof lang === 'string' ? lang : ''

  const titleBar =
    title !== undefined && title !== null
      ? `<div class="flex min-h-8 flex-row items-center gap-2 border-b border-[var(--border-faint)] bg-[var(--yu-bg-titlebar)] px-4 py-1.5"><div class="text-muted-foreground font-mono text-xs">${escapeHtml(langString)}</div><figcaption class="text-muted-foreground flex-1 truncate font-mono text-xs">${escapeHtml(String(title))}</figcaption><button type="button" data-mdx-copy aria-label="Copy code" class="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent/50">${icon(COPY_ICON, 'size-3.5')}</button></div>`
      : `<button type="button" data-mdx-copy aria-label="Copy code" class="absolute top-2 right-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent/50">${icon(COPY_ICON, 'size-3.5')}</button>`

  return `<figure class="not-prose bg-bg-editor group shadow-feature-card relative my-6 overflow-hidden rounded-lg border border-[var(--border-subtle)] text-sm">${titleBar}<div class="overflow-x-auto"><pre class="p-4 font-mono text-[13px] leading-relaxed text-[var(--syntax-fg)] ${escapeHtml(String(className ?? ''))}">${childrenToString(children)}</pre></div></figure>`
}

function callout(props: Props): string {
  const { title, type = 'info', className, children } = props
  const calloutType = typeof type === 'string' ? type : 'info'

  const icons: Record<string, string> = {
    info: INFO_ICON,
    warning: WARNING_ICON,
    error: ERROR_ICON
  }

  const iconClasses: Record<string, string> = {
    info: 'text-status-info size-4',
    warning: 'text-accent-gold size-4',
    error: 'text-status-danger size-4'
  }

  const variants: Record<string, string> = {
    info: 'border-[var(--status-info-border)] bg-status-info-soft',
    warning: 'border-[var(--action-primary-border)] bg-action-primary-soft',
    error: 'border-[var(--status-danger-border)] bg-status-danger-soft'
  }

  const variant = variants[calloutType] ?? variants.info

  return `<div role="alert" class="text-muted-foreground my-6 flex w-full flex-row items-start gap-2 rounded-lg border p-3 text-sm shadow-none ${variant} ${escapeHtml(String(className ?? ''))}"><div class="mt-0.5 shrink-0">${icon(icons[calloutType] ?? icons.info, iconClasses[calloutType] ?? iconClasses.info)}</div><div class="w-0 flex-1">${title ? `<div class="text-card-foreground mb-2 font-medium">${childrenToString(title)}</div>` : ''}<div>${childrenToString(children)}</div></div></div>`
}

type TreeChild = {
  id?: string
  name?: string
  children?: TreeChild[]
}

/** Static fallback tree render for inline TreeView docs usage. */
function treeHtml(node: TreeChild | undefined): string {
  if (!node) {
    return ''
  }

  const children = node.children?.map((child) => treeHtml(child)).join('') ?? ''

  return `<li class="my-0"><div class="flex items-center gap-1.5 py-0.5">${escapeHtml(String(node.name ?? node.id ?? ''))}</div>${children ? `<ul class="ml-4 my-0 list-none">${children}</ul>` : ''}</li>`
}

function treeView(props: Props): string {
  const { collection } = props
  const rootNode = (collection as { rootNode?: TreeChild } | undefined)?.rootNode

  return `<div class="not-prose my-4 rounded-lg border border-[var(--border-subtle)] p-3 text-sm"><ul class="list-none">${treeHtml(rootNode)}</ul></div>`
}

function embedPreview(props: Props): string {
  const { name } = props

  return `<div class="app-window aspect-[4/2.5] w-full"><iframe src="/embed?component=${escapeHtml(String(name ?? ''))}" title="${escapeHtml(String(name ?? '').split('/')[0])} demo" class="size-full" sandbox="allow-scripts allow-same-origin" loading="lazy" referrerPolicy="no-referrer"></iframe></div>`
}

export function createDocsComponents(): Record<string, (props: Props) => string> {
  return {
    h2: heading('h2'),
    h3: heading('h3'),
    h4: heading('h4'),
    h5: heading('h5'),
    h6: heading('h6'),
    a: anchor,
    pre: codeBlock,
    Callout: callout,
    TreeView: treeView,
    EmbedComponentPreview: embedPreview,
    // Resolved by the docs route (React SSR of the demo + Shiki source).
    ComponentPreview: (props: Props) =>
      `<div data-mdx-preview="${escapeHtml(String(props.name ?? ''))}"></div>`
  }
}
