import { ImageResponse } from 'next/og'

const ogTheme = {
  background: '#1a1813',
  secondaryText: '#b8b2a4',
  accentText: '#64d2ff',
  accentBlock: '#d6a84f'
} as const

const getTitleFontSize = (title: string) => {
  if (title.length > 50) return 36
  if (title.length > 40) return 48
  return 64
}

export const renderContentOg = ({
  title,
  date,
  summary,
  summaryFallback
}: {
  title: string
  date: string
  summary: string
  summaryFallback: string
}) => {
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
          {summary || summaryFallback}
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
