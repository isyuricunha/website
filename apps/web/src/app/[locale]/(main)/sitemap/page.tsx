import type { Metadata, ResolvingMetadata } from 'next'

import { i18n } from '@tszhong0411/i18n/config'
import { getTranslations, setRequestLocale } from '@tszhong0411/i18n/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { FileText, Code, Music, User, Home, Map } from 'lucide-react'

import { allPosts } from 'content-collections'
import { allProjects } from 'content-collections'
import PageTitle from '@/components/page-title'
import Link from '@/components/link'
import { getLocalizedPath } from '@/utils/get-localized-path'

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
  const title = 'Sitemap'
  const description = 'Complete site navigation and content overview'
  const url = getLocalizedPath({ slug: '/sitemap', locale })

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      ...previousOpenGraph,
      url,
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
  const t = await getTranslations()

  const mainPages = [
    {
      title: t('layout.home'),
      description: 'Welcome page with overview of projects and articles',
      href: '/',
      icon: <Home className='h-4 w-4' />
    },
    {
      title: t('layout.blog'),
      description: 'Technical articles and thoughts on development',
      href: '/blog',
      icon: <FileText className='h-4 w-4' />
    },
    {
      title: t('layout.projects'),
      description: 'Portfolio of development projects and GitHub repositories',
      href: '/projects',
      icon: <Code className='h-4 w-4' />
    },
    {
      title: t('layout.uses'),
      description: 'Tools, equipment, and software I use for development',
      href: '/uses',
      icon: <Code className='h-4 w-4' />
    },
    {
      title: t('layout.spotify'),
      description: 'Music taste, listening activity, and statistics',
      href: '/spotify',
      icon: <Music className='h-4 w-4' />
    },
    {
      title: 'About',
      description: 'Learn more about me and my background',
      href: '/about',
      icon: <User className='h-4 w-4' />
    }
  ]

  // Sort posts by date
  const sortedPosts = allPosts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <>
      <PageTitle 
        title="Sitemap" 
        description="Complete overview of all site content and navigation"
      />

      <div className='space-y-8'>
        {/* Main Pages */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
              <Map className='h-5 w-5' />
              Main Pages
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              Core site navigation and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {mainPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className='group block p-4 rounded-lg border hover:bg-muted/50 transition-colors'
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground'>
                      {page.icon}
                    </div>
                    <div>
                      <h3 className='text-sm sm:text-base font-medium group-hover:text-primary mb-1'>
                        {page.title}
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        {page.description}
                      </p>
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
            <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Blog Posts ({sortedPosts.length})
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              All published articles and technical content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {sortedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className='group block p-3 rounded-lg hover:bg-muted/50 transition-colors'
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm sm:text-base font-medium group-hover:text-primary mb-1 truncate'>
                        {post.title}
                      </h4>
                      <p className='text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2'>
                        {post.summary}
                      </p>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <span>{new Date(post.date).toLocaleDateString()}</span>
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
            <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
              <Code className='h-5 w-5' />
              Projects ({allProjects.length})
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              Development projects and open source contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {allProjects.map((project) => (
                <div
                  key={project.slug}
                  className='group block p-4 rounded-lg border hover:bg-muted/50 transition-colors'
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 mt-0.5'>
                      <Code className='h-4 w-4 text-muted-foreground group-hover:text-foreground' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm sm:text-base font-medium group-hover:text-primary mb-1'>
                        {project.name}
                      </h4>
                      <p className='text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2'>
                        {project.description}
                      </p>
                      <div className='flex items-center gap-2'>
                        {project.homepage && (
                          <Link
                            href={project.homepage}
                            className='text-xs text-primary hover:underline'
                            onClick={(e) => e.stopPropagation()}
                          >
                            Live Demo
                          </Link>
                        )}
                        {project.repository && (
                          <Link
                            href={project.repository}
                            className='text-xs text-muted-foreground hover:text-foreground'
                            onClick={(e) => e.stopPropagation()}
                          >
                            GitHub
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
