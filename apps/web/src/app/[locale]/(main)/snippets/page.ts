import { i18n } from '@isyuricunha/i18n/config'
import { permanentRedirect } from 'next/navigation'
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

const Page = async (props: PageProps) => {
    const { locale } = await props.params

    permanentRedirect(getLocalizedPath({ slug: '/snippet', locale }))
}

export default Page
