'use client'

import {
  Bug as BugIcon,
  MessageCircle as MessageCircleIcon,
  Gamepad as GamepadIcon,
  Settings as SettingsIcon
} from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { UseMascotStateReturn } from '../hooks/use-mascot-state'

type MascotMenuPanelProps = {
  mascot: Pick<UseMascotStateReturn, 'state' | 't' | 'handleMenuAction'>
}

export function MascotMenuPanel({ mascot }: MascotMenuPanelProps) {
  const { state, t, handleMenuAction } = mascot

  if (!state.showMenu) return null

  return (
    <div className='bg-bg-elevated text-text-primary shadow-feature-card w-36 rounded-lg border border-[var(--border-subtle)] p-3 text-xs sm:w-40'>
      <div className='space-y-1'>
        <button
          type='button'
          className='hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
          onClick={() => handleMenuAction('contact')}
        >
          <BugIcon className='h-4 w-4' />
          {t('mascot.menu.reportBug')}
        </button>
        <button
          type='button'
          className='hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
          onClick={() => handleMenuAction('projects')}
        >
          <SiGithub className='h-4 w-4' />
          {t('mascot.menu.viewProjects')}
        </button>
        <button
          type='button'
          className='hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
          onClick={() => handleMenuAction('chat')}
        >
          <MessageCircleIcon className='h-4 w-4' />
          {t('mascot.menu.aiChat')}
        </button>
        <button
          type='button'
          className='hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
          onClick={() => handleMenuAction('game')}
        >
          <GamepadIcon className='h-4 w-4' />
          {t('mascot.menu.miniGame')}
        </button>
        <button
          type='button'
          className='hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
          onClick={() => handleMenuAction('settings')}
        >
          <SettingsIcon className='h-4 w-4' />
          {t('mascot.menu.settings')}
        </button>
      </div>
    </div>
  )
}
