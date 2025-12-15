import type { Metadata, ResolvingMetadata } from 'next'
import type { SoftwareApplication, WithContext } from 'schema-dts'

import { setRequestLocale } from '@isyuricunha/i18n/server'
import { allProjects } from 'content-collections'
import { notFound } from 'next/navigation'

import Mdx from '@/components/mdx'
import { ProjectCoverImage } from '@/components/ui/optimized-image'
import { SITE_URL } from '@/lib/constants'
import { build_alternates, generateProjectJsonLd } from '@/lib/seo'

import Header from './header'

type PageProps = {
  params: Promise<{
    slug: string
    locale: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateStaticParams = (): Array<{ slug: string; locale: string }> => {
  return allProjects.map((project) => ({
    slug: project.slug,
    locale: project.locale
  }))
}

export const generateMetadata = async (
  props: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const { slug, locale } = await props.params

  const project = allProjects.find((p) => p.slug === slug && p.locale === locale)

  if (!project) {
    return {}
  }

  const { name, description } = project
  const previousTwitter = (await parent).twitter ?? {}
  const previousOpenGraph = (await parent).openGraph ?? {}
  const alternateLocales = Array.from(
    new Set(allProjects.filter((p) => p.slug === slug && p.locale !== locale).map((p) => p.locale))
  )

  const alternates = build_alternates({
    slug: `/projects/${slug}`,
    locale,
    locales: [locale, ...alternateLocales]
  })
  const fullUrl = `${SITE_URL}${alternates.canonical}`

  return {
    title: name,
    description: description,
    alternates,
    openGraph: {
      ...previousOpenGraph,
      url: fullUrl,
      title: name,
      description: description,
      images: [
        {
          url: `/images/projects/${slug}/cover.png`,
          width: 1280,
          height: 832,
          alt: description,
          type: 'image/png'
        }
      ]
    },
    twitter: {
      ...previousTwitter,
      title: name,
      description: description,
      images: [
        {
          url: `/images/projects/${slug}/cover.png`,
          width: 1280,
          height: 832,
          alt: description
        }
      ]
    }
  }
}

const Page = async (props: PageProps) => {
  const { slug, locale } = await props.params
  setRequestLocale(locale)

  const project = allProjects.find((p) => p.slug === slug && p.locale === locale)

  if (!project) {
    notFound()
  }

  const { name, code, description, github } = project

  const jsonLd = generateProjectJsonLd({
    name,
    description,
    slug,
    repository: github
  }) as WithContext<SoftwareApplication>

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className='mx-auto max-w-3xl'>
        <Header {...project} />
        <div className='my-12'>
          <ProjectCoverImage slug={slug} name={name} priority />
        </div>
        <Mdx code={code} />
      </div>
    </>
  )
}

export default Page
