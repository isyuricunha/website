import type { Metadata } from 'next'

import { i18n } from '@isyuricunha/i18n/config'
import { setRequestLocale } from '@isyuricunha/i18n/server'

import AboutMe from '@/components/home/about-me'
import GetInTouch from '@/components/home/get-in-touch'
import Hero from '@/components/home/hero'
import LatestArticles from '@/components/home/latest-articles'
import SelectedProjects from '@/components/home/selected-projects'
import AnnouncementBanner from '@/components/announcement-banner'
import RecentlyUpdated from '@/components/recently-updated'
import NewsletterSignup from '@/components/newsletter-signup'
import { build_alternates } from '@/lib/seo'

type PageProps = {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateStaticParams = (): Array<{ locale: string }> => {
  return i18n.locales.map((locale) => ({ locale }))
}

export const generateMetadata = async (props: PageProps): Promise<Metadata> => {
  const { locale } = await props.params

  return {
    alternates: build_alternates({ slug: '', locale })
  }
}

const Page = async (props: PageProps) => {
  const { locale } = await props.params
  setRequestLocale(locale)

  return (
    <>
      <div className='mb-6'>
        <AnnouncementBanner />
      </div>
      <Hero />
      <SelectedProjects />
      <AboutMe />
      <LatestArticles />

      <div className='mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <RecentlyUpdated />
        <NewsletterSignup />
      </div>

      <GetInTouch />
    </>
  )
}

export default Page
