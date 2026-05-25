import { useTranslations } from '@isyuricunha/i18n/client'
import { Card } from '@isyuricunha/ui'
import { MessageCircleIcon, PinIcon } from 'lucide-react'

const Pinned = () => {
  const t = useTranslations()

  return (
    <Card className='relative overflow-hidden'>
      <div className='absolute top-4 right-4'>
        <PinIcon className='text-muted-foreground/50 size-5 rotate-45' />
      </div>

      <div className='relative p-6'>
        <div className='flex items-start gap-4'>
          <div className='hidden size-10 shrink-0 items-center justify-center rounded-md bg-[var(--accent-dim)] sm:flex'>
            <MessageCircleIcon className='text-accent-earth-text size-5' />
          </div>
          <div className='space-y-4'>
            <h2 className='text-foreground text-xl font-medium'>
              {t('guestbook.pinned.greeting')}
            </h2>
            <p className='text-muted-foreground'>{t('guestbook.pinned.description')}</p>
          </div>
        </div>
      </div>

      <div className='h-px w-full bg-[var(--accent-border)]' />
    </Card>
  )
}

export default Pinned
