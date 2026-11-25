'use client'

import * as React from 'react'
import { Eye as EyeIcon } from 'lucide-react'

import MascotGame from './mascot-game'
import { getNeryMotion } from './mascot-art'
import { NerySprite } from './nery-sprite'
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
          aria-expanded={state.showMenu}
          className='relative flex h-[104px] w-24 items-end justify-center rounded-xl border-0 bg-transparent transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none motion-reduce:transition-none sm:h-[130px] sm:w-[120px]'
          onClick={handleMascotClick}
        >
          <NerySprite
            motion={getNeryMotion({ ...state, pageKey })}
            animated={mounted && !prefersReducedMotion && state.preferences.animations}
          />
        </button>
      </div>

      {/* Mini Game */}
      <MascotGame isOpen={state.showGame} onClose={() => updateState({ showGame: false })} />
    </>
  )
}

VirtualMascot.displayName = 'VirtualMascot'

export default React.memo(VirtualMascot)
