import { allSnippets } from 'content-collections'
import { permanentRedirect } from 'next/navigation'
import { getLocalizedPath } from '@/utils/get-localized-path'

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

const Page = async (props: PageProps) => {
    const { slug, locale } = await props.params

    permanentRedirect(getLocalizedPath({ slug: `/snippet/${slug}`, locale }))
}

export default Page
