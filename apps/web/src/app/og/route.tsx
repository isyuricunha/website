import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

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
                        subtitle: 'Especialista em Cloud e Infraestrutura',
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
                        subtitle: 'Cloud & Infrastructure Specialist',
                        description: 'Building resilient systems and ensuring seamless performance'
                    }
            }
        }

        const localeText = getLocaleText(locale)

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
                                background: 'linear-gradient(91.52deg, #FF4D4D 0.79%, #FFCCCC 109.05%)',
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
                                color: '#e2e8f0',
                                maxWidth: '800px',
                                lineHeight: 1.4
                            }}
                        >
                            {localeText.description}
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
    } catch (error) {
        return new Response('Failed to generate image', { status: 500 })
    }
}
