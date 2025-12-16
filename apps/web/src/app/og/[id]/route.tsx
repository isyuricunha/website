import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const ogTheme = {
  background: 'linear-gradient(135deg, hsl(0 0% 2%) 0%, hsl(0 0% 6%) 100%)',
  text: 'hsl(0 0% 92%)',
  accentText: 'linear-gradient(91.52deg, hsl(42 100% 56%) 0.79%, hsl(42 100% 72%) 109.05%)',
  accentBlock: 'linear-gradient(135deg, hsl(42 100% 56%) 0%, hsl(42 100% 72%) 100%)'
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
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 700
          }}
        >
          <div
            style={{
              color: ogTheme.text,
              fontSize: 30
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
                fontSize: title.length > 50 ? 36 : title.length > 40 ? 48 : 64,
                background: ogTheme.accentText,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                letterSpacing: '-0.03em',
                color: 'transparent',
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
                color: ogTheme.text,
                maxWidth: '800px',
                lineHeight: 1.4
              }}
            >
              {summary || 'Read this article on yuricunha.com'}
            </div>
          </div>
          <div
            style={{
              color: ogTheme.text,
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
                fontSize: 30
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
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 700
        }}
      >
        <div
          style={{
            color: ogTheme.text,
            fontSize: 30
          }}
        >
          Blog Post
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
              background: ogTheme.accentText,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              letterSpacing: '-0.03em',
              color: 'transparent',
              marginBottom: 24
            }}
          >
            {id}
          </div>
          <div
            style={{
              fontSize: 24,
              color: ogTheme.text,
              maxWidth: '800px',
              lineHeight: 1.4
            }}
          >
            Read this article on yuricunha.com
          </div>
        </div>
        <div
          style={{
            color: ogTheme.text,
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
              fontSize: 30
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
