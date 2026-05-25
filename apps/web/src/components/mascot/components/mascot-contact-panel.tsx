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
    <div className='bg-bg-elevated text-text-primary shadow-feature-card w-60 rounded-lg border border-[var(--border-subtle)] p-3 text-xs sm:w-64 sm:p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='font-medium'>{t('mascot.contact.title')}</h3>
        <button
          type='button'
          aria-label={t('mascot.contact.close')}
          className='text-text-secondary hover:bg-bg-hover hover:text-text-primary rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
          onClick={() => updateState({ showContact: false, showBubble: false })}
        >
          <XIcon className='h-4 w-4' />
        </button>
      </div>

      <div className='space-y-3'>
        <p className='text-sm'>{t('mascot.contact.description')}</p>
        <div className='flex items-center gap-2'>
          <code className='bg-bg-surface flex-1 rounded px-2 py-1 text-xs'>me@yuricunha.com</code>
          <button
            type='button'
            aria-label={t('mascot.contact.copy')}
            className='text-text-secondary hover:bg-bg-hover hover:text-text-primary rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
            onClick={copyEmail}
          >
            <CopyIcon className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  )
}
