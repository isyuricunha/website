import type { Metadata, ResolvingMetadata } from 'next'
import type { CollectionPage, WithContext } from 'schema-dts'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import { allSnippets } from 'content-collections'

import Link from '@/components/link'
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

    const t = await getTranslations({ locale, namespace: 'snippets' })
    const title = t('title')
    const description = t('description')
    const alternates = build_alternates({ slug: '/snippet', locale })
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

    const t = await getTranslations({ locale, namespace: 'snippets' })
    const title = t('title')
    const description = t('description')
    const url = `${SITE_URL}${getLocalizedPath({ slug: '/snippet', locale })}`

    const snippets = allSnippets
        .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .filter((snippet) => snippet.locale === locale)

    const dateFormatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    })

    const jsonLd: WithContext<CollectionPage> = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': url,
        name: title,
        description,
        url,
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL
        },
        hasPart: snippets.map((snippet) => ({
            '@type': 'Article',
            headline: snippet.title,
            description: snippet.description,
            url: `${SITE_URL}${getLocalizedPath({ slug: `/snippet/${snippet.slug}`, locale })}`,
            datePublished: snippet.date
        }))
    }

    return (
        <>
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <PageTitle title={title} description={description} />

            {snippets.length === 0 ? (
                <div className='text-muted-foreground px-4 text-sm sm:px-0'>{t('empty')}</div>
            ) : (
                <div className='grid gap-4 px-4 sm:px-0 md:grid-cols-2'>
                    {snippets.map((snippet) => (
                        <Link
                            key={`${snippet.locale}:${snippet.slug}`}
                            href={`/snippet/${snippet.slug}`}
                            className='shadow-feature-card hover:bg-accent/40 block rounded-2xl border p-4 transition-colors'
                        >
                            <div className='mb-2 flex items-center justify-between gap-2 text-xs text-zinc-500'>
                                <div>{dateFormatter.format(new Date(snippet.date))}</div>
                                {snippet.readingTime ? (
                                    <div>{t('min-read', { minutes: snippet.readingTime })}</div>
                                ) : null}
                            </div>
                            <h3 className='mb-1 text-sm font-medium'>{snippet.title}</h3>
                            <p className='text-muted-foreground line-clamp-2 text-xs'>{snippet.description}</p>
                            {snippet.tags.length > 0 ? (
                                <div className='text-muted-foreground mt-3 text-xs'>{snippet.tags.slice(0, 4).join(', ')}</div>
                            ) : null}
                        </Link>
                    ))}
                </div>
            )}
        </>
    )
}

export default Page
