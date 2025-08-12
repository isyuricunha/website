import { Metadata } from 'next'
import { getTranslations } from '@tszhong0411/i18n/server'
import { CodePen } from '@/components/pen/code-pen'

type PenPageProps = {
  params: Promise<{
    locale: string
  }>
}

export const generateMetadata = async (props: PenPageProps): Promise<Metadata> => {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'pen' })

  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function PenPage(props: PenPageProps) {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'pen' })

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold mb-4'>{t('title')}</h1>
        <p className='text-lg text-muted-foreground'>
          {t('description')}
        </p>
      </div>

      <CodePen />
    </div>
  )
}
