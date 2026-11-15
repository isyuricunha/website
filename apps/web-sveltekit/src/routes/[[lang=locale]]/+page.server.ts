import { i18n } from '@isyuricunha/i18n/config'
import { getPage, getPosts, getProjects } from '#lib/content.ts'
import { buildSeoHead } from '#lib/seo.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ params, parent }) => {
  const locale = params.lang ?? i18n.defaultLocale
  await parent()
  const t = await getServerTranslator(locale)
  const t_metadata = (key: string) => t(`metadata.${key}`)

  const posts = getPosts(locale)
  const latestPosts = posts.slice(0, 2)
  const projects = getProjects(locale).filter((project) => project.selected)

  const featuredProject = projects[0]
  const supportingProjects = projects.slice(1, 3)

  const aboutPage = getPage(locale, 'about')

  return {
    ...buildSeoHead({
      slug: '',
      locale,
      title: t_metadata('site-title'),
      description: t_metadata('site-description')
    }),
    locale,
    hero: {
      strings: {
        locationTimezone: t('homepage.hero.location-timezone'),
        titleTop: t('homepage.hero.title-top'),
        titleMiddleLeft: t('homepage.hero.title-middle-left'),
        titleMiddleRight: t('homepage.hero.title-middle-right'),
        amazing: t('homepage.hero.amazing'),
        titleBottom: t('homepage.hero.title-bottom'),
        description: t_metadata('site-description'),
        viewProjects: t('homepage.hero.view-projects'),
        readBlog: t('homepage.hero.read-blog'),
        codeDatabaseSpecialist: t('homepage.hero.code.database-specialist'),
        codeRegion: t('homepage.hero.code.region'),
        codeFocus: t('homepage.hero.code.focus'),
        siteTitle: t_metadata('site-title')
      },
      reversedTitleOrder: ['pt', 'es', 'fr'].includes(locale)
    },
    selectedProjects: featuredProject
      ? {
          strings: {
            card: t('homepage.selectedProjects.card'),
            title: t('homepage.selectedProjects.title'),
            more: t('homepage.selectedProjects.more')
          },
          featured: {
            slug: featuredProject.slug,
            name: featuredProject.name,
            description: featuredProject.description
          },
          supporting: supportingProjects.map(({ slug, name, description }) => ({
            slug,
            name,
            description
          }))
        }
      : null,
    latestArticles: latestPosts[0]
      ? {
          strings: {
            card: t('homepage.latest-articles.card'),
            title: t('homepage.latest-articles.title'),
            more: t('homepage.latest-articles.more')
          },
          featured: {
            slug: latestPosts[0].slug,
            title: latestPosts[0].title,
            summary: latestPosts[0].summary,
            date: latestPosts[0].date
          },
          supporting: latestPosts[1]
            ? {
                slug: latestPosts[1].slug,
                title: latestPosts[1].title,
                summary: latestPosts[1].summary,
                date: latestPosts[1].date
              }
            : null
        }
      : null,
    getInTouch: {
      strings: {
        label: t('homepage.get-in-touch.label'),
        title: t('homepage.get-in-touch.title'),
        description: t('homepage.get-in-touch.description'),
        availability: t('homepage.get-in-touch.availability'),
        imageAlt: t('homepage.get-in-touch.image-alt'),
        codeStatus: t('homepage.get-in-touch.code.status'),
        codeEmail: t('homepage.get-in-touch.code.email'),
        codeTimezone: t('homepage.get-in-touch.code.timezone')
      },
      hasAboutPage: aboutPage !== undefined
    }
  }
}
