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

  const removeSegment = (input: string, start: number, end: number) => {
    if (start < 0 || end < 0 || end <= start) return input
    return (input.slice(0, start) + input.slice(end)).trim()
  }

  const emailStart = trimmed.indexOf('<')
  const emailEnd = emailStart === -1 ? -1 : trimmed.indexOf('>', emailStart + 1)
  const email =
    emailStart !== -1 && emailEnd > emailStart ? trimmed.slice(emailStart + 1, emailEnd) : null

  const urlStart = trimmed.indexOf('(')
  const urlEnd = urlStart === -1 ? -1 : trimmed.indexOf(')', urlStart + 1)
  const url = urlStart !== -1 && urlEnd > urlStart ? trimmed.slice(urlStart + 1, urlEnd) : null

  let name = trimmed
  if (email !== null) {
    name = removeSegment(name, emailStart, emailEnd + 1)
  }
  if (url !== null) {
    name = removeSegment(name, urlStart, urlEnd + 1)
  }

  const obj: Record<string, string> = {}
  if (name) obj.name = name
  if (email) obj.email = email
  if (url) obj.url = url

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
