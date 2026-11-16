import { read } from '$app/server'
import geistFontUrl from '#lib/fonts/Geist-Regular.ttf?url'
import { Resvg } from '@resvg/resvg-js'
import { html as toReactElement } from 'satori-html'
import satori from 'satori'
import type { RequestHandler } from './$types'
import { i18n } from '@isyuricunha/i18n/config'
import { getServerTranslator } from '#lib/i18n/server.ts'

export const prerender = false

const ogTheme = {
  background: '#1a1813',
  secondaryText: '#b8b2a4',
  accentText: '#64d2ff',
  accentBlock: '#d6a84f'
} as const

// User-controlled query values are capped so crafted URLs cannot force
// arbitrarily large text into the image renderer (CPU cost per request).
const TITLE_MAX = 80
const SUMMARY_MAX = 300
const DATE_MAX = 20

const clamp = (value: string | null, max: number): string => {
  if (!value) return ''
  return value.trim().slice(0, max)
}

const getTitleFontSize = (title: string) => {
  if (title.length > 50) return 36
  if (title.length > 40) return 48
  return 64
}

// Values go into a markup string parsed by satori-html, so escape them.
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const WIDTH = 1200
const HEIGHT = 630

let fontDataReady: Promise<ArrayBuffer> | undefined

async function loadFonts() {
  fontDataReady ??= read(geistFontUrl).arrayBuffer()
  return [
    {
      name: 'Geist',
      data: await fontDataReady,
      weight: 400 as const,
      style: 'normal' as const
    }
  ]
}

function shell(inner: string): string {
  return `<div style="background:${ogTheme.background};box-sizing:border-box;width:100%;height:100%;display:flex;flex-direction:column;padding:48px 56px;justify-content:space-between;align-items:center;font-family:Geist,system-ui,sans-serif;font-weight:400;">${inner}</div>`
}

function footerRow(): string {
  return `<div style="color:${ogTheme.secondaryText};box-sizing:border-box;display:flex;justify-content:space-between;align-items:center;width:100%;"><div style="width:33px;height:48px;background:${ogTheme.accentBlock};border-radius:8px;"></div><div style="font-size:30px;font-weight:500;">yuricunha.com</div></div>`
}

async function renderPng(markup: string): Promise<Response> {
  const fonts = await loadFonts()
  // satori-html returns a VNode; satori's typings expect its own element shape.
  const element = toReactElement(markup) as unknown as Parameters<typeof satori>[0]
  const svg = await satori(element, {
    fonts,
    width: WIDTH,
    height: HEIGHT
  })
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH }
  })
  const image = resvg.render()
  return new Response(new Uint8Array(image.asPng()), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, immutable, no-transform, max-age=31536000'
    }
  })
}

export const GET: RequestHandler = async ({ params, url }) => {
  try {
    const { id } = params
    const searchParams = url.searchParams
    const locales = i18n.locales as readonly string[]
    const requestedLocale = searchParams.get('locale') ?? ''
    const locale = locales.includes(requestedLocale) ? requestedLocale : i18n.defaultLocale
    const t = await getServerTranslator(locale)

    const type = searchParams.get('type')
    const title = clamp(searchParams.get('title'), TITLE_MAX)
    const date = clamp(searchParams.get('date'), DATE_MAX)
    const summary = clamp(searchParams.get('summary'), SUMMARY_MAX)

    if (title && date && (type === 'post' || type === 'snippet')) {
      const markup = shell(
        `<div style="color:${ogTheme.secondaryText};font-size:30px;font-weight:500;">${escapeHtml(date)}</div>` +
          `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;">` +
          `<div style="font-size:${getTitleFontSize(title)}px;color:${ogTheme.accentText};font-weight:500;letter-spacing:-0.03em;margin-bottom:24px;max-width:1000px;line-height:1.2;">${escapeHtml(title)}</div>` +
          `<div style="font-size:24px;color:${ogTheme.secondaryText};max-width:800px;line-height:1.4;">${escapeHtml(summary || t('og.summary-fallback'))}</div>` +
          `</div>` +
          footerRow()
      )
      return await renderPng(markup)
    }

    // Fallback for other cases
    const markup = shell(
      `<div style="color:${ogTheme.secondaryText};font-size:30px;font-weight:500;">${t('og.author-name')}</div>` +
        `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;">` +
        `<div style="font-size:48px;color:${ogTheme.accentText};font-weight:500;letter-spacing:-0.03em;margin-bottom:24px;">${escapeHtml(id)}</div>` +
        `<div style="font-size:24px;color:${ogTheme.secondaryText};max-width:800px;line-height:1.4;">${t('og.read-article')}</div>` +
        `</div>` +
        footerRow()
    )
    return await renderPng(markup)
  } catch (error) {
    console.error('OG image generation failed', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
