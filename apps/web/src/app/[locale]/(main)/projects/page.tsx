import type { Metadata, ResolvingMetadata } from 'next'
import type { CollectionPage, WithContext } from 'schema-dts'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import { allProjects } from 'content-collections'
import { headers } from 'next/headers'

import GithubRepos from '@/components/github-repos'
import PageTitle from '@/components/page-title'
import ProjectCards from '@/components/project-cards'
import { SITE_URL } from '@/lib/constants'
import { build_alternates } from '@/lib/seo'
import { appRouter } from '@/trpc/root'
import { createTRPCContext } from '@/trpc/trpc'
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
  const t = await getTranslations({ locale, namespace: 'projects' })
  const title = t('title')
  const description = t('description')
  const alternates = build_alternates({ slug: '/projects', locale })
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
  const t = await getTranslations()
  const title = t('projects.title')
  const description = t('projects.description')
  const url = `${SITE_URL}${getLocalizedPath({ slug: '/projects', locale })}`

  const reqHeaders = await headers()
  const trpcContext = await createTRPCContext({ headers: reqHeaders as unknown as Headers })

  const caller = appRouter.createCaller(trpcContext)
  const repos = (await caller.github.getRepos()).map((repo) => ({
    ...repo,
    stargazersCount: repo.stargazersCount ?? 0
  }))
  const projects = allProjects.filter((project) => project.locale === locale)

  const jsonLd: WithContext<CollectionPage> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url,
    name: title,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: t('metadata.site-title'),
      url: SITE_URL
    },
    hasPart: allProjects.map((project) => ({
      '@type': 'SoftwareApplication',
      name: project.name,
      description: project.description,
      url: `${url}/${project.slug}`,
      applicationCategory: 'WebApplication'
    }))
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTitle title={title} description={description} />
      <ProjectCards projects={projects} />

      <section className='mt-12'>
        <h2 className='mb-6 text-lg font-semibold sm:text-xl'>{t('projects.all-repos')}</h2>
        {repos.length === 0 ? (
          <p className='text-muted-foreground text-sm sm:text-base'>{t('projects.repos.empty')}</p>
        ) : (
          <GithubRepos repos={repos} />
        )}
      </section>
    </>
  )
}

export default Page
