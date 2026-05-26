import { allPosts, allProjects, allSnippets } from 'content-collections'

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants'
import { getLocalizedPath } from '@/utils/get-localized-path'

const MAX_ITEMS_PER_COLLECTION = 24

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
  const posts = allPosts
    .toSorted(
      (a, b) =>
        new Date(b.modifiedTime || b.date).getTime() - new Date(a.modifiedTime || a.date).getTime()
    )
    .slice(0, MAX_ITEMS_PER_COLLECTION)
    .map((post) =>
      formatItem({
        title: post.title,
        href: `${SITE_URL}${getLocalizedPath({ slug: `/blog/${post.slug}`, locale: post.locale })}`,
        description: post.summary
      })
    )

  const projects = allProjects
    .filter((project) => project.selected || project.featured)
    .slice(0, MAX_ITEMS_PER_COLLECTION)
    .map((project) =>
      formatItem({
        title: project.name,
        href: `${SITE_URL}${getLocalizedPath({ slug: `/projects/${project.slug}`, locale: project.locale })}`,
        description: project.description
      })
    )

  const snippets = allSnippets
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_ITEMS_PER_COLLECTION)
    .map((snippet) =>
      formatItem({
        title: snippet.title,
        href: `${SITE_URL}${getLocalizedPath({ slug: `/snippet/${snippet.slug}`, locale: snippet.locale })}`,
        description: snippet.description
      })
    )

  const body = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## Canonical indexes',
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    `- [Robots](${SITE_URL}/robots.txt)`,
    `- [RSS](${SITE_URL}/rss.xml)`,
    '',
    '## Main sections',
    `- [Home](${SITE_URL})`,
    `- [About](${SITE_URL}/about)`,
    `- [Blog](${SITE_URL}/blog)`,
    `- [Projects](${SITE_URL}/projects)`,
    `- [Music](${SITE_URL}/music)`,
    `- [Contact](${SITE_URL}/contact)`,
    '',
    '## Recent posts',
    ...posts,
    '',
    '## Selected projects',
    ...projects,
    '',
    '## Recent snippets',
    ...snippets,
    ''
  ].join('\n')

  return new Response(body, {
    headers: {
      'cache-control': 'public, max-age=3600',
      'content-type': 'text/plain; charset=utf-8'
    }
  })
}
