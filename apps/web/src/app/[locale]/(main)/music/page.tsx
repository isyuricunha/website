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

      <div className='space-y-20'>
        <section className='grid gap-8 lg:grid-cols-[1.25fr_0.85fr] lg:items-start'>
          <div className='cursor-reveal'>
            <NowListeningSection />
          </div>
          <div className='cursor-reveal cursor-reveal-delay-1'>
            <MusicStatsSection />
          </div>
        </section>

        <section className='grid gap-8 border-t-[0.5px] border-[var(--border-faint)] pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-start'>
          <div className='space-y-3'>
            <span className='label-mono'>{t('spotify.sections.listening-data.label')}</span>
            <h2 className='max-w-lg text-[clamp(28px,3vw,40px)] font-medium tracking-tighter'>
              {t('spotify.sections.listening-data.title')}
            </h2>
          </div>
          <div className='cursor-reveal cursor-reveal-delay-1'>
            <ListeningHeatmap />
          </div>
        </section>

        <section className='grid gap-8 border-t-[0.5px] border-[var(--border-faint)] pt-20 lg:grid-cols-2'>
          <div className='cursor-reveal'>
            <TopArtistsSection />
          </div>
          <div className='cursor-reveal cursor-reveal-delay-1'>
            <TopSongsSection />
          </div>
        </section>

        <section className='grid gap-8 border-t-[0.5px] border-[var(--border-faint)] pt-20 lg:grid-cols-[0.95fr_1.05fr]'>
          <div className='cursor-reveal'>
            <RecentlyPlayedSection />
          </div>
          <div className='cursor-reveal cursor-reveal-delay-1'>
            <MusicTimeline />
          </div>
        </section>

        <section className='grid gap-8 border-t-[0.5px] border-[var(--border-faint)] pt-20'>
          <div className='cursor-reveal'>
            <SocialSharing />
          </div>
          <LocalHistoryImport />
        </section>
      </div>
    </>
  )
}

export default Page
