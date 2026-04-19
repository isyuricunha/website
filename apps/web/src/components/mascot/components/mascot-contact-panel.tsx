'use client'

import { X as XIcon, Copy as CopyIcon } from 'lucide-react'
import { UseMascotStateReturn } from '../hooks/use-mascot-state'

type MascotContactPanelProps = {
  mascot: Pick<UseMascotStateReturn, 'state' | 't' | 'copyEmail' | 'updateState'>
}

export function MascotContactPanel({ mascot }: MascotContactPanelProps) {
  const { state, t, copyEmail, updateState } = mascot

  if (!state.showContact) return null

  return (
    <div
      className={`border-border/20 bg-popover/95 text-popover-foreground shadow-primary/10 w-60 rounded-3xl border-2 p-3 text-xs shadow-2xl backdrop-blur-md sm:w-64 sm:p-4`}
    >
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='font-medium'>{t('mascot.contact.title')}</h3>
        <button
          type='button'
          aria-label={t('mascot.contact.close')}
          className='text-muted-foreground hover:bg-muted/80 hover:text-foreground focus-visible:ring-primary/50 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:outline-none'
          onClick={() => updateState({ showContact: false, showBubble: false })}
        >
          <XIcon className='h-4 w-4' />
        </button>
      </div>

      <div className='space-y-3'>
        <p className='text-sm'>{t('mascot.contact.description')}</p>
        <div className='flex items-center gap-2'>
          <code className='bg-muted flex-1 rounded px-2 py-1 text-xs'>me@yuricunha.com</code>
          <button
            type='button'
            aria-label={t('mascot.contact.copy')}
            className='text-muted-foreground hover:bg-muted/80 hover:text-foreground focus-visible:ring-primary/50 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:outline-none'
            onClick={copyEmail}
          >
            <CopyIcon className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  )
}
