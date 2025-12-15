import type { Metadata, ResolvingMetadata } from 'next'
import type { Article, WithContext } from 'schema-dts'

import { flags } from '@isyuricunha/env'
import { setRequestLocale } from '@isyuricunha/i18n/server'
import { allPosts } from 'content-collections'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import Comments from '@/components/comments'
import Mdx from '@/components/mdx'
import Recommendations from '@/components/ui/recommendations'
import { SITE_URL } from '@/lib/constants'
import { getRecommendedPosts } from '@/lib/recommendations'
import { generateBlogPostJsonLd, generateSEO } from '@/lib/seo'
import { getLocalizedPath } from '@/utils/get-localized-path'

import Footer from './footer'
import Header from './header'
import LikeButton from './like-button'
import MobileTableOfContents from './mobile-table-of-contents'
import ProgressBar from './progress-bar'
import Providers from './providers'
import TableOfContents from './table-of-contents'

type PageProps = {
  params: Promise<{
    slug: string
    locale: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateStaticParams = (): Array<{ slug: string; locale: string }> => {
  return allPosts.map((post) => ({
    slug: post.slug,
    locale: post.locale
  }))
}

export const generateMetadata = async (
  props: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const { slug, locale } = await props.params

  const post = allPosts.find((p) => p.slug === slug && p.locale === locale)

  if (!post) return {}

  const { title, summary, date, modifiedTime } = post

  const previousTwitter = (await parent).twitter ?? {}
  const previousOpenGraph = (await parent).openGraph ?? {}
  const url = getLocalizedPath({ slug: `/blog/${slug}`, locale })

  const alternateLocales = Array.from(
    new Set(allPosts.filter((p) => p.slug === slug && p.locale !== locale).map((p) => p.locale))
  )

  // Precompute safe values to avoid passing undefined to encodeURIComponent
  const safeTitle = title ?? ''
  const safeSummary = summary ?? ''
  const safeLocale = locale ?? ''
  const safeDate = date?.split('T')[0] ?? new Date().toISOString().split('T')[0] ?? ''
  const ogImageUrl = `/og/${slug}?title=${encodeURIComponent(safeTitle)}&date=${encodeURIComponent(safeDate)}&summary=${encodeURIComponent(safeSummary)}&locale=${safeLocale}&type=post`

  const seo = generateSEO({
    title,
    description: summary,
    url,
    image: ogImageUrl,
    type: 'article',
    publishedTime: date,
    modifiedTime,
    authors: [SITE_URL],
    locale,
    alternateLocales
  })

  return {
    ...seo,
    openGraph: {
      ...previousOpenGraph,
      ...seo.openGraph,
      url: seo.openGraph?.url
    },
    twitter: {
      ...previousTwitter,
      ...seo.twitter
    }
  }
}

const Page = async (props: PageProps) => {
  const { slug, locale } = await props.params
  setRequestLocale(locale)

  const post = allPosts.find((p) => p.slug === slug && p.locale === locale)

  if (!post) {
    notFound()
  }

  const { title, summary, date, modifiedTime, code, toc } = post
  const recommended_posts = getRecommendedPosts(slug)

  // Precompute safe values for JSON-LD as well
  const safeTitle = title ?? ''
  const safeSummary = summary ?? ''
  const safeLocale = locale ?? ''
  const safeDate = date?.split('T')[0] ?? new Date().toISOString().split('T')[0] ?? ''
  const ogImageUrl = `/og/${slug}?title=${encodeURIComponent(safeTitle)}&date=${encodeURIComponent(safeDate)}&summary=${encodeURIComponent(safeSummary)}&locale=${safeLocale}&type=post`

  const jsonLd = generateBlogPostJsonLd({
    title: title,
    description: summary,
    slug,
    locale,
    publishedTime: date,
    modifiedTime,
    image: ogImageUrl
  }) as WithContext<Article>

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Providers post={post}>
        <Header />

        <div className='mt-8 flex flex-col justify-between lg:flex-row'>
          <article className='w-full lg:w-[670px]'>
            <Mdx code={code} />
          </article>
          <aside className='lg:min-w-[270px] lg:max-w-[270px]'>
            <div className='sticky top-24 space-y-6'>
              {toc.length > 0 ? <TableOfContents toc={toc} /> : null}
              {flags.likeButton ? <LikeButton slug={slug} /> : null}
            </div>
          </aside>
        </div>
        <ProgressBar />

        {toc.length > 0 ? <MobileTableOfContents toc={toc} /> : null}
        <Footer />

        {recommended_posts.length > 0 ? (
          <Recommendations
            recommendations={recommended_posts}
            className='mt-10'
          />
        ) : null}
      </Providers>

      {flags.comment ? (
        <Suspense>
          <Comments slug={slug} />
        </Suspense>
      ) : null}
    </>
  )
}

export default Page
