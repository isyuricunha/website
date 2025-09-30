import { TranslationManager } from '@/components/admin/translation-manager'

type Props = {
  params: Promise<{
    locale: string
  }>
}

export default async function TranslatePage(props: Props) {
  const { locale } = await props.params
  
  return <TranslationManager locale={locale} />
}
