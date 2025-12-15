import type { Metadata, ResolvingMetadata } from 'next'
import type { Blog, WithContext } from 'schema-dts'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import { allPosts } from 'content-collections'

import FilteredPosts from '@/components/filtered-posts'
import PageTitle from '@/components/page-title'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { build_alternates } from '@/lib/seo'
import { getLocalizedPath } from '@/utils/get-localized-path'

type PageProps = {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
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
  const t = await getTranslations({ locale, namespace: 'blog' })
  const title = t('title')
  const description = t('description')
  const alternates = build_alternates({ slug: '/blog', locale })
  const fullUrl = `${SITE_URL}${alternates.canonical}`

  return {
    title,
    description,
    alternates,
    openGraph: {
      ...previousOpenGraph,
      url: fullUrl,
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

const Page = async (props: PageProps) => {
  const { locale } = await props.params
  setRequestLocale(locale)
  const t = await getTranslations('blog')
  const title = t('title')
  const description = t('description')
  const url = `${SITE_URL}${getLocalizedPath({ slug: '/blog', locale })}`

  const posts = allPosts
    .toSorted((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .filter((post) => post.locale === locale)

  const jsonLd: WithContext<Blog> = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': url,
    name: title,
    description,
    url,
    author: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${SITE_URL}${getLocalizedPath({ slug: `/blog/${post.slug}`, locale })}`,
      datePublished: post.date,
      dateModified: post.modifiedTime
    }))
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTitle title={title} description={description} />
      <FilteredPosts posts={posts} />
    </>
  )
}

export default Page
