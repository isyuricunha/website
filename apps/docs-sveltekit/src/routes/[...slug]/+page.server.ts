import fs from 'node:fs/promises'
import path from 'node:path'
import { allDocs } from 'content-collections'
import { error } from '@sveltejs/kit'
import { codeToHast } from 'shiki/bundle/web'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { YU_DARK_SHIKI_THEME } from '@isyuricunha/mdx-plugins'
import { CodeBlock } from '@isyuricunha/yutheme'

import { SIDEBAR_LINKS } from '#lib/links.ts'
import { GITHUB_REPO_URL } from '#lib/site.ts'
import { getDemo } from '../../../mdx/demos-registry.ts'
import type { EntryGenerator, PageServerLoad } from './$types'

type SidebarLink = { href: string; text: string }

const DEMOS_DIR = path.resolve(process.cwd(), 'src/demos')

type PreviewSlot = { wrapper: string }

const SLOTS = new Map<string, Promise<PreviewSlot>>()

// Build-time React SSR of one demo plus its Shiki-highlighted source. React
// is isolated to this step (documented migration exception: the docs
// demonstrate the published React yutheme package); the page output is plain
// HTML.
function resolvePreviewSlot(name: string): Promise<PreviewSlot> {
  const existing = SLOTS.get(name)

  if (existing) {
    return existing
  }

  const pending = (async () => {
    const [demo, code] = await Promise.all([
      getDemo(name),
      fs.readFile(path.join(DEMOS_DIR, `${name}.tsx`), 'utf8')
    ])

    const out = await codeToHast(code, {
      lang: 'tsx',
      themes: {
        light: 'github-light',
        dark: YU_DARK_SHIKI_THEME
      },
      defaultColor: false
    })

    const codeHtml = renderToStaticMarkup(
      toJsxRuntime(out, {
        Fragment,
        jsx,
        jsxs,
        components: {
          pre: (preProps) => createElement(CodeBlock, preProps)
        }
      })
    )

    const previewHtml = demo ? renderToStaticMarkup(demo) : ''
    const windowChrome = `<div class="app-window not-prose"><div class="app-window-chrome"><span class="window-dot"></span><span class="window-dot"></span><span class="window-dot"></span><span class="label-mono ml-2 normal-case">preview</span></div><div class="flex min-h-[350px] items-center justify-center px-10 py-12">${previewHtml}</div></div>`

    // Tabbed preview/code pair; the tab switching is a tiny delegated script
    // in the layout, no hydration needed for the static content.
    return {
      wrapper: `<div class="my-8" data-doc-preview><div class="bg-bg-surface mb-3 inline-flex rounded-md border border-[var(--border-default)] p-0.5"><button type="button" data-doc-tab="preview" data-tab-active="true" class="inline-flex min-h-8 items-center rounded px-3 text-sm font-medium">Preview</button><button type="button" data-doc-tab="code" class="text-muted-foreground inline-flex min-h-8 items-center rounded px-3 text-sm font-medium">Code</button></div><div data-doc-panel="preview">${windowChrome}</div><div data-doc-panel="code" hidden class="[&_figure]:m-0 [&_pre]:max-h-[350px] [&_pre]:overflow-auto">${codeHtml}</div></div>`
    }
  })()

  SLOTS.set(name, pending)

  return pending
}

// Every docs page is static content rendered at build time.
export const entries: EntryGenerator = () => {
  // SvelteKit 3 rest-param entries are plain strings (segments separated by /).
  return allDocs.map((doc) => ({ slug: doc.slug }))
}

export const prerender = true

export const load: PageServerLoad = async ({ params }) => {
  // The rest parameter is a single string when one segment was captured.
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : (params.slug ?? '')
  const doc = allDocs.find((entry) => entry.slug === slug)

  if (!doc) {
    error(404, 'Doc not found')
  }

  // Resolve preview slots emitted by the build-time MDX render.
  const slotMatches = [...doc.html.matchAll(/<div data-mdx-preview="([^"]+)"><\/div>/g)]
  const resolvedSlots = await Promise.all(
    slotMatches.map(
      async ([full, name]) => [full, (await resolvePreviewSlot(name)).wrapper] as const
    )
  )

  let html = doc.html
  for (const [slot, replacement] of resolvedSlots) {
    html = html.replaceAll(slot, replacement)
  }

  const links = SIDEBAR_LINKS.flatMap((section) => section.links)
  const currentIndex = links.findIndex((link) => link.href === `/${doc.slug}`)
  const prev = currentIndex > 0 ? links[currentIndex - 1] : null
  const next = currentIndex >= 0 && currentIndex < links.length - 1 ? links[currentIndex + 1] : null

  const normalizedFilePath = doc._meta.filePath.replaceAll('\\', '/')

  return {
    head: { title: `${doc.title} — Yuri Cunha Docs`, description: doc.description },
    doc: {
      title: doc.title,
      html
    },
    editUrl: `${GITHUB_REPO_URL}/blob/main/apps/docs/src/content/${normalizedFilePath}`,
    prev: prev ? { href: prev.href, text: prev.text } : null,
    next: next ? { href: next.href, text: next.text } : null
  }
}
