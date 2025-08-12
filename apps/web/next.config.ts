import type { NextConfig } from 'next'

import '@tszhong0411/env'

import { withContentCollections } from '@content-collections/next'
import bundleAnalyzer from '@next/bundle-analyzer'
import { NextConfigHeaders } from '@tszhong0411/shared'
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

  eslint: {
    ignoreDuringBuilds: !!process.env.CI
  },
  typescript: {
    ignoreBuildErrors: !!process.env.CI
  },

  transpilePackages: ['@tszhong0411/*'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
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

  // eslint-disable-next-line @typescript-eslint/require-await -- must be async
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

  // eslint-disable-next-line @typescript-eslint/require-await -- must be async
  async headers() {
    return NextConfigHeaders
  },

  webpack: (c) => {
    if (process.env.REACT_SCAN_MONITOR_API_KEY) {
      c.plugins.push(ReactComponentName({}))
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- it's unknown
    return c
  }
}

export default withContentCollections(withNextIntl(withBundleAnalyzer(config)))
