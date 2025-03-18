import type { NextConfig } from 'next'

import { withContentCollections } from '@content-collections/next'
import bundleAnalyzer from '@next/bundle-analyzer'
import { NextConfigHeaders } from '@tszhong0411/shared'

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

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'honghong.me'
      }
    ]
  },

  transpilePackages: ['@tszhong0411/*'],

  // eslint-disable-next-line @typescript-eslint/require-await -- must be async
  async headers() {
    return NextConfigHeaders
  },

  // eslint-disable-next-line @typescript-eslint/require-await -- must be async
  async redirects() {
    return [
      {
        source: '/ui/components',
        destination: '/ui/components/accordion',
        permanent: true
      }
    ]
  }
}

export default withContentCollections(withBundleAnalyzer(config))
