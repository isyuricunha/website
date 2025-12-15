import type { Metadata, ResolvingMetadata } from 'next'
import type { WebPage, WithContext } from 'schema-dts'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import { allPages } from 'content-collections'
import { notFound } from 'next/navigation'

import Mdx from '@/components/mdx'
import PageTitle from '@/components/page-title'
import { SITE_URL } from '@/lib/constants'
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
    const t = await getTranslations({ locale, namespace: 'now' })
    const title = t('title')
    const description = t('description')
    const alternates = build_alternates({ slug: '/now', locale })
    const fullUrl = `${SITE_URL}${alternates.canonical}`

    return {
        title,
        description,
        alternates: {
            canonical: alternates.canonical,
            languages: alternates.languages
        },
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
    const title = t('now.title')
    const description = t('now.description')
    const url = `${SITE_URL}${getLocalizedPath({ slug: '/now', locale })}`
    const page = allPages.find((p) => p.slug === 'now' && p.locale === locale)

    const jsonLd: WithContext<WebPage> = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url,
        isPartOf: {
            '@type': 'WebSite',
            name: t('metadata.site-title'),
            url: SITE_URL
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
            <Mdx code={code} />
        </>
    )
}

export default Page
