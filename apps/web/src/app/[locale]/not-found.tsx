import type { Metadata } from 'next'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations } from '@isyuricunha/i18n/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, buttonVariants } from '@isyuricunha/ui/server'
import { ArrowRight, FileText, Code, FolderGit2 } from 'lucide-react'
import { allPosts, allProjects, allSnippets } from 'content-collections'

import GoToHomepage from '@/components/go-to-homepage'
import Link from '@/components/link'
import MainLayout from '@/components/main-layout'
import SiteSearch from '@/components/site-search'
import { getLocalizedPath } from '@/utils/get-localized-path'

type PageProps = {
  params?: Promise<{
    locale: string
  }>
}

export const generateMetadata = async (props: PageProps): Promise<Metadata> => {
  const locale = (await props.params)?.locale ?? i18n.defaultLocale
  const t = await getTranslations({ locale })

  return {
    title: t('not-found'),
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false
      }
    }
  }
}

const NotFound = async (props: PageProps) => {
  const locale = (await props.params)?.locale ?? i18n.defaultLocale
  const t = await getTranslations({ locale })

  const recent_posts = allPosts
    .filter((p) => p.locale === locale)
    .toSorted((a, b) => {
      const da = new Date((a as unknown as { date?: string }).date ?? 0).getTime()
      const db = new Date((b as unknown as { date?: string }).date ?? 0).getTime()
      return db - da
    })
    .slice(0, 3)

  const recent_snippets = allSnippets
    .filter((s) => s.locale === locale)
    .toSorted((a, b) => {
      const da = new Date((a as unknown as { date?: string }).date ?? 0).getTime()
      const db = new Date((b as unknown as { date?: string }).date ?? 0).getTime()
      return db - da
    })
    .slice(0, 3)

  const recent_projects = allProjects
    .filter((p) => p.locale === locale)
    .toSorted((a, b) => {
      const da = new Date((a as unknown as { date?: string }).date ?? 0).getTime()
      const db = new Date((b as unknown as { date?: string }).date ?? 0).getTime()
      return db - da
    })
    .slice(0, 3)

  return (
    <MainLayout>
      <div className='mx-auto flex w-full max-w-4xl flex-col gap-10 pt-10 sm:pt-14'>
        <div className='flex flex-col items-center text-center'>
          <div className='text-muted-foreground mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide'>
            <span>404</span>
            <span className='text-muted-foreground/70'>·</span>
            <span>{t('notFound.badge')}</span>
          </div>
          <h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>{t('not-found')}</h1>
          <p className='text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed sm:text-lg'>
            {t('notFound.subtitle')}
          </p>
        </div>

        <div className='mx-auto w-full max-w-lg'>
          <SiteSearch />
        </div>

        <div className='flex flex-wrap justify-center gap-3'>
          <GoToHomepage />
          <Link href={getLocalizedPath({ slug: '/sitemap', locale })} className={buttonVariants({ variant: 'outline' })}>
            {t('layout.sitemap')}
          </Link>
          <Link href={getLocalizedPath({ slug: '/blog', locale })} className={buttonVariants({ variant: 'outline' })}>
            {t('layout.blog')}
          </Link>
          <Link href={getLocalizedPath({ slug: '/snippet', locale })} className={buttonVariants({ variant: 'outline' })}>
            {t('layout.snippets')}
          </Link>
          <Link href={getLocalizedPath({ slug: '/projects', locale })} className={buttonVariants({ variant: 'outline' })}>
            {t('layout.projects')}
          </Link>
          <Link href={getLocalizedPath({ slug: '/guestbook', locale })} className={buttonVariants({ variant: 'outline' })}>
            {t('layout.guestbook')}
          </Link>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <FileText className='size-4' />
                {t('notFound.recentPosts')}
              </CardTitle>
              <CardDescription>{t('notFound.recentPostsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              {recent_posts.map((post) => (
                <Link
                  key={post.slug}
                  href={getLocalizedPath({ slug: `/blog/${post.slug}`, locale })}
                  className='hover:bg-muted/40 -mx-2 rounded-lg px-2 py-2 transition-colors'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-medium'>{post.title}</div>
                      <div className='text-muted-foreground line-clamp-2 text-xs'>{post.summary}</div>
                    </div>
                    <ArrowRight className='text-muted-foreground mt-1 size-4 shrink-0' />
                  </div>
                </Link>
              ))}
              <Link
                href={getLocalizedPath({ slug: '/blog', locale })}
                className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'justify-start' })}
              >
                {t('notFound.viewAll')}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Code className='size-4' />
                {t('notFound.recentSnippets')}
              </CardTitle>
              <CardDescription>{t('notFound.recentSnippetsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              {recent_snippets.map((snippet) => (
                <Link
                  key={snippet.slug}
                  href={getLocalizedPath({ slug: `/snippet/${snippet.slug}`, locale })}
                  className='hover:bg-muted/40 -mx-2 rounded-lg px-2 py-2 transition-colors'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-medium'>{snippet.title}</div>
                      <div className='text-muted-foreground line-clamp-2 text-xs'>
                        {snippet.description}
                      </div>
                    </div>
                    <ArrowRight className='text-muted-foreground mt-1 size-4 shrink-0' />
                  </div>
                </Link>
              ))}
              <Link
                href={getLocalizedPath({ slug: '/snippet', locale })}
                className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'justify-start' })}
              >
                {t('notFound.viewAll')}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <FolderGit2 className='size-4' />
                {t('notFound.recentProjects')}
              </CardTitle>
              <CardDescription>{t('notFound.recentProjectsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              {recent_projects.map((project) => (
                <Link
                  key={project.slug}
                  href={getLocalizedPath({ slug: `/projects/${project.slug}`, locale })}
                  className='hover:bg-muted/40 -mx-2 rounded-lg px-2 py-2 transition-colors'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-medium'>{project.name}</div>
                      <div className='text-muted-foreground line-clamp-2 text-xs'>
                        {project.description}
                      </div>
                    </div>
                    <ArrowRight className='text-muted-foreground mt-1 size-4 shrink-0' />
                  </div>
                </Link>
              ))}
              <Link
                href={getLocalizedPath({ slug: '/projects', locale })}
                className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'justify-start' })}
              >
                {t('notFound.viewAll')}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default NotFound
