export const MASCOT_AVATAR_SRC = '/images/nery/avatar.webp'

export type NeryMotion = 'idle' | 'waving' | 'jumping' | 'failed' | 'running' | 'review'

type MotionContext = {
  pageKey: string
  isThinking: boolean
  isTickled: boolean
  isDizzy: boolean
  isKonamiMode: boolean
  showMenu: boolean
  showAIChat: boolean
  showContact: boolean
  showSettings: boolean
  showGame: boolean
}

export const getNeryMotion = (context: MotionContext): NeryMotion => {
  if (context.isThinking) return 'running'
  if (context.isDizzy) return 'failed'
  if (context.isTickled || context.isKonamiMode) return 'jumping'
  if (context.showMenu) return 'waving'
  if (context.showAIChat || context.showContact || context.showSettings || context.showGame)
    return 'idle'
  if (context.pageKey === '404') return 'failed'
  if (context.pageKey === 'projects' || context.pageKey === 'projectsDetail') return 'review'
  return 'idle'
}
