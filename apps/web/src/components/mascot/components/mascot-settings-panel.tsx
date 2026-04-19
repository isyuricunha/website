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
    <div
      className={`border-border/20 bg-popover/95 text-popover-foreground shadow-primary/10 w-60 rounded-3xl border-2 p-3 text-xs shadow-2xl backdrop-blur-md sm:w-64 sm:p-4`}
    >
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='font-medium'>{t('mascot.settings.title')}</h3>
        <button
          type='button'
          aria-label={t('mascot.settings.close')}
          className='text-muted-foreground hover:bg-muted/80 hover:text-foreground focus-visible:ring-primary/50 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:outline-none'
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
            className='border-input bg-background text-foreground accent-primary focus:ring-ring rounded focus:ring-2 focus:ring-offset-2'
          />
        </label>

        <label className='flex items-center justify-between'>
          <span>{t('mascot.settings.speechBubbles')}</span>
          <input
            type='checkbox'
            checked={state.preferences.speechBubbles}
            onChange={(e) => updatePreferences({ speechBubbles: e.target.checked })}
            className='border-input bg-background text-foreground accent-primary focus:ring-ring rounded focus:ring-2 focus:ring-offset-2'
          />
        </label>

        <label className='flex items-center justify-between'>
          <span>{t('mascot.settings.soundEffects')}</span>
          <input
            type='checkbox'
            checked={state.preferences.soundEffects}
            onChange={(e) => updatePreferences({ soundEffects: e.target.checked })}
            className='border-input bg-background text-foreground accent-primary focus:ring-ring rounded focus:ring-2 focus:ring-offset-2'
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
            <SelectTrigger className='border-input/50 bg-background/80 text-foreground hover:border-primary/50 focus:ring-primary/30 focus:border-primary cursor-pointer rounded-xl border-2 px-3 py-2.5 text-xs shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:outline-none'>
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
            <SelectTrigger className='border-input/50 bg-background/80 text-foreground hover:border-primary/50 focus:ring-primary/30 focus:border-primary cursor-pointer rounded-xl border-2 px-3 py-2.5 text-xs shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:outline-none'>
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
