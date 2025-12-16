import type { Metadata, ResolvingMetadata } from 'next'
import type { Article, WithContext } from 'schema-dts'

import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import { allSnippets } from 'content-collections'
import { notFound } from 'next/navigation'

import Mdx from '@/components/mdx'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { generateSEO } from '@/lib/seo'
import { getLocalizedPath } from '@/utils/get-localized-path'

import MobileTableOfContents from './mobile-table-of-contents'
import ProgressBar from './progress-bar'
import TableOfContents from './table-of-contents'

type PageProps = {
    params: Promise<{
        slug: string
        locale: string
    }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateStaticParams = (): Array<{ slug: string; locale: string }> => {
    return allSnippets.map((snippet) => ({
        slug: snippet.slug,
        locale: snippet.locale
    }))
}

export const generateMetadata = async (
    props: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> => {
    const { slug, locale } = await props.params

    const snippet = allSnippets.find((s) => s.slug === slug && s.locale === locale)

    if (!snippet) return {}

    const previousTwitter = (await parent).twitter ?? {}
    const previousOpenGraph = (await parent).openGraph ?? {}

    const alternateLocales = Array.from(
        new Set(allSnippets.filter((s) => s.slug === slug && s.locale !== locale).map((s) => s.locale))
    )

    // Precompute safe values to avoid passing undefined to encodeURIComponent
    const safeTitle = snippet.title ?? ''
    const safeDescription = snippet.description ?? ''
    const safeLocale = locale ?? ''
    const safeDate = snippet.date?.split('T')[0] ?? new Date().toISOString().split('T')[0] ?? ''

    const ogImageUrl = `/og/${slug}?title=${encodeURIComponent(safeTitle)}&date=${encodeURIComponent(
        safeDate
    )}&summary=${encodeURIComponent(safeDescription)}&locale=${safeLocale}&type=snippet`

    const url = getLocalizedPath({ slug: `/snippet/${slug}`, locale })

    const seo = generateSEO({
        title: snippet.title,
        description: snippet.description,
        url,
        image: ogImageUrl,
        type: 'article',
        publishedTime: snippet.date,
        authors: [snippet.author ?? SITE_NAME],
        tags: snippet.tags,
        locale,
        alternateLocales
    })

    return {
        ...seo,
        openGraph: {
            ...previousOpenGraph,
            ...seo.openGraph,
            url: seo.openGraph?.url
        },
        twitter: {
            ...previousTwitter,
            ...seo.twitter
        }
    }
}

const Page = async (props: PageProps) => {
    const { slug, locale } = await props.params
    setRequestLocale(locale)
    const t = await getTranslations({ locale, namespace: 'snippets' })

    const snippet = allSnippets.find((s) => s.slug === slug && s.locale === locale)

    if (!snippet) {
        notFound()
    }

    const dateFormatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    })

    const jsonLd: WithContext<Article> = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: snippet.title,
        description: snippet.description,
        datePublished: snippet.date,
        author: {
            '@type': 'Person',
            name: snippet.author ?? SITE_NAME,
            url: SITE_URL
        },
        publisher: {
            '@type': 'Person',
            name: SITE_NAME,
            url: SITE_URL
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_URL}${getLocalizedPath({ slug: `/snippet/${slug}`, locale })}`
        }
    }

    return (
        <>
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className='mx-auto max-w-3xl'>
                <header className='space-y-4 py-12'>
                    <h1 className='text-2xl font-bold sm:text-3xl md:text-4xl'>{snippet.title}</h1>
                    <div className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 text-sm'>
                        <div>{dateFormatter.format(new Date(snippet.date))}</div>
                        {snippet.readingTime ? <div>{t('min-read', { minutes: snippet.readingTime })}</div> : null}
                        {snippet.author ? <div>{snippet.author}</div> : null}
                    </div>
                    <p className='text-muted-foreground text-sm sm:text-base'>{snippet.description}</p>
                </header>

                <div className='mt-8 flex flex-col justify-between lg:flex-row'>
                    <article className='w-full lg:w-[670px]'>
                        <Mdx code={snippet.code} />
                    </article>
                    <aside className='lg:min-w-[270px] lg:max-w-[270px]'>
                        <div className='sticky top-24 space-y-6'>
                            {snippet.toc.length > 0 ? <TableOfContents toc={snippet.toc} /> : null}
                        </div>
                    </aside>
                </div>

                <ProgressBar />
                {snippet.toc.length > 0 ? <MobileTableOfContents toc={snippet.toc} /> : null}
            </div>
        </>
    )
}

export default Page
