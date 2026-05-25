import type { Linter } from 'eslint'

type PluginWithRules = {
  rules?: Record<string, RuleWithMetadata | undefined>
}

type RuleWithMetadata = {
  meta?: {
    deprecated?: unknown
  }
}

type RulesRecord = Record<string, Linter.RuleEntry | undefined>
type RuleEntryTuple = [string, Linter.RuleEntry]

const hasRuleEntry = (entry: [string, Linter.RuleEntry | undefined]): entry is RuleEntryTuple =>
  entry[1] !== undefined

const getPluginRule = (
  ruleId: string,
  plugins: Record<string, PluginWithRules>
): RuleWithMetadata | undefined => {
  const separatorIndex = ruleId.lastIndexOf('/')

  if (separatorIndex === -1) {
    return undefined
  }

  const pluginName = ruleId.slice(0, separatorIndex)
  const ruleName = ruleId.slice(separatorIndex + 1)

  return plugins[pluginName]?.rules?.[ruleName]
}

export const withoutDeprecatedPluginRules = (
  rules: RulesRecord,
  plugins: Record<string, PluginWithRules>
): Linter.RulesRecord =>
  Object.fromEntries(
    Object.entries(rules)
      .filter(hasRuleEntry)
      .filter(([ruleId]) => !getPluginRule(ruleId, plugins)?.meta?.deprecated)
  )

export const withoutRuleIds = (
  rules: RulesRecord,
  deprecatedRuleIds: readonly string[]
): Linter.RulesRecord => {
  const ruleIds = new Set(deprecatedRuleIds)

  return Object.fromEntries(
    Object.entries(rules)
      .filter(hasRuleEntry)
      .filter(([ruleId]) => !ruleIds.has(ruleId))
  )
}
