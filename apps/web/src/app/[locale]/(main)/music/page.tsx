import type { Metadata, ResolvingMetadata } from 'next'
import type { WebPage, WithContext } from 'schema-dts'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'

import NowListeningSection from '@/components/music/now-listening-section'
import RecentlyPlayedSection from '@/components/music/recently-played-section'
import TopArtistsSection from '@/components/music/top-artists-section'
import TopSongsSection from '@/components/music/top-songs-section'
import MusicStatsSection from '@/components/music/music-stats-section'
import MusicTimeline from '@/components/music/music-timeline'
import ListeningHeatmap from '@/components/music/listening-heatmap'
import LocalHistoryImport from '@/components/music/local-history-import'
import SocialSharing from '@/components/music/social-sharing'
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
  const t = await getTranslations({ locale, namespace: 'spotify' })
  const title = t('title')
  const description = t('description')
  const alternates = build_alternates({ slug: '/music', locale })
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

const Page = async (props: PageProps) => {
  const { locale } = await props.params
  setRequestLocale(locale)
  const t = await getTranslations()
  const title = t('spotify.title')
  const description = t('spotify.description')
  const url = `${SITE_URL}${getLocalizedPath({ slug: '/music', locale })}`

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

      <div className='space-y-8'>
        <NowListeningSection />

        <MusicStatsSection />

        <div className='grid grid-cols-1 gap-8'>
          <SocialSharing />
        </div>


        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <TopArtistsSection />
          <TopSongsSection />
        </div>

        <div className='grid grid-cols-1 gap-8'>
          <ListeningHeatmap />
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <RecentlyPlayedSection />
          <MusicTimeline />
        </div>

        <LocalHistoryImport />
      </div>
    </>
  )
}

export default Page
