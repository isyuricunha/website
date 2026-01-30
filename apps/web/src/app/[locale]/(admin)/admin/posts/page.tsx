import { redirect } from '@isyuricunha/i18n/routing'

type Props = {
  params: Promise<{
    locale: string
  }>
}

export default async function PostsPage(props: Props) {
  const { locale } = await props.params

  redirect({ href: '/admin', locale })
}
