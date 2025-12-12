import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

type OGRouteProps = {
  params: Promise<{
    id: string
  }>
}

export const GET = async (req: NextRequest, props: OGRouteProps) => {
  try {
    const { id } = await props.params
    const { searchParams } = new URL(req.url)

    // Check if this is a blog post request
    const type = searchParams.get('type')
    const title = searchParams.get('title')
    const date = searchParams.get('date')
    const summary = searchParams.get('summary')

    if (type === 'post' && title && date) {
      // Generate blog post specific OG image
      return new ImageResponse(
        (
          <div
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
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
                color: '#e2e8f0',
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
                  background: 'linear-gradient(91.52deg, #FF4D4D 0.79%, #FFCCCC 109.05%)',
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
                  color: '#e2e8f0',
                  maxWidth: '800px',
                  lineHeight: 1.4
                }}
              >
                {summary || 'Read this article on yuricunha.com'}
              </div>
            </div>
            <div
              style={{
                color: '#e2e8f0',
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
                  background: 'linear-gradient(135deg, #FF4D4D 0%, #FFCCCC 100%)',
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
          </div>
        ),
        {
          width: 1200,
          height: 630
        }
      )
    }

    // Fallback for other cases
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
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
              color: '#e2e8f0',
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
                background: 'linear-gradient(91.52deg, #FF4D4D 0.79%, #FFCCCC 109.05%)',
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
                color: '#e2e8f0',
                maxWidth: '800px',
                lineHeight: 1.4
              }}
            >
              Read this article on yuricunha.com
            </div>
          </div>
          <div
            style={{
              color: '#e2e8f0',
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
                background: 'linear-gradient(135deg, #FF4D4D 0%, #FFCCCC 100%)',
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
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    )
  } catch {
    return new Response('Failed to generate image', { status: 500 })
  }
}
