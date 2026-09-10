import type { Metadata, ResolvingMetadata } from 'next'
import type { WebPage, WithContext } from 'schema-dts'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'

import PageTitle from '@/components/page-title'
import RecapCoding from '@/components/recap/recap-coding'
import RecapContent from '@/components/recap/recap-content'
import RecapListening from '@/components/recap/recap-listening'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { build_alternates } from '@/lib/seo'
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
  const t = await getTranslations({ locale, namespace: 'recap' })
  const title = t('title')
  const description = t('description')
  const alternates = build_alternates({ slug: '/recap', locale })
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
  const title = t('recap.title')
  const description = t('recap.description')
  const url = `${SITE_URL}${getLocalizedPath({ slug: '/recap', locale })}`

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
        <section className='cursor-reveal'>
          <RecapCoding />
        </section>

        <section className='border-t-[0.5px] border-[var(--border-faint)] pt-20'>
          <RecapListening />
        </section>

        <section className='border-t-[0.5px] border-[var(--border-faint)] pt-20'>
          <RecapContent />
        </section>
      </div>
    </>
  )
}

export default Page
