import type { Post, Project } from 'content-collections'

// Server-computed "recently updated" items: the client bundle no longer ships
// the whole MDX corpus just to render three links.
export const buildRecentlyUpdated = (locale: string, posts: Post[], projects: Project[]) => {
  const items: Array<{
    id: string
    title: string
    description: string
    href: string
    type: 'post' | 'project'
    date: string
    dateFormatted: string
  }> = []
  const seen = new Set<string>()

  let dateFormatter: Intl.DateTimeFormat
  try {
    dateFormatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    })
  } catch {
    dateFormatter = new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }

  for (const post of posts.slice(0, 6)) {
    const id = `post-${post.slug}`
    if (!seen.has(id)) {
      seen.add(id)
      const date = post.modifiedTime || post.date
      items.push({
        id,
        title: post.title,
        description: post.summary,
        href: `/blog/${post.slug}`,
        type: 'post',
        date,
        dateFormatted: dateFormatter.format(new Date(date))
      })
    }
  }

  for (const project of projects) {
    const id = `project-${project.slug}`
    if (!seen.has(id)) {
      seen.add(id)
      const date = project.endDate || project.startDate || new Date('2024-01-01').toISOString()
      items.push({
        id,
        title: project.name,
        description: project.description,
        href: '/projects',
        type: 'project',
        date,
        dateFormatted: dateFormatter.format(new Date(date))
      })
    }
  }

  return items
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
}
