import { getTranslations } from '@isyuricunha/i18n/server'
import { getContentOgCard, getContentOgParams } from '@/lib/content-og'
import { renderContentOg } from '@/lib/og-render'

export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const dynamicParams = false
export const generateStaticParams = () => getContentOgParams()

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ locale: string; kind: string; key: string }> }
) => {
  const { locale, kind, key } = await params
  const card = getContentOgCard(locale, kind, key)
  if (!card) return new Response('Not found', { status: 404 })
  const t = await getTranslations({ locale, namespace: 'og' })
  return renderContentOg({ ...card, summaryFallback: t('summary-fallback') })
}
