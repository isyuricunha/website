import type { Metadata, ResolvingMetadata } from 'next'
import type { WebPage, WithContext } from 'schema-dts'

import { i18n } from '@tszhong0411/i18n/config'
import { getTranslations, setRequestLocale } from '@tszhong0411/i18n/server'

import NowListeningSection from '@/components/spotify/now-listening-section'
import RecentlyPlayedSection from '@/components/spotify/recently-played-section'
import TopArtistsSection from '@/components/spotify/top-artists-section'
import TopSongsSection from '@/components/spotify/top-songs-section'
import DebugImages from '@/components/spotify/debug-images'
import ImageTest from '@/components/spotify/image-test'
import PageTitle from '@/components/page-title'
import {
  SITE_NAME,
  SITE_URL
} from '@/lib/constants'
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
  const t = await getTranslations({ locale, namespace: 'spotify' })
  const title = t('title')
  const description = t('description')
  const url = getLocalizedPath({ slug: '/spotify', locale })

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

const Page = async (props: PageProps) => {
  const { locale } = await props.params
  setRequestLocale(locale)
  const t = await getTranslations()
  const title = t('spotify.title')
  const description = t('spotify.description')
  const url = `${SITE_URL}${getLocalizedPath({ slug: '/spotify', locale })}`

  const jsonLd: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    mainEntity: {
      '@type': 'Person',
      name: SITE_NAME,
      description: t('metadata.site-description'),
      url: SITE_URL
    }
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTitle title={title} description={description} />

                   <div className='space-y-12'>
               <DebugImages />
               <ImageTest />
               <NowListeningSection />
               <TopArtistsSection />
               <TopSongsSection />
               <RecentlyPlayedSection />
             </div>
    </>
  )
}

export default Page
