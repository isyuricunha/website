import type { ParserOptions, Plugin } from 'prettier'

import { parsers } from 'prettier/plugins/babel'
import sortPackageJson from 'sort-package-json'

const parser = parsers['json-stringify']

type Options = {
  expandUsers?: boolean
  keyOrder?: string[]
}

type PackageJson = Record<string, unknown>

const parsePersonString = (value: string): Record<string, string> | string => {
  if (!value || typeof value !== 'string') return value

  const trimmed = value?.trim?.() ?? ''
  if (!trimmed) return value

  const removeSegment = (input: string, start: number, end: number) => {
    if (!input || typeof input !== 'string') return input
    if (start < 0 || end < 0 || end <= start) return input
    return (input?.slice?.(0, start) + input?.slice?.(end))?.trim?.() ?? ''
  }

  const emailStart = trimmed?.indexOf?.('<') ?? -1
  const emailEnd = emailStart === -1 ? -1 : (trimmed?.indexOf?.('>', emailStart + 1) ?? -1)
  const email =
    emailStart !== -1 && emailEnd > emailStart
      ? (trimmed?.slice?.(emailStart + 1, emailEnd) ?? null)
      : null

  const urlStart = trimmed?.indexOf?.('(') ?? -1
  const urlEnd = urlStart === -1 ? -1 : (trimmed?.indexOf?.(')', urlStart + 1) ?? -1)
  const url =
    urlStart !== -1 && urlEnd > urlStart ? (trimmed?.slice?.(urlStart + 1, urlEnd) ?? null) : null

  let name = trimmed
  if (email !== null) {
    name = removeSegment(name, emailStart, emailEnd + 1)
  }
  if (url !== null) {
    name = removeSegment(name, urlStart, urlEnd + 1)
  }

  const result: Record<string, string> = {}
  if (name) result.name = name
  if (email) result.email = email
  if (url) result.url = url

  return Object.keys(result).length > 0 ? result : value
}

const expandUsers = (packageJson: PackageJson): PackageJson => {
  const next: PackageJson = { ...packageJson }

  const author = next.author
  if (typeof author === 'string') {
    next.author = parsePersonString(author)
  }

  const contributors = next.contributors
  if (Array.isArray(contributors)) {
    next.contributors = contributors.map((contributor) =>
      typeof contributor === 'string' ? parsePersonString(contributor) : contributor
    )
  }

  return next
}

const applyKeyOrder = (packageJson: PackageJson, keyOrder: string[] | undefined): PackageJson => {
  if (!keyOrder || keyOrder.length === 0) return packageJson

  const ordered: PackageJson = {}
  for (const key of keyOrder) {
    if (Object.prototype.hasOwnProperty.call(packageJson, key)) {
      ordered[key] = packageJson[key]
    }
  }

  for (const [key, value] of Object.entries(packageJson)) {
    if (!Object.prototype.hasOwnProperty.call(ordered, key)) {
      ordered[key] = value
    }
  }

  return ordered
}

const plugin: Plugin = {
  parsers: {
    'json-stringify': {
      ...parser,
      preprocess: (text, options: ParserOptions & Options) => {
        const regex = /^package[^/]*\.json$/u

        if (!regex.test(options.filepath)) return text

        const parsed = JSON.parse(text) as PackageJson
        const expanded = options.expandUsers ? expandUsers(parsed) : parsed
        const sorted = sortPackageJson(expanded)
        const ordered = applyKeyOrder(sorted, options.keyOrder)

        return JSON.stringify(ordered) + '\n'
      }
    }
  },
  options: {
    expandUsers: {
      type: 'boolean',
      category: 'Sort Package JSON',
      default: false,
      description: 'Expand author and contributors into objects'
    },
    keyOrder: {
      type: 'string',
      array: true,
      category: 'Sort Package JSON',
      default: [{ value: [] }],
      description: 'Specify the order of keys.'
    }
  }
}

export type { Options }
export default plugin
