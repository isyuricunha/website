import type { Metadata, ResolvingMetadata } from 'next'
import type { AboutPage, WithContext } from 'schema-dts'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import { allPages } from 'content-collections'
import { notFound } from 'next/navigation'

import Mdx from '@/components/mdx'
import PageTitle from '@/components/page-title'
import { SITE_GITHUB_URL, SITE_NAME, SITE_URL, SITE_X_URL } from '@/lib/constants'
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
  const t = await getTranslations({ locale, namespace: 'about' })
  const title = t('title')
  const description = t('description')
  const alternates = build_alternates({ slug: '/about', locale })
  const fullUrl = `${SITE_URL}${alternates.canonical}`

  return {
    title,
    description,
    alternates,
    openGraph: {
      ...previousOpenGraph,
      url: fullUrl,
      type: 'profile',
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
  const t = await getTranslations()
  const title = t('about.title')
  const description = t('about.description')
  const url = `${SITE_URL}${getLocalizedPath({ slug: '/about', locale })}`
  const page = allPages.find((p) => p.slug === 'about' && p.locale === locale)

  const jsonLd: WithContext<AboutPage> = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: title,
    description,
    url,
    mainEntity: {
      '@type': 'Person',
      name: SITE_NAME,
      description: t('metadata.site-description'),
      url: SITE_URL,
      sameAs: [SITE_X_URL, SITE_GITHUB_URL]
    }
  }

  if (!page) {
    return notFound()
  }

  const { code } = page

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTitle title={title} description={description} />
      <section className='grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20'>
        <aside className='border-t-[0.5px] border-[var(--border-faint)] pt-6 lg:sticky lg:top-28 lg:self-start'>
          <span className='label-mono'>{title}</span>
          <p className='text-text-secondary mt-4 text-[15px] leading-relaxed'>{description}</p>
        </aside>
        <article className='cursor-reveal min-w-0'>
          <Mdx code={code} />
        </article>
      </section>
    </>
  )
}

export default Page
