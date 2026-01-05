import type { Metadata, Viewport } from 'next'

import '@/styles/globals.css'

import { env, flags } from '@isyuricunha/env'
import { NextIntlClientProvider } from '@isyuricunha/i18n/client'
import { i18n } from '@isyuricunha/i18n/config'
import { getMessages, getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import { cn } from '@isyuricunha/utils'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import Script from 'next/script'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Monitoring } from 'react-scan/monitoring/next'

import Analytics from '@/components/analytics'
import Hello from '@/components/hello'
import VirtualMascot from '@/components/mascot/virtual-mascot'
import OfflineIndicator from '@/components/offline-indicator'
import SignInDialog from '@/components/sign-in-dialog'
import ErrorBoundary from '@/components/ui/error-boundary'
import { SITE_KEYWORDS, SITE_NAME, SITE_URL } from '@/lib/constants'
import { generateWebsiteJsonLd } from '@/lib/seo'

import Providers from '../providers'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{
    locale: string
  }>
}

export const generateStaticParams = (): Array<{ locale: string }> => {
  return i18n.locales.map((locale) => ({ locale }))
}

export const generateMetadata = async (props: LayoutProps): Promise<Metadata> => {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('site-title'),
      template: `%s | ${t('site-title')}`
    },
    description: t('site-description'),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    manifest: '/favicon/site.webmanifest',
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: t('site-description'),
      site: '@isyuricunha',
      siteId: '1152256803746377730',
      creator: '@isyuricunha',
      creatorId: '1152256803746377730',
      images: [
        {
          url: `${SITE_URL}/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: t('site-description')
        }
      ]
    },
    keywords: SITE_KEYWORDS,
    creator: 'isyuricunha',
    openGraph: {
      url: SITE_URL,
      type: 'website',
      title: t('site-title'),
      siteName: t('site-title'),
      description: t('site-description'),
      locale,
      images: [
        {
          url: `${SITE_URL}/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: t('site-description'),
          type: 'image/png'
        }
      ]
    },
    icons: {
      icon: '/favicon/favicon.svg',
      shortcut: '/favicon/favicon.svg',
      apple: [
        {
          url: '/favicon/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png'
        }
      ],
      other: [
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          url: '/favicon/favicon-16x16.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          url: '/favicon/favicon-32x32.png'
        }
      ]
    }
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

const Layout = async (props: LayoutProps) => {
  const { children } = props
  const { locale } = await props.params
  setRequestLocale(locale)

  const messages = await getMessages()
  const website_json_ld = generateWebsiteJsonLd()
  const react_scan_api_key = env.REACT_SCAN_MONITOR_API_KEY

  return (
    <html
      lang={locale}
      className={cn(GeistSans.variable, GeistMono.variable)}
      data-scroll-behavior='smooth'
      suppressHydrationWarning
    >
      <head>
        <link rel='manifest' href='/favicon/site.webmanifest' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Yuri Cunha' />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(website_json_ld) }}
        />
        {env.NODE_ENV === 'development' && react_scan_api_key ? (
          <Script
            id='react-scan-auto'
            src='https://unpkg.com/react-scan/dist/auto.global.js'
            strategy='beforeInteractive'
          />
        ) : null}
        <Script id='sw-register' strategy='afterInteractive'>
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    void registration
                  })
                  .catch(function(registrationError) {
                    void registrationError
                  });
              });
            }
          `}
        </Script>
      </head>
      <body className='relative flex min-h-screen flex-col'>
        {env.NODE_ENV === 'development' && react_scan_api_key ? (
          <Monitoring
            apiKey={react_scan_api_key}
            url='https://monitoring.react-scan.com/api/v1/ingest'
            commit={env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
            branch={env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}
          />
        ) : null}
        <NuqsAdapter>
          <Providers>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <ErrorBoundary>
                {env.NODE_ENV === 'development' ? <Hello /> : null}
                {children}
                {flags.analytics ? <Analytics /> : null}
                <SignInDialog />
                <OfflineIndicator />
                <VirtualMascot />
              </ErrorBoundary>
            </NextIntlClientProvider>
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  )
}

export default Layout
