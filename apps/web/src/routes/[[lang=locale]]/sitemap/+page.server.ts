import { i18n } from '@isyuricunha/i18n/config'
import { error } from '@sveltejs/kit'
import { getPosts, getProjects, getSnippets } from '#lib/content.ts'
import { buildSeoHead, getLocalizedPath } from '#lib/seo.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { EntryGenerator, PageServerLoad } from './$types'

export const entries: EntryGenerator = () =>
  i18n.locales.map((locale) => ({ lang: locale as never }))

// The original renders the sitemap index as a prerendered page; its links
// are how crawlers discover every localizable route.
export const prerender = true

const LOCALE_DATE = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: '2-digit'
})

function localizedDate(value: string): string {
  return LOCALE_DATE.format(new Date(`${value.slice(0, 10)}T12:00:00`))
}

function routeFor(key: string): string {
  switch (key) {
    case 'home':
      return '/'
    case 'snippets':
      return '/snippet'
    case 'guestbook':
      return '/guestbook'
    default:
      return `/${key}`
  }
}

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  if (!i18n.locales.includes(locale)) {
    error(404, 'Locale not found')
  }
  const t = await getServerTranslator(locale)

  const posts = getPosts(locale).map((post) => ({
    href: getLocalizedPath({ slug: `/blog/${post.slug}`, locale }),
    title: post.title,
    date: localizedDate(post.date)
  }))
  const projects = getProjects(locale)
    .map((project) => ({
      href: getLocalizedPath({ slug: `/projects/${project.slug}`, locale }),
      name: project.name,
      homepage: project.homepage
    }))
    .toSorted((a, b) => a.name.localeCompare(b.name))
  const snippets = getSnippets(locale).map((snippet) => ({
    href: getLocalizedPath({ slug: `/snippet/${snippet.slug}`, locale }),
    title: snippet.title,
    date: snippet.date ? localizedDate(snippet.date) : ''
  }))

  // Icon paths share the multi-path | separator used by src/lib/links.ts.
  const itemIcon: Record<string, string> = {
    home: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z|m9 22V12h6v10',
    blog: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.108a.5.5 0 0 0 .623.622l4.108-1.32a2 2 0 0 0 .83-.497z|m15 5 4 4',
    snippets: 'm16 18 6-6-6-6|m8 6-6 6 6 6',
    projects:
      'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
    guestbook: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',
    uses: 'M8 21h8|m12 17v4|m3 5h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
    now: 'M8 2v4|m16 2v4|m3 10h18|m5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    music: 'M9 18V5l12-2v13|m9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z|m21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    contact:
      'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
    about:
      'M18 20a6 6 0 0 0-12 0|m12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|m22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z',
    sitemap: 'm12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z'
  }

  const mainPageKeys = [
    'home',
    'blog',
    'snippets',
    'projects',
    'guestbook',
    'uses',
    'now',
    'music',
    'contact',
    'about',
    'sitemap'
  ]
  const mainPages = mainPageKeys.map((key) => ({
    href: routeFor(key),
    icon: itemIcon[key] ?? '',
    title: t(`layout.${key}`),
    description: t(`sitemap.main-pages.items.${key}.description`)
  }))

  return {
    ...buildSeoHead({
      slug: '/sitemap',
      locale,
      title: t('sitemap.title'),
      description: t('sitemap.description')
    }),
    mainPages,
    posts,
    projects,
    snippets,
    strings: {
      mainPages: {
        title: t('sitemap.main-pages.title'),
        description: t('sitemap.main-pages.description')
      },
      blogPosts: {
        title: t('sitemap.blog-posts.title'),
        description: t('sitemap.blog-posts.description')
      },
      projects: {
        title: t('sitemap.projects.title'),
        description: t('sitemap.projects.description')
      },
      snippets: {
        title: t('sitemap.snippets.title'),
        description: t('sitemap.snippets.description')
      },
      labels: {
        liveDemo: t('sitemap.labels.live-demo'),
        github: t('sitemap.labels.github')
      }
    }
  }
}
