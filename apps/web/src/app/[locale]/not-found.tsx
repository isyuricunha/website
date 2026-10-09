import type { Metadata } from 'next'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations } from '@isyuricunha/i18n/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonVariants
} from '@isyuricunha/yutheme/server'
import { ArrowRight, FileText, Code, FolderGit2 } from 'lucide-react'
import { allPosts, allProjects, allSnippets } from 'content-collections'

import GoToHomepage from '@/components/go-to-homepage'
import Link from '@/components/link'
import MainLayout from '@/components/main-layout'
import SiteSearch from '@/components/site-search'

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
      <div className='mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-10 pt-10 sm:pt-14'>
        <div className='flex min-w-0 flex-col items-start'>
          <div className='label-mono bg-bg-surface mb-4 inline-flex items-center gap-2 rounded-sm border border-[var(--border-subtle)] px-3 py-1'>
            <span>404</span>
            <span className='text-text-tertiary/70'>·</span>
            <span>{t('notFound.badge')}</span>
          </div>
          <h1 className='text-[clamp(32px,4vw,52px)] leading-[1.08] font-normal tracking-tighter break-words'>
            {t('not-found')}
          </h1>
          <p className='mt-4 max-w-2xl text-base leading-relaxed sm:text-lg'>
            {t('notFound.subtitle')}
          </p>
        </div>

        <div className='mx-auto w-full max-w-lg min-w-0'>
          <SiteSearch />
        </div>

        <div className='flex flex-wrap gap-3'>
          <GoToHomepage />
          <Link href='/sitemap' className={buttonVariants({ variant: 'outline' })}>
            {t('layout.sitemap')}
          </Link>
          <Link href='/blog' className={buttonVariants({ variant: 'outline' })}>
            {t('layout.blog')}
          </Link>
          <Link href='/snippet' className={buttonVariants({ variant: 'outline' })}>
            {t('layout.snippets')}
          </Link>
          <Link href='/projects' className={buttonVariants({ variant: 'outline' })}>
            {t('layout.projects')}
          </Link>
          <Link href='/guestbook' className={buttonVariants({ variant: 'outline' })}>
            {t('layout.guestbook')}
          </Link>
        </div>

        <div className='grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Card className='min-w-0'>
            <CardHeader className='min-w-0 pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <FileText className='size-4' />
                {t('notFound.recentPosts')}
              </CardTitle>
              <CardDescription>{t('notFound.recentPostsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className='flex min-w-0 flex-col gap-3'>
              {recent_posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className='hover:bg-bg-hover -mx-2 rounded-lg px-2 py-2 transition-colors'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-medium'>{post.title}</div>
                      <div className='text-muted-foreground line-clamp-2 text-xs'>
                        {post.summary}
                      </div>
                    </div>
                    <ArrowRight className='text-muted-foreground mt-1 size-4 shrink-0' />
                  </div>
                </Link>
              ))}
              <Link
                href='/blog'
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                  className: 'justify-start'
                })}
              >
                {t('notFound.viewAll')}
              </Link>
            </CardContent>
          </Card>

          <Card className='min-w-0'>
            <CardHeader className='min-w-0 pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Code className='size-4' />
                {t('notFound.recentSnippets')}
              </CardTitle>
              <CardDescription>{t('notFound.recentSnippetsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className='flex min-w-0 flex-col gap-3'>
              {recent_snippets.map((snippet) => (
                <Link
                  key={snippet.slug}
                  href={`/snippet/${snippet.slug}`}
                  className='hover:bg-bg-hover -mx-2 rounded-lg px-2 py-2 transition-colors'
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
                href='/snippet'
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                  className: 'justify-start'
                })}
              >
                {t('notFound.viewAll')}
              </Link>
            </CardContent>
          </Card>

          <Card className='min-w-0'>
            <CardHeader className='min-w-0 pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <FolderGit2 className='size-4' />
                {t('notFound.recentProjects')}
              </CardTitle>
              <CardDescription>{t('notFound.recentProjectsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className='flex min-w-0 flex-col gap-3'>
              {recent_projects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className='hover:bg-bg-hover -mx-2 rounded-lg px-2 py-2 transition-colors'
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
                href='/projects'
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                  className: 'justify-start'
                })}
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
