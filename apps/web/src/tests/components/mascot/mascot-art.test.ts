import { describe, expect, it } from 'vitest'

import { getNeryMotion } from '@/components/mascot/mascot-art'

const idle = {
  pageKey: 'home',
  isThinking: false,
  isTickled: false,
  isDizzy: false,
  isKonamiMode: false,
  showMenu: false,
  showAIChat: false,
  showContact: false,
  showSettings: false,
  showGame: false
}

describe('Nery motion selection', () => {
  it('uses the official idle pose by default', () => {
    expect(getNeryMotion(idle)).toBe('idle')
  })

  it.each([
    [{ pageKey: 'projects' }, 'review'],
    [{ pageKey: 'projectsDetail' }, 'review'],
    [{ pageKey: '404' }, 'failed'],
    [{ showMenu: true }, 'waving'],
    [{ isTickled: true }, 'jumping'],
    [{ isKonamiMode: true }, 'jumping'],
    [{ isDizzy: true }, 'failed'],
    [{ showAIChat: true }, 'idle'],
    [{ showContact: true }, 'idle'],
    [{ showSettings: true }, 'idle'],
    [{ showGame: true }, 'idle'],
    [{ pageKey: 'projects', showAIChat: true }, 'idle'],
    [{ pageKey: '404', showAIChat: true }, 'idle'],
    [{ showAIChat: true, isThinking: true }, 'running'],
    [{ pageKey: '404', showAIChat: true, isThinking: true }, 'running']
  ] as const)('maps the interaction %j to %s', (context, motion) => {
    expect(getNeryMotion({ ...idle, ...context })).toBe(motion)
  })
})
