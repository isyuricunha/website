import { redirect } from '@isyuricunha/i18n/routing'

type Props = {
  params: Promise<{
    locale: string
  }>
}

const ConfigurationPage = async (props: Props) => {
  const { locale } = await props.params

  redirect({ href: '/admin', locale })
}

export default ConfigurationPage
