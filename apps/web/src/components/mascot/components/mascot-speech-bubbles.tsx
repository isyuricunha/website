'use client'

import { memo } from 'react'
import { X as XIcon, Menu as MenuIcon } from 'lucide-react'
import { UseMascotStateReturn } from '../hooks/use-mascot-state'

type MascotSpeechBubblesProps = {
  mascot: Pick<
    UseMascotStateReturn,
    'state' | 't' | 'prefersReducedMotion' | 'startExit' | 'updateState' | 'handleHideMascot'
  >
}

const MascotSpeechBubblesComponent = ({ mascot }: MascotSpeechBubblesProps) => {
  const { state, t, prefersReducedMotion, startExit, updateState, handleHideMascot } = mascot

  if (
    !state.preferences.speechBubbles ||
    state.showContact ||
    state.showSettings ||
    state.showMenu ||
    state.showAIChat
  ) {
    return null
  }

  return (
    <div className={`flex w-56 flex-col gap-2 sm:w-60`} aria-live='polite' aria-atomic='false'>
      {state.messageQueue.map((item, idx) => {
        const isExiting = state.exitingIds.has(item.id)
        return (
          <div
            key={item.id}
            className={`bg-bg-elevated text-text-primary shadow-feature-card rounded-lg border border-[var(--border-subtle)] ring-0 transition-all duration-200 ease-in-out outline-none ${
              isExiting ? 'translate-y-1 scale-95 opacity-0' : 'translate-y-0 scale-100 opacity-100'
            }`}
            role='dialog'
            aria-label={t('mascot.speechBubble')}
            style={prefersReducedMotion ? undefined : { animation: 'fadeInUp 300ms ease-out' }}
          >
            <div className='bubble-float p-2'>
              <div className='flex items-start gap-2'>
                <div className='min-w-0 flex-1 text-xs leading-relaxed wrap-break-word whitespace-pre-wrap'>
                  {item.text}
                </div>
                <div className='shrink-0'>
                  {idx === state.messageQueue.length - 1 && (
                    <button
                      type='button'
                      aria-label={t('mascot.menu.open')}
                      className='text-text-secondary hover:bg-bg-hover hover:text-text-primary rounded px-2 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
                      onClick={() => updateState({ showMenu: !state.showMenu })}
                    >
                      <MenuIcon className='h-3 w-3' />
                    </button>
                  )}
                  {idx === state.messageQueue.length - 1 && (
                    <button
                      type='button'
                      aria-label={t('mascot.hide')}
                      className='text-text-secondary hover:bg-bg-hover hover:text-text-primary rounded px-2 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
                      onClick={handleHideMascot}
                    >
                      {t('mascot.hide')}
                    </button>
                  )}
                  <button
                    type='button'
                    aria-label={t('mascot.close')}
                    className='text-text-secondary hover:bg-bg-hover hover:text-text-primary rounded p-1 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
                    onClick={() => startExit(item.id)}
                  >
                    <XIcon className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

MascotSpeechBubblesComponent.displayName = 'MascotSpeechBubbles'

export const MascotSpeechBubbles = memo(MascotSpeechBubblesComponent, (prev, next) => {
  const prevState = prev.mascot.state
  const nextState = next.mascot.state

  return (
    prevState.preferences.speechBubbles === nextState.preferences.speechBubbles &&
    prevState.showContact === nextState.showContact &&
    prevState.showSettings === nextState.showSettings &&
    prevState.showMenu === nextState.showMenu &&
    prevState.showAIChat === nextState.showAIChat &&
    prevState.messageQueue === nextState.messageQueue &&
    prevState.exitingIds === nextState.exitingIds
  )
})
