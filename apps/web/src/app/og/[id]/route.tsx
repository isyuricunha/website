import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getTranslations } from '@isyuricunha/i18n/server'

export const runtime = 'nodejs'

const ogTheme = {
  background: '#14120b',
  secondaryText: '#9a9080',
  accentText: '#e07848',
  accentBlock: '#c9572a'
} as const

type OGRouteProps = {
  params: Promise<{
    id: string
  }>
}

export const GET = async (req: NextRequest, props: OGRouteProps) => {
  try {
    const { id } = await props.params
    const { searchParams } = new URL(req.url)
    const locale = searchParams.get('locale') === 'pt' ? 'pt' : 'en'
    const t = await getTranslations({ locale, namespace: 'og' })

    // Check if this is a content item request (blog/snippet)
    const type = searchParams.get('type')
    const title = searchParams.get('title')
    const date = searchParams.get('date')
    const summary = searchParams.get('summary')

    if ((type === 'post' || type === 'snippet') && title && date) {
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
                fontSize: title.length > 50 ? 36 : (title.length > 40 ? 48 : 64),
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
