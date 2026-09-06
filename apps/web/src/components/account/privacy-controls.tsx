'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Button, Input, Label, buttonVariants, toast } from '@isyuricunha/ui'
import { DownloadIcon, ShieldCheckIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

import { deleteUser } from '@/lib/auth-client'

type PrivacyControlsProps = {
  email: string
  canDelete: boolean
}

const PrivacyControls = ({ email, canDelete }: PrivacyControlsProps) => {
  const t = useTranslations('settings.privacy')
  const [confirmation, setConfirmation] = useState('')
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false)
  const [deletionRequested, setDeletionRequested] = useState(false)

  const requestDeletion = async () => {
    if (confirmation !== email || isRequestingDeletion) return

    setIsRequestingDeletion(true)
    const { error } = await deleteUser({ callbackURL: '/' })
    setIsRequestingDeletion(false)

    if (error) {
      toast.error(t('delete-error'))
      return
    }

    setDeletionRequested(true)
    setConfirmation('')
    toast.success(t('delete-sent'))
  }

  return (
    <section className='space-y-6 border-t pt-8' aria-labelledby='privacy-data-heading'>
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <ShieldCheckIcon aria-hidden='true' className='size-5' />
          <h2 id='privacy-data-heading' className='text-lg font-semibold'>
            {t('title')}
          </h2>
        </div>
        <p className='text-muted-foreground text-sm'>{t('description')}</p>
      </div>

      <div className='space-y-3 rounded-lg border p-4'>
        <div className='space-y-1'>
          <h3 className='font-medium'>{t('export-title')}</h3>
          <p className='text-muted-foreground text-sm'>{t('export-description')}</p>
        </div>
        <a
          href='/api/account/data-export'
          download
          className={buttonVariants({ variant: 'outline' })}
        >
          <DownloadIcon aria-hidden='true' className='size-4' />
          {t('download')}
        </a>
      </div>

      <div className='border-destructive/40 space-y-4 rounded-lg border p-4'>
        <div className='space-y-1'>
          <h3 className='font-medium'>{t('delete-title')}</h3>
          <p className='text-muted-foreground text-sm'>{t('delete-description')}</p>
        </div>

        {canDelete ? (
          <>
            <div className='space-y-2'>
              <Label htmlFor='account-deletion-confirmation'>{t('confirm-label')}</Label>
              <Input
                id='account-deletion-confirmation'
                type='email'
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete='off'
                spellCheck={false}
                disabled={isRequestingDeletion || deletionRequested}
              />
            </div>
            <Button
              type='button'
              variant='destructive'
              disabled={confirmation !== email || isRequestingDeletion || deletionRequested}
              onClick={requestDeletion}
            >
              <Trash2Icon aria-hidden='true' className='size-4' />
              {t(isRequestingDeletion ? 'delete-pending' : 'delete-action')}
            </Button>
            {deletionRequested ? (
              <p className='text-muted-foreground text-sm' role='status'>
                {t('delete-sent')}
              </p>
            ) : null}
          </>
        ) : (
          <p className='text-muted-foreground text-sm'>{t('delete-unavailable')}</p>
        )}
      </div>
    </section>
  )
}

export default PrivacyControls
