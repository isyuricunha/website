import type { Metadata, ResolvingMetadata } from 'next'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui/server'
import { FileText, Code, Music, User, Home, Map as MapIcon, Calendar, MessageSquare, Mail } from 'lucide-react'

import { allPosts, allProjects } from 'content-collections'

import PageTitle from '@/components/page-title'
import Link from '@/components/link'
import { SITE_URL } from '@/lib/constants'
import { build_alternates } from '@/lib/seo'

type PageProps = {
  params: Promise<{
    locale: string
  }>
}

export const generateStaticParams = (): Array<{ locale: string }> => {
  return i18n.locales.map((locale) => ({ locale }))
}

export const generateMetadata = async (
  props: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const { locale } = await props.params
  const previousOpenGraph = (await parent).openGraph ?? {}
  const previousTwitter = (await parent).twitter ?? {}
  const t = await getTranslations({ locale, namespace: 'sitemap' })
  const title = t('title')
  const description = t('description')
  const alternates = build_alternates({ slug: '/sitemap', locale })
  const fullUrl = `${SITE_URL}${alternates.canonical}`

  return {
    title,
    description,
    alternates,
    openGraph: {
      ...previousOpenGraph,
      url: fullUrl,
      type: 'website',
      title,
      description
    },
    twitter: {
      ...previousTwitter,
      title,
      description
    }
  }
}

const SitemapPage = async (props: PageProps) => {
  const { locale } = await props.params
  setRequestLocale(locale)
  const t = await getTranslations('sitemap')
  const tCommon = await getTranslations()

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })

  const mainPages = [
    {
      title: tCommon('layout.home'),
      description: t('main-pages.items.home.description'),
      href: '/',
      icon: <Home className='h-4 w-4' />
    },
    {
      title: tCommon('layout.blog'),
      description: t('main-pages.items.blog.description'),
      href: '/blog',
      icon: <FileText className='h-4 w-4' />
    },
    {
      title: tCommon('layout.projects'),
      description: t('main-pages.items.projects.description'),
      href: '/projects',
      icon: <Code className='h-4 w-4' />
    },
    {
      title: tCommon('layout.guestbook'),
      description: t('main-pages.items.guestbook.description'),
      href: '/guestbook',
      icon: <MessageSquare className='h-4 w-4' />
    },
    {
      title: tCommon('layout.uses'),
      description: t('main-pages.items.uses.description'),
      href: '/uses',
      icon: <Code className='h-4 w-4' />
    },
    {
      title: tCommon('layout.now'),
      description: t('main-pages.items.now.description'),
      href: '/now',
      icon: <Calendar className='h-4 w-4' />
    },
    {
      title: tCommon('layout.spotify'),
      description: t('main-pages.items.spotify.description'),
      href: '/spotify',
      icon: <Music className='h-4 w-4' />
    },
    {
      title: tCommon('layout.contact'),
      description: t('main-pages.items.contact.description'),
      href: '/contact',
      icon: <Mail className='h-4 w-4' />
    },
    {
      title: t('main-pages.items.about.title'),
      description: t('main-pages.items.about.description'),
      href: '/about',
      icon: <User className='h-4 w-4' />
    },
    {
      title: tCommon('layout.sitemap'),
      description: t('main-pages.items.sitemap.description'),
      href: '/sitemap',
      icon: <MapIcon className='h-4 w-4' />
    }
  ]

  const localePosts = allPosts
    .filter((post) => post.locale === locale)
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const localeProjects = allProjects
    .filter((project) => project.locale === locale)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <PageTitle title={t('title')} description={t('description')} />

      <div className='space-y-8'>
        {/* Main Pages */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <MapIcon className='h-5 w-5' />
              {t('main-pages.title')}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('main-pages.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {mainPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className='hover:bg-muted/50 group block rounded-lg border p-4 transition-colors'
                >
                  <div className='flex items-start gap-3'>
                    <div className='text-muted-foreground group-hover:text-foreground mt-0.5 flex-shrink-0'>
                      {page.icon}
                    </div>
                    <div>
                      <h3 className='group-hover:text-primary mb-1 text-sm font-medium sm:text-base'>
                        {page.title}
                      </h3>
                      <p className='text-muted-foreground text-xs sm:text-sm'>{page.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <FileText className='h-5 w-5' />
              {t('blog-posts.title')} ({localePosts.length})
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('blog-posts.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {localePosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className='hover:bg-muted/50 group block rounded-lg p-3 transition-colors'
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='min-w-0 flex-1'>
                      <h4 className='group-hover:text-primary mb-1 truncate text-sm font-medium sm:text-base'>
                        {post.title}
                      </h4>
                      <p className='text-muted-foreground mb-2 line-clamp-2 text-xs sm:text-sm'>
                        {post.summary}
                      </p>
                      <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                        <span>{dateFormatter.format(new Date(post.date))}</span>
                        {post.tags && post.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{post.tags.slice(0, 2).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <Code className='h-5 w-5' />
              {t('projects.title')} ({localeProjects.length})
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('projects.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {localeProjects.map((project) => (
                <div
                  key={project.slug}
                  className='hover:bg-muted/50 group block rounded-lg border p-4 transition-colors'
                >
                  <div className='flex items-start gap-3'>
                    <div className='mt-0.5 flex-shrink-0'>
                      <Code className='text-muted-foreground group-hover:text-foreground h-4 w-4' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <Link
                        href={`/projects/${project.slug}`}
                        className='group-hover:text-primary mb-1 block text-sm font-medium sm:text-base'
                      >
                        {project.name}
                      </Link>
                      <p className='text-muted-foreground mb-2 line-clamp-2 text-xs sm:text-sm'>
                        {project.description}
                      </p>
                      <div className='flex items-center gap-2'>
                        {project.homepage && (
                          <Link
                            href={project.homepage}
                            className='text-primary text-xs hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {t('labels.live-demo')}
                          </Link>
                        )}
                        {project.repository && (
                          <Link
                            href={project.repository}
                            className='text-muted-foreground hover:text-foreground text-xs'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {t('labels.github')}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default SitemapPage
