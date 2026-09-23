import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations } from '@isyuricunha/i18n/server'

export const runtime = 'nodejs'

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

type OGRouteProps = {
  params: Promise<{
    id: string
  }>
}

export const GET = async (req: NextRequest, props: OGRouteProps) => {
  try {
    const { id } = await props.params
    const { searchParams } = new URL(req.url)
    const locales = i18n.locales as readonly string[]
    const requestedLocale = searchParams.get('locale') ?? ''
    const locale = locales.includes(requestedLocale) ? requestedLocale : i18n.defaultLocale
    const t = await getTranslations({ locale, namespace: 'og' })

    // Check if this is a content item request (blog/snippet)
    const type = searchParams.get('type')
    const title = clamp(searchParams.get('title'), TITLE_MAX)
    const date = clamp(searchParams.get('date'), DATE_MAX)
    const summary = clamp(searchParams.get('summary'), SUMMARY_MAX)

    if (title && date && (type === 'post' || type === 'snippet')) {
      // Generate content specific OG image
      return new ImageResponse(
        <div
          style={{
            background: ogTheme.background,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 56px',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Geist, system-ui, sans-serif',
            fontWeight: 400
          }}
        >
          <div
            style={{
              color: ogTheme.secondaryText,
              fontSize: 30,
              fontWeight: 500
            }}
          >
            {date}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                fontSize: getTitleFontSize(title),
                color: ogTheme.accentText,
                fontWeight: 500,
                letterSpacing: '-0.03em',
                marginBottom: 24,
                maxWidth: '1000px',
                lineHeight: 1.2
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 24,
                color: ogTheme.secondaryText,
                maxWidth: '800px',
                lineHeight: 1.4
              }}
            >
              {summary || t('summary-fallback')}
            </div>
          </div>
          <div
            style={{
              color: ogTheme.secondaryText,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <div
              style={{
                width: '33px',
                height: '48px',
                background: ogTheme.accentBlock,
                borderRadius: '8px'
              }}
            />
            <div
              style={{
                fontSize: 30,
                fontWeight: 500
              }}
            >
              yuricunha.com
            </div>
          </div>
        </div>,
        {
          width: 1200,
          height: 630
        }
      )
    }

    // Fallback for other cases
    return new ImageResponse(
      <div
        style={{
          background: ogTheme.background,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '48px 56px',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Geist, system-ui, sans-serif',
          fontWeight: 400
        }}
      >
        <div
          style={{
            color: ogTheme.secondaryText,
            fontSize: 30,
            fontWeight: 500
          }}
        >
          {t('blog-post')}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: 48,
              color: ogTheme.accentText,
              fontWeight: 500,
              letterSpacing: '-0.03em',
              marginBottom: 24
            }}
          >
            {id}
          </div>
          <div
            style={{
              fontSize: 24,
              color: ogTheme.secondaryText,
              maxWidth: '800px',
              lineHeight: 1.4
            }}
          >
            {t('read-article')}
          </div>
        </div>
        <div
          style={{
            color: ogTheme.secondaryText,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <div
            style={{
              width: '33px',
              height: '48px',
              background: ogTheme.accentBlock,
              borderRadius: '8px'
            }}
          />
          <div
            style={{
              fontSize: 30,
              fontWeight: 500
            }}
          >
            yuricunha.com
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630
      }
    )
  } catch {
    return new Response('Failed to generate image', { status: 500 })
  }
}
