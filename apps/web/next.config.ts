import type { NextConfig } from 'next'

import { env } from '@isyuricunha/env'

import { withContentCollections } from '@content-collections/next'
import bundleAnalyzer from '@next/bundle-analyzer'
import { NextConfigHeaders } from '@isyuricunha/shared'
import createNextIntlPlugin from 'next-intl/plugin'
import ReactComponentName from 'react-scan/react-component-name/webpack'

const withNextIntl = createNextIntlPlugin()

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

const config: NextConfig = {
  experimental: {
    optimizePackageImports: ['shiki']
  },

  typescript: {
    ignoreBuildErrors: false
  },

  transpilePackages: ['@isyuricunha/*'],

  images: {
    qualities: [25, 50, 75, 85, 100],
    remotePatterns: [
      ...(() => {
        if (!env.R2_PUBLIC_BASE_URL) return []

        try {
          const url = new URL(env.R2_PUBLIC_BASE_URL)
          const protocol =
            url.protocol === 'http:' ? 'http' : url.protocol === 'https:' ? 'https' : null

          if (!protocol) return []

          return [
            {
              protocol,
              hostname: url.hostname
            } as const
          ]
        } catch {
          return []
        }
      })(),
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me'
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc'
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co'
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co'
      },
      {
        protocol: 'https',
        hostname: 'wrapped-images.spotifycdn.com'
      },
      {
        protocol: 'https',
        hostname: 'seeded-session-images.scdn.co'
      },
      {
        protocol: 'https',
        hostname: 'thisis-images.spotifycdn.com'
      },
      {
        protocol: 'https',
        hostname: 'image-cdn-fa.spotifycdn.com'
      },
      {
        protocol: 'https',
        hostname: 'image-cdn-*.spotifycdn.com'
      },
      {
        protocol: 'https',
        hostname: '*.spotifycdn.com'
      },
      {
        protocol: 'https',
        hostname: '*.scdn.co'
      }
    ]
  },

  async redirects() {
    return [
      {
        source: '/pc-specs',
        destination: '/uses',
        permanent: true
      },
      {
        source: '/atom',
        destination: '/rss.xml',
        permanent: true
      },
      {
        source: '/feed',
        destination: '/rss.xml',
        permanent: true
      },
      {
        source: '/rss',
        destination: '/rss.xml',
        permanent: true
      }
    ]
  },

  async headers() {
    return NextConfigHeaders
  },

  webpack: (c) => {
    if (process.env.NODE_ENV === 'development' && process.env.REACT_SCAN_MONITOR_API_KEY) {
      c.plugins.push(ReactComponentName({}))
    }

    return c
  }
}

export default withContentCollections(withNextIntl(withBundleAnalyzer(config)))
