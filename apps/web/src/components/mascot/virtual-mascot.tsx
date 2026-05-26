'use client'

import * as React from 'react'
import Image from 'next/image'
import { Eye as EyeIcon } from 'lucide-react'

import MascotGame from './mascot-game'
import AIChatInterface from './ai-chat-interface'
import { useMascotState } from './hooks/use-mascot-state'
import { MascotSettingsPanel } from './components/mascot-settings-panel'
import { MascotContactPanel } from './components/mascot-contact-panel'
import { MascotMenuPanel } from './components/mascot-menu-panel'
import { MascotSpeechBubbles } from './components/mascot-speech-bubbles'
import { MascotSelectionBubble } from './components/mascot-selection-bubble'

type VirtualMascotProps = {
  hidden?: boolean
}

const VirtualMascot = ({ hidden = false }: VirtualMascotProps) => {
  const mascot = useMascotState()
  const {
    state,
    mounted,
    prefersReducedMotion,
    pathname,
    pageKey,
    updateState,
    handleMascotClick,
    getPositionClasses,
    getBubblePositionClasses,
    restoreMascot,
    handleAIClose,
    handleThinkingChange,
    t
  } = mascot

  if (hidden) return null

  // Show restore button when hidden or dismissed
  if (state.isHiddenPref || state.isDismissed) {
    return (
      <div className={`${getPositionClasses()} z-50`}>
        <button
          type='button'
          aria-label={t('mascot.restore')}
          className='text-accent-earth-text shadow-feature-card hover:bg-bg-hover min-h-[44px] min-w-[44px] rounded-full border border-[var(--accent-border)] bg-[var(--accent-dim)] p-2 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none sm:p-3'
          onClick={restoreMascot}
        >
          <EyeIcon className='h-5 w-5 sm:h-6 sm:w-6' />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className={`${getPositionClasses()} z-50`}>
        {/* Settings Panel */}
        <div className={getBubblePositionClasses()}>
          <MascotSettingsPanel mascot={mascot} />
        </div>

        {/* Contact Panel */}
        <div className={getBubblePositionClasses()}>
          <MascotContactPanel mascot={mascot} />
        </div>

        {/* Menu Panel */}
        <div className={getBubblePositionClasses()}>
          <MascotMenuPanel mascot={mascot} />
        </div>

        {/* AI Chat Interface */}
        {state.showAIChat && (
          <div className={getBubblePositionClasses()}>
            <AIChatInterface
              isOpen={state.showAIChat}
              onClose={handleAIClose}
              onThinkingChange={handleThinkingChange}
              currentPage={pageKey}
              pagePath={pathname || '/'}
            />
          </div>
        )}

        {/* Speech Bubbles */}
        <div className={getBubblePositionClasses()}>
          <MascotSpeechBubbles mascot={mascot} />
        </div>

        {/* Selection Explain Bubble */}
        <div className={getBubblePositionClasses()}>
          <MascotSelectionBubble mascot={mascot} />
        </div>

        {/* Mascot button */}
        <button
          type='button'
          aria-label={t('mascot.ariaLabel')}
          className={`relative inline-flex h-12 w-12 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none sm:h-14 sm:w-14 lg:h-16 lg:w-16 ${state.isActive ? 'shadow-feature-card border-[var(--accent-border)] bg-[var(--accent-dim)]' : 'shadow-feature-card border-[var(--border-default)]'} ${state.preferences.animations ? 'hover:bg-bg-hover hover:border-[var(--accent-border)]' : ''} ${state.isKonamiMode ? 'animate-pulse border-[var(--accent-border)]' : ''} ${state.isTickled ? 'animate-bounce' : ''} ${state.isDizzy ? 'animate-spin' : ''}`}
          onClick={handleMascotClick}
        >
          {mounted && state.currentMascotImage > 0 ? (
            <div
              className='relative h-full w-full rounded-full transition-transform duration-500 ease-out'
              style={
                state.preferences.animations && !prefersReducedMotion
                  ? {
                      transform: `translate(${state.mousePosition.x * 5}px, ${state.mousePosition.y * 5}px) rotate(${state.mousePosition.x * 5}deg)`
                    }
                  : undefined
              }
            >
              <Image
                src={`/images/mascote-${state.currentMascotImage}.png`}
                alt=''
                role='presentation'
                width={64}
                height={64}
                className={`h-full w-full rounded-full object-cover transition-all duration-500 ${state.isBlinking ? 'animate-pulse' : ''} ${state.isKonamiMode ? 'hue-rotate-180 sepia filter' : ''}`}
                priority={state.isActive}
                loading={state.isActive ? 'eager' : 'lazy'}
              />
            </div>
          ) : (
            <div aria-hidden className='bg-bg-surface h-full w-full rounded-full' />
          )}
        </button>
      </div>

      {/* Mini Game */}
      <MascotGame isOpen={state.showGame} onClose={() => updateState({ showGame: false })} />
    </>
  )
}

VirtualMascot.displayName = 'VirtualMascot'

export default React.memo(VirtualMascot)
