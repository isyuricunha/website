import type { Linter } from 'eslint'

import { turboPlugin } from '@/plugins'

const getTurboRecommendedRules = (): Linter.RulesRecord => {
  const recommended = (turboPlugin as unknown as { configs?: { recommended?: unknown } }).configs
    ?.recommended

  if (!recommended) return {}

  if (Array.isArray(recommended)) {
    return recommended.reduce<Linter.RulesRecord>((acc, config) => {
      if (config && typeof config === 'object' && 'rules' in config) {
        const rules = (config as { rules?: Linter.RulesRecord }).rules
        if (rules) return { ...acc, ...rules }
      }
      return acc
    }, {})
  }

  if (typeof recommended === 'object' && 'rules' in recommended) {
    return (recommended as { rules?: Linter.RulesRecord }).rules ?? {}
  }

  return {}
}

export const turbo: Linter.Config[] = [
  {
    name: 'isyuricunha:turbo',
    plugins: {
      turbo: turboPlugin
    },
    rules: {
      ...getTurboRecommendedRules()
    }
  }
]
