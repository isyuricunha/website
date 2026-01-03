export const NextConfigHeaders = [
  {
    source: '/admin/:path*',
    headers: [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow'
      }
    ]
  },
  {
    source: '/:locale/admin/:path*',
    headers: [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow'
      }
    ]
  },
  {
    source: '/api/:path*',
    headers: [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow'
      }
    ]
  },
  {
    source: '/reset-password/:path*',
    headers: [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow'
      }
    ]
  },
  {
    source: '/:locale/reset-password/:path*',
    headers: [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow'
      }
    ]
  },
  {
    source: '/(.*)',
    headers: [
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      }
    ]
  }
]
