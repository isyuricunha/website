import { allDocs } from 'content-collections'

import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/constants'

const formatItem = ({
  title,
  href,
  description
}: {
  title: string
  href: string
  description?: string
}) => {
  return `- [${title}](${href})${description ? `: ${description}` : ''}`
}

export const GET = () => {
  const docs = allDocs.map((doc) =>
    formatItem({
      title: doc.title,
      href: `${SITE_URL}${doc.slug ? `/${doc.slug}` : ''}`,
      description: doc.description
    })
  )

  const body = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## Canonical indexes',
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    `- [Robots](${SITE_URL}/robots.txt)`,
    '',
    '## Documentation',
    ...docs,
    ''
  ].join('\n')

  return new Response(body, {
    headers: {
      'cache-control': 'public, max-age=3600',
      'content-type': 'text/plain; charset=utf-8'
    }
  })
}
