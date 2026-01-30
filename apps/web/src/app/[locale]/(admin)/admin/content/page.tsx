import { redirect } from '@isyuricunha/i18n/routing'

type Props = {
  params: Promise<{
    locale: string
  }>
}

const ContentPage = async (props: Props) => {
  const { locale } = await props.params

  redirect({ href: '/admin', locale })
}

export default ContentPage
