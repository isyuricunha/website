'use client'

import { memo } from 'react'
import { Sparkles, X as XIcon } from 'lucide-react'
import { UseMascotStateReturn } from '../hooks/use-mascot-state'

type MascotSelectionBubbleProps = {
  mascot: Pick<UseMascotStateReturn, 'state' | 't' | 'explainSelection' | 'updateState'>
}

const MascotSelectionBubbleComponent = ({ mascot }: MascotSelectionBubbleProps) => {
  const { state, t, explainSelection, updateState } = mascot

  if (!state.showSelectionBubble || state.showAIChat) return null

  return (
    <div className='animate-in fade-in slide-in-from-bottom-2 z-50 duration-300'>
      <div className='text-text-primary shadow-feature-card flex items-center gap-2 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-dim)] px-3 py-2 text-xs'>
        <Sparkles className='h-3 w-3 animate-pulse' />
        <span className='font-medium'>{t('mascot.interactions.selectionExplain')}</span>
        <button
          type='button'
          onClick={explainSelection}
          className='bg-bg-hover hover:bg-bg-active rounded-md px-2 py-1 font-medium transition-colors'
        >
          {t('mascot.interactions.explainButton')}
        </button>
        <button
          type='button'
          onClick={() => updateState({ showSelectionBubble: false })}
          className='hover:bg-bg-hover rounded p-1'
        >
          <XIcon className='h-3 w-3' />
        </button>
      </div>
    </div>
  )
}

MascotSelectionBubbleComponent.displayName = 'MascotSelectionBubble'

export const MascotSelectionBubble = memo(MascotSelectionBubbleComponent, (prev, next) => {
  return (
    prev.mascot.state.showSelectionBubble === next.mascot.state.showSelectionBubble &&
    prev.mascot.state.showAIChat === next.mascot.state.showAIChat
  )
})
