import { SITE_URL } from '@/lib/constants'

export const GET = (): Response => {
  const body = [
    `User-agent: *`,
    `Allow: /`,
    `Allow: /api/avatar/*`,
    `Disallow: /api/`,
    `Disallow: /admin`,
    `Disallow: /admin/`,
    `Disallow: /admin/*`,
    `Disallow: /*/admin`,
    `Disallow: /*/admin/`,
    `Disallow: /*/admin/*`,
    `Disallow: /reset-password`,
    `Disallow: /reset-password/`,
    `Disallow: /reset-password/*`,
    `Disallow: /*/reset-password`,
    `Disallow: /*/reset-password/`,
    `Disallow: /*/reset-password/*`,
    `Disallow: /_next/`,
    `Disallow: /_next/*`,
    ``,
    `Content-Signal: ai-train=no, search=yes, ai-input=yes`,
    ``,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    `Host: ${SITE_URL}`,
    ``
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}
