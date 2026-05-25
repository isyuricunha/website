'use client'

import { X as XIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@isyuricunha/ui'
import { UseMascotStateReturn, MascotPreferences } from '../hooks/use-mascot-state'

type MascotSettingsPanelProps = {
  mascot: Pick<UseMascotStateReturn, 'state' | 't' | 'updatePreferences' | 'updateState'>
}

export function MascotSettingsPanel({ mascot }: MascotSettingsPanelProps) {
  const { state, t, updatePreferences, updateState } = mascot

  if (!state.showSettings) return null

  return (
    <div className='bg-bg-elevated text-text-primary shadow-feature-card w-60 rounded-lg border border-[var(--border-subtle)] p-3 text-xs sm:w-64 sm:p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='font-medium'>{t('mascot.settings.title')}</h3>
        <button
          type='button'
          aria-label={t('mascot.settings.close')}
          className='text-text-secondary hover:bg-bg-hover hover:text-text-primary rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
          onClick={() => updateState({ showSettings: false, showBubble: false })}
        >
          <XIcon className='h-4 w-4' />
        </button>
      </div>

      <div className='space-y-3'>
        <label className='flex items-center justify-between'>
          <span>{t('mascot.settings.animations')}</span>
          <input
            type='checkbox'
            checked={state.preferences.animations}
            onChange={(e) => updatePreferences({ animations: e.target.checked })}
            className='bg-bg-base text-text-primary rounded border-[var(--border-default)] accent-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2'
          />
        </label>

        <label className='flex items-center justify-between'>
          <span>{t('mascot.settings.speechBubbles')}</span>
          <input
            type='checkbox'
            checked={state.preferences.speechBubbles}
            onChange={(e) => updatePreferences({ speechBubbles: e.target.checked })}
            className='bg-bg-base text-text-primary rounded border-[var(--border-default)] accent-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2'
          />
        </label>

        <label className='flex items-center justify-between'>
          <span>{t('mascot.settings.soundEffects')}</span>
          <input
            type='checkbox'
            checked={state.preferences.soundEffects}
            onChange={(e) => updatePreferences({ soundEffects: e.target.checked })}
            className='bg-bg-base text-text-primary rounded border-[var(--border-default)] accent-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2'
          />
        </label>

        <label className='flex items-center justify-between'>
          <span>{t('mascot.settings.messageDuration')}</span>
          <Select
            value={`${state.preferences.messageDuration}`}
            onValueChange={(value) =>
              updatePreferences({ messageDuration: Number.parseInt(value, 10) })
            }
          >
            <SelectTrigger className='bg-bg-surface text-text-primary cursor-pointer rounded-md border border-[var(--border-default)] px-3 py-2.5 text-xs transition-colors hover:border-[var(--border-strong)] focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2 focus:outline-none'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='3000'>3s</SelectItem>
              <SelectItem value='5000'>5s</SelectItem>
              <SelectItem value='7000'>7s</SelectItem>
              <SelectItem value='10000'>10s</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className='flex items-center justify-between'>
          <span>{t('mascot.settings.bubblePosition')}</span>
          <Select
            value={state.preferences.bubblePosition}
            onValueChange={(value) =>
              updatePreferences({
                bubblePosition: value as MascotPreferences['bubblePosition']
              })
            }
          >
            <SelectTrigger className='bg-bg-surface text-text-primary cursor-pointer rounded-md border border-[var(--border-default)] px-3 py-2.5 text-xs transition-colors hover:border-[var(--border-strong)] focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2 focus:outline-none'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='bottom-right'>
                {t('mascot.settings.positions.bottomRight')}
              </SelectItem>
              <SelectItem value='bottom-left'>
                {t('mascot.settings.positions.bottomLeft')}
              </SelectItem>
              <SelectItem value='top-right'>{t('mascot.settings.positions.topRight')}</SelectItem>
              <SelectItem value='top-left'>{t('mascot.settings.positions.topLeft')}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        {state.isKonamiMode && (
          <div className='border-t pt-2'>
            <p className='text-muted-foreground text-xs'>{t('mascot.easterEgg.retroMode')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
