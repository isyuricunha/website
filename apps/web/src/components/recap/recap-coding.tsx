'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardHeader, CardTitle } from '@isyuricunha/yutheme'
import { CodeIcon } from 'lucide-react'

import { api } from '@/trpc/react'

const RecapCoding = () => {
  const t = useTranslations()
  const { data, isLoading, error } = api.wakatime.getStats.useQuery(undefined, {
    staleTime: 300_000
  })

  let body: React.ReactNode

  if (isLoading) {
    body = <p className='text-text-secondary text-sm'>{t('recap.loading')}</p>
  } else if (error || !data) {
    body = <p className='text-text-secondary text-sm'>{t('recap.no-data')}</p>
  } else {
    body = (
      <div className='grid min-w-0 gap-10 md:grid-cols-2'>
        <div className='space-y-8'>
          <div>
            <p className='text-text-secondary text-sm'>{t('recap.coding.total')}</p>
            <p className='text-4xl font-medium tracking-tighter'>
              {data.humanReadableTotal ?? '—'}
            </p>
          </div>
          <div>
            <p className='text-text-secondary text-sm'>{t('recap.coding.daily-average')}</p>
            <p className='text-2xl font-medium tracking-tighter'>
              {data.humanReadableDailyAverage}
            </p>
          </div>
          <div className='space-y-3'>
            <p className='text-text-secondary text-sm'>{t('recap.coding.top-projects')}</p>
            <ul className='space-y-2'>
              {data.projects.map((project) => (
                <li key={project.name} className='flex items-center justify-between gap-4 text-sm'>
                  <span className='truncate'>{project.name}</span>
                  <span className='text-text-secondary shrink-0 tabular-nums'>
                    {project.percent?.toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='min-w-0 space-y-3'>
          <p className='text-text-secondary text-sm'>{t('recap.coding.top-languages')}</p>
          <ul className='space-y-4'>
            {data.languages.map((language) => (
              <li key={language.name} className='space-y-1.5'>
                <div className='flex items-center justify-between gap-4 text-sm'>
                  <span className='truncate'>{language.name}</span>
                  <span className='text-text-secondary shrink-0 tabular-nums'>
                    {language.percent?.toFixed(1)}%
                  </span>
                </div>
                <div className='bg-bg-hover h-1.5 w-full overflow-hidden rounded-full'>
                  <div
                    className='bg-text-primary h-full rounded-full'
                    style={{ width: `${Math.min(language.percent ?? 0, 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex flex-wrap items-center gap-2'>
          <CodeIcon className='size-4' />
          {t('recap.coding.title')}
          <span className='text-text-secondary text-sm font-normal'>{t('recap.period')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  )
}

export default RecapCoding
