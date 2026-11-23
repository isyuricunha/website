import { i18n } from '@isyuricunha/i18n/config'
import { NextRequest, NextResponse } from 'next/server'
import { getLegacyContentOgPath } from '@/lib/content-og'

export const runtime = 'nodejs'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const { searchParams } = request.nextUrl
  const requestedLocale = searchParams.get('locale') ?? ''
  const locale = i18n.locales.includes(requestedLocale) ? requestedLocale : i18n.defaultLocale
  const target = getLegacyContentOgPath(locale, searchParams.get('type'), id)
  return NextResponse.redirect(new URL(target, request.url), {
    status: 307,
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' }
  })
}
