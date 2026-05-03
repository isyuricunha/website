'use client'

import {
  Bug as BugIcon,
  MessageCircle as MessageCircleIcon,
  Gamepad as GamepadIcon,
  Settings as SettingsIcon
} from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { flags } from '@isyuricunha/env'
import { UseMascotStateReturn } from '../hooks/use-mascot-state'

type MascotMenuPanelProps = {
  mascot: Pick<UseMascotStateReturn, 'state' | 't' | 'handleMenuAction'>
}

export function MascotMenuPanel({ mascot }: MascotMenuPanelProps) {
  const { state, t, handleMenuAction } = mascot

  if (!state.showMenu) return null

  return (
    <div
      className={`border-border/20 bg-popover/95 text-popover-foreground shadow-primary/10 w-36 rounded-3xl border-2 p-3 text-xs shadow-2xl backdrop-blur-md sm:w-40`}
    >
      <div className='space-y-1'>
        <button
          type='button'
          className='hover:bg-muted/80 focus-visible:ring-primary/50 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none'
          onClick={() => handleMenuAction('contact')}
        >
          <BugIcon className='h-4 w-4' />
          {t('mascot.menu.reportBug')}
        </button>
        <button
          type='button'
          className='hover:bg-muted/80 focus-visible:ring-primary/50 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none'
          onClick={() => handleMenuAction('projects')}
        >
          <SiGithub className='h-4 w-4' />
          {t('mascot.menu.viewProjects')}
        </button>
        {(flags.mistral || flags.gemini || flags.groq || flags.hf || flags.hfLocal || flags.ollama) && (
          <button
            type='button'
            className='hover:bg-muted/80 focus-visible:ring-primary/50 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none'
            onClick={() => handleMenuAction('chat')}
          >
            <MessageCircleIcon className='h-4 w-4' />
            AI Chat
          </button>
        )}
        <button
          type='button'
          className='hover:bg-muted/80 focus-visible:ring-primary/50 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none'
          onClick={() => handleMenuAction('game')}
        >
          <GamepadIcon className='h-4 w-4' />
          {t('mascot.menu.miniGame')}
        </button>
        <button
          type='button'
          className='hover:bg-muted/80 focus-visible:ring-primary/50 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none'
          onClick={() => handleMenuAction('settings')}
        >
          <SettingsIcon className='h-4 w-4' />
          {t('mascot.menu.settings')}
        </button>
      </div>
    </div>
  )
}
