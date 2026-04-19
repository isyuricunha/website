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
    handleMouseEnter,
    getPositionClasses,
    getBubblePositionClasses,
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
          className='from-primary to-primary/80 text-primary-foreground shadow-primary/30 hover:shadow-primary/40 focus-visible:ring-primary/50 border-primary/20 min-h-[44px] min-w-[44px] rounded-full border-2 bg-linear-to-br p-2 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl focus-visible:ring-2 focus-visible:outline-none sm:p-3'
          onClick={() => updateState({ isDismissed: false, isHiddenPref: false })}
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
          className={`focus-visible:ring-primary/50 relative inline-flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none sm:h-14 sm:w-14 lg:h-16 lg:w-16 ${state.isActive ? 'border-primary/60 shadow-primary/30 scale-110 shadow-2xl' : 'border-border/40 shadow-xl shadow-black/10'} ${state.preferences.animations ? 'hover:shadow-primary/20 hover:scale-110 hover:shadow-2xl' : ''} ${state.isKonamiMode ? 'animate-pulse border-yellow-400 shadow-yellow-400/20' : ''} ${state.isTickled ? 'animate-bounce' : ''} ${state.isDizzy ? 'animate-spin' : ''}`}
          onClick={handleMascotClick}
          onMouseEnter={handleMouseEnter}
          onFocus={() => {
            if (
              state.preferences.speechBubbles &&
              !state.autoShowMessage &&
              !state.showContact &&
              !state.showSettings &&
              !state.showMenu
            ) {
              updateState({ showBubble: true })
            }
          }}
          onBlur={() => {
            if (
              !state.autoShowMessage &&
              !state.isHovering &&
              !state.showContact &&
              !state.showSettings &&
              !state.showMenu
            ) {
              updateState({ showBubble: false })
            }
          }}
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
            <div aria-hidden className='bg-muted/40 h-full w-full rounded-full' />
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
