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
  const trimmed = value.trim()
  if (!trimmed) return value

  const emailMatch = /<([^>]+)>/u.exec(trimmed)
  const urlMatch = /\(([^)]+)\)/u.exec(trimmed)

  const name = trimmed
    .replace(/<[^>]+>/gu, '')
    .replace(/\([^)]+\)/gu, '')
    .trim()

  const obj: Record<string, string> = {}
  if (name) obj.name = name
  if (emailMatch?.[1]) obj.email = emailMatch[1]
  if (urlMatch?.[1]) obj.url = urlMatch[1]

  return Object.keys(obj).length > 0 ? obj : value
}

const expandUsers = (pkg: PackageJson): PackageJson => {
  const next: PackageJson = { ...pkg }

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

const applyKeyOrder = (pkg: PackageJson, keyOrder: string[] | undefined): PackageJson => {
  if (!keyOrder || keyOrder.length === 0) return pkg

  const ordered: PackageJson = {}
  for (const key of keyOrder) {
    if (Object.prototype.hasOwnProperty.call(pkg, key)) {
      ordered[key] = pkg[key]
    }
  }

  for (const [key, value] of Object.entries(pkg)) {
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
