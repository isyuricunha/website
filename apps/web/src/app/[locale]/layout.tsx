import type { Metadata, Viewport } from 'next'

import '@/styles/globals.css'

import { env, flags } from '@tszhong0411/env'
import { NextIntlClientProvider } from '@tszhong0411/i18n/client'
import { i18n } from '@tszhong0411/i18n/config'
import { getMessages, getTranslations, setRequestLocale } from '@tszhong0411/i18n/server'
import { cn } from '@tszhong0411/utils'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import Script from 'next/script'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Monitoring } from 'react-scan/monitoring/next'

import Analytics from '@/components/analytics'
import Hello from '@/components/hello'
import SignInDialog from '@/components/sign-in-dialog'
import OfflineIndicator from '@/components/offline-indicator'
import ErrorBoundary from '@/components/ui/error-boundary'
import { SITE_KEYWORDS, SITE_NAME, SITE_URL } from '@/lib/constants'

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

  return (
    <html
      lang={locale}
      className={cn(GeistSans.variable, GeistMono.variable)}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Yuri Cunha" />
        {env.NODE_ENV === 'development' ? (
          <Script src='https://unpkg.com/react-scan/dist/auto.global.js' />
        ) : null}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `}
        </Script>
      </head>
      <body className='relative flex min-h-screen flex-col'>
        {env.REACT_SCAN_MONITOR_API_KEY ? (
          <Monitoring
            apiKey={env.REACT_SCAN_MONITOR_API_KEY}
            url='https://monitoring.react-scan.com/api/v1/ingest'
            commit={env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
            branch={env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}
          />
        ) : null}
        <NuqsAdapter>
          <Providers>
            <NextIntlClientProvider messages={messages}>
              <ErrorBoundary>
                <Hello />
                {children}
                {flags.analytics ? <Analytics /> : null}
                <SignInDialog />
                <OfflineIndicator />
              </ErrorBoundary>
            </NextIntlClientProvider>
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  )
}

export default Layout
