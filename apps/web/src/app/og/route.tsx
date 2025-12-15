import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const ogTheme = {
  background: 'linear-gradient(135deg, hsl(0 0% 2%) 0%, hsl(0 0% 6%) 100%)',
  text: 'hsl(0 0% 92%)',
  accentText: 'linear-gradient(91.52deg, hsl(42 100% 56%) 0.79%, hsl(42 100% 72%) 109.05%)',
  accentBlock: 'linear-gradient(135deg, hsl(42 100% 56%) 0%, hsl(42 100% 72%) 100%)'
} as const

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const locale = searchParams.get('locale') || 'en'

    // Get the appropriate text based on locale
    const getLocaleText = (locale: string) => {
      switch (locale) {
        case 'pt':
          return {
            title: 'Yuri Cunha',
            subtitle: 'Administrador de Banco de Dados (DBA) e Infraestrutura',
            description: 'Construindo sistemas resilientes e garantindo performance perfeita'
          }
        case 'zh':
          return {
            title: 'Yuri Cunha',
            subtitle: '云和基础设施专家',
            description: '构建弹性系统，确保完美性能'
          }
        case 'fr':
          return {
            title: 'Yuri Cunha',
            subtitle: 'Spécialiste Cloud et Infrastructure',
            description: 'Construire des systèmes résilients et assurer des performances parfaites'
          }
        case 'de':
          return {
            title: 'Yuri Cunha',
            subtitle: 'Cloud- und Infrastrukturspezialist',
            description: 'Aufbau widerstandsfähiger Systeme und Gewährleistung perfekter Leistung'
          }
        default: // en
          return {
            title: 'Yuri Cunha',
            subtitle: 'Database Administrator (DBA) and Server Infrastructure Specialist',
            description: 'Building resilient systems and ensuring seamless performance'
          }
      }
    }

    const localeText = getLocaleText(locale)

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
          {localeText.subtitle}
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
              fontSize: 64,
              background: ogTheme.accentText,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              letterSpacing: '-0.03em',
              color: 'transparent',
              marginBottom: 24
            }}
          >
            {localeText.title}
          </div>
          <div
            style={{
              fontSize: 24,
              color: ogTheme.text,
              maxWidth: '800px',
              lineHeight: 1.4
            }}
          >
            {localeText.description}
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
