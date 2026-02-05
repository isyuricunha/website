import type { Metadata, ResolvingMetadata } from 'next'
import type { ProfilePage, WithContext } from 'schema-dts'

import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import Image from 'next/image'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import PageTitle from '@/components/page-title'
import UserName from '@/components/user/user-name'
import { SITE_URL } from '@/lib/constants'
import { build_alternates } from '@/lib/seo'
import { appRouter } from '@/trpc/root'
import { createTRPCContext } from '@/trpc/trpc'
import { getLocalizedPath } from '@/utils/get-localized-path'

import UserComments from './user-comments'

type PageProps = {
    params: Promise<{
        locale: string
        handle: string
    }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

const get_caller = async () => {
    const req_headers = await headers()
    const trpc_context = await createTRPCContext({ headers: req_headers as unknown as Headers })
    return appRouter.createCaller(trpc_context)
}

export const generateMetadata = async (
    props: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> => {
    const { locale, handle } = await props.params
    const previousOpenGraph = (await parent).openGraph ?? {}
    const previousTwitter = (await parent).twitter ?? {}
    const t = await getTranslations({ locale })

    const alternates = build_alternates({ slug: `/u/${handle}`, locale })
    const fullUrl = `${SITE_URL}${alternates.canonical}`

    try {
        const caller = await get_caller()
        const profile = await caller.users.getPublicProfile({ handle })

        const avatarUrl = profile.image.startsWith('http')
            ? profile.image
            : `${SITE_URL}${profile.image}`

        const title = t('profile.title', {
            name: profile.name
        })

        const description = profile.bio ?? t('profile.description')

        return {
            title,
            description,
            alternates,
            openGraph: {
                ...previousOpenGraph,
                url: fullUrl,
                type: 'profile',
                title,
                description,
                images: [
                    {
                        url: avatarUrl,
                        alt: profile.name
                    }
                ]
            },
            twitter: {
                ...previousTwitter,
                title,
                description,
                images: [avatarUrl]
            }
        }
    } catch {
        const title = t('profile.not-found.title')
        const description = t('profile.not-found.description')

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
}

const Page = async (props: PageProps) => {
    const { locale, handle } = await props.params
    setRequestLocale(locale)

    const caller = await get_caller()

    let profile: Awaited<ReturnType<typeof caller.users.getPublicProfile>>
    try {
        profile = await caller.users.getPublicProfile({ handle })
    } catch {
        notFound()
    }

    const t = await getTranslations()

    const title = profile.name
    const description = profile.bio ?? t('profile.description')
    const url = `${SITE_URL}${getLocalizedPath({ slug: `/u/${handle}`, locale })}`

    const jsonLd: WithContext<ProfilePage> = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        name: title,
        description,
        url,
        mainEntity: {
            '@type': 'Person',
            name: profile.name,
            url
        }
    }

    return (
        <>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className='mb-10'>
                <PageTitle title={title} description={description} />
                <div className='mx-auto max-w-3xl space-y-6'>
                    <div className='flex items-start justify-between gap-6'>
                        <div className='flex min-w-0 items-start gap-6'>
                            <Image
                                src={profile.image}
                                alt={profile.name}
                                width={80}
                                height={80}
                                className='size-20 shrink-0 rounded-full'
                            />
                            <div className='min-w-0'>
                                <div className='text-2xl font-bold'>
                                    <UserName
                                        name={profile.name}
                                        color={profile.nameColor}
                                        effect={profile.nameEffect}
                                    />
                                </div>
                                <div className='text-muted-foreground mt-1 text-sm'>
                                    @{profile.username ?? profile.id}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mx-auto max-w-3xl'>
                <UserComments handle={handle} />
            </div>
        </>
    )
}

export default Page
