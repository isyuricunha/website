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
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'yuricunha.com'
      }
    ]
  },

  transpilePackages: ['@tszhong0411/*'],

  async headers() {
    return NextConfigHeaders
  },

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
