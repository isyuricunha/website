import { i18n } from '@isyuricunha/i18n/config'
import { getPage, getPosts, getProjects } from '#lib/content.ts'
import { buildRecentlyUpdated } from './recently-updated.ts'
import { buildSeoHead } from '#lib/seo.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { EntryGenerator, PageServerLoad } from './$types'

// The default crawl evaluates the optional [[lang=locale]] param as empty,
// so only the unprefixed variant gets prerendered without an explicit list.
export const entries: EntryGenerator = () =>
  i18n.locales.map((locale) => ({ lang: locale as never }))

export const prerender = true

export const load: PageServerLoad = async ({ params, parent }) => {
  const locale = params.lang ?? i18n.defaultLocale
  await parent()
  const t = await getServerTranslator(locale)
  const t_metadata = (key: string) => t(`metadata.${key}`)

  const posts = getPosts(locale)
  const latestPosts = posts.slice(0, 2)
  const projects = getProjects(locale).filter((project) => project.selected)
  const recentlyUpdated = buildRecentlyUpdated(locale, posts, getProjects(locale))

  const aboutLabels: Record<string, string> = {
    'about-me.title': t('homepage.about-me.title'),
    'about-me.more': t('homepage.about-me.more'),
    'about-me.location': t('homepage.about-me.location'),
    'about-me.stacks': t('homepage.about-me.stacks'),
    'about-me.connect': t('homepage.about-me.connect'),
    'about-me.coding-hours': t('homepage.about-me.coding-hours'),
    'about-me.coding-hours-value': t('homepage.about-me.coding-hours-value'),
    'about-me.fav-framework': t('homepage.about-me.fav-framework'),
    'common-error': t('common.error'),
    'newsletter.title': t('homepage.newsletter.title'),
    'newsletter.description': t('homepage.newsletter.description'),
    'newsletter.email-label': t('homepage.newsletter.email-label'),
    'newsletter.placeholder': t('homepage.newsletter.placeholder'),
    'newsletter.cta': t('homepage.newsletter.cta'),
    'newsletter.disclaimer': t('homepage.newsletter.disclaimer'),
    'newsletter.success-title': t('homepage.newsletter.success-title'),
    'newsletter.success-description': t('homepage.newsletter.success-description'),
    'newsletter.error-default': t('homepage.newsletter.error-default'),
    'newsletter.turnstile-required': t('homepage.newsletter.turnstile-required'),
    'newsletter.turnstile-error': t('homepage.newsletter.turnstile-error'),
    'recently-updated.title': t('homepage.recently-updated.title'),
    'recently-updated.description': t('homepage.recently-updated.description'),
    'recently-updated.type.post': t('homepage.recently-updated.type.post'),
    'recently-updated.type.project': t('homepage.recently-updated.type.project'),
    'recently-updated.updated-on': t('homepage.recently-updated.updated-on'),
    'recently-updated.empty': t('homepage.recently-updated.empty'),
    'announcement.high-priority': t('component.announcement-banner.high-priority'),
    'announcement.dismiss': t('component.announcement-banner.dismiss')
  }

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
    recentlyUpdated,
    aboutLabels,
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
