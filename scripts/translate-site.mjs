#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const rootDirectory = path.resolve(scriptDirectory, '..')
const i18nDirectory = path.join(rootDirectory, 'packages', 'i18n')
const messagesDirectory = path.join(i18nDirectory, 'src', 'messages')
const webContentDirectory = path.join(rootDirectory, 'apps', 'web', 'src', 'content')

const DEFAULT_COLLECTIONS = ['messages', 'blog', 'pages', 'projects', 'snippet']
const LOCALE_ALIASES = new Map([
  ['jp', 'ja'],
  ['cn', 'zh-CN'],
  ['zh', 'zh-CN'],
  ['zh-cn', 'zh-CN'],
  ['pt-br', 'pt-BR'],
  ['br', 'pt-BR']
])
const LANGUAGE_LABELS = new Map([
  ['en', 'English'],
  ['pt', 'Português'],
  ['pt-BR', 'Português (Brasil)'],
  ['es', 'Español'],
  ['fr', 'Français'],
  ['de', 'Deutsch'],
  ['it', 'Italiano'],
  ['ja', '日本語'],
  ['ko', '한국어'],
  ['zh-CN', '中文（简体）'],
  ['zh-TW', '中文（繁體）']
])

const usage = `Usage:
  pnpm translate:site -- --target es [--source en] [--label "Español"]

Required env:
  OPENAI_COMPATIBLE_BASE_URL=https://your-provider.example/v1
  OPENAI_COMPATIBLE_API_KEY=...
  OPENAI_COMPATIBLE_MODEL=...

Options:
  --target <locale>        Target locale. Aliases: jp -> ja, cn/zh -> zh-CN.
  --source <locale>        Source locale. Defaults to en.
  --label <name>           Human label inserted in packages/i18n config.
  --collections <list>     Comma list: ${DEFAULT_COLLECTIONS.join(', ')}.
  --batch-chars <number>   Approximate max chars per translation batch. Defaults to 12000.
  --force                  Overwrite existing target files.
  --dry-run                Plan work without calling the model or writing files.
  --limit <number>         Limit files per content collection, useful with --dry-run.
`

const loadEnvFile = async (filePath) => {
  try {
    const raw = await readFile(filePath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) continue

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')

      if (key && process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  } catch {}
}

const parseArguments = (rawArguments) => {
  const options = {
    source: 'en',
    target: '',
    label: '',
    collections: DEFAULT_COLLECTIONS,
    batchChars: 12_000,
    force: false,
    dryRun: false,
    limit: Number.POSITIVE_INFINITY
  }

  for (let index = 0; index < rawArguments.length; index += 1) {
    const argument = rawArguments[index]
    if (argument === '--') continue

    const [key, inlineValue] = argument.split('=', 2)
    const readValue = () => {
      if (inlineValue !== undefined) return inlineValue
      index += 1
      return rawArguments[index] ?? ''
    }

    switch (key) {
      case '--target': {
        options.target = readValue()
        break
      }
      case '--source': {
        options.source = readValue()
        break
      }
      case '--label': {
        options.label = readValue()
        break
      }
      case '--collections': {
        options.collections = readValue()
          .split(',')
          .map((collection) => collection.trim())
          .filter(Boolean)
        break
      }
      case '--batch-chars': {
        options.batchChars = Number(readValue())
        break
      }
      case '--limit': {
        options.limit = Number(readValue())
        break
      }
      case '--force': {
        options.force = true
        break
      }
      case '--dry-run': {
        options.dryRun = true
        break
      }
      case '--help':
      case '-h': {
        options.help = true
        break
      }
      default: {
        throw new Error(`Unknown option: ${argument}`)
      }
    }
  }

  return options
}

const normalizeLocale = (input) => {
  const rawLocale = input.trim()
  const alias = LOCALE_ALIASES.get(rawLocale.toLowerCase())
  const locale = alias ?? rawLocale
  const [language, region] = locale.split('-')

  if (!language || !/^[a-z]{2}$/.test(language)) {
    throw new Error(`Invalid locale "${input}". Use a BCP-47 code like es, ja, or zh-CN.`)
  }

  if (region) {
    if (!/^[a-zA-Z]{2}$/.test(region)) {
      throw new Error(`Invalid locale region "${input}". Use a code like pt-BR or zh-CN.`)
    }

    return `${language}-${region.toUpperCase()}`
  }

  return language
}

const getLanguageLabel = (locale, explicitLabel) => {
  if (explicitLabel) return explicitLabel
  const configured = LANGUAGE_LABELS.get(locale)
  if (configured) return configured

  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(locale) ?? locale
  } catch {
    return locale
  }
}

const assertDevelopmentOnly = () => {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error('Refusing to write translations outside a local development environment.')
  }
}

const assertFileExists = async (filePath) => {
  await access(filePath)
}

const pathExists = async (filePath) => {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

const getOpenAiEndpoint = () => {
  const baseUrl = process.env.OPENAI_COMPATIBLE_BASE_URL?.replace(/\/+$/, '')
  if (!baseUrl) throw new Error('OPENAI_COMPATIBLE_BASE_URL is required.')
  if (baseUrl.endsWith('/chat/completions')) return baseUrl
  return `${baseUrl}/chat/completions`
}

const translateWithOpenAiCompatible = async ({ messages, temperature = 0.2 }) => {
  const apiKey = process.env.OPENAI_COMPATIBLE_API_KEY
  const model = process.env.OPENAI_COMPATIBLE_MODEL

  if (!apiKey) throw new Error('OPENAI_COMPATIBLE_API_KEY is required.')
  if (!model) throw new Error('OPENAI_COMPATIBLE_MODEL is required.')

  const response = await fetch(getOpenAiEndpoint(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature
    })
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI-compatible request failed (${response.status}): ${body.slice(0, 600)}`)
  }

  const payload = await response.json()
  const content = payload?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('OpenAI-compatible response did not include choices[0].message.content.')
  }

  return content.trim()
}

const stripMarkdownFence = (text) => {
  const trimmed = text.trim()
  const fenceMatch = /^```(?:json|yaml|yml|md|markdown)?\s*([\s\S]*?)\s*```$/i.exec(trimmed)
  return fenceMatch ? fenceMatch[1].trim() : trimmed
}

const parseJsonFromModel = (text) => {
  const stripped = stripMarkdownFence(text)
  try {
    return JSON.parse(stripped)
  } catch {}

  const arrayStart = stripped.indexOf('[')
  const arrayEnd = stripped.lastIndexOf(']')
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    return JSON.parse(stripped.slice(arrayStart, arrayEnd + 1))
  }

  const objectStart = stripped.indexOf('{')
  const objectEnd = stripped.lastIndexOf('}')
  if (objectStart !== -1 && objectEnd > objectStart) {
    return JSON.parse(stripped.slice(objectStart, objectEnd + 1))
  }

  throw new Error('Could not parse JSON from model response.')
}

const flattenMessages = (value, prefix = []) => {
  const entries = []

  for (const [key, child] of Object.entries(value)) {
    const pathParts = [...prefix, key]
    if (typeof child === 'string') {
      entries.push({ path: pathParts.join('.'), value: child })
    } else if (child && typeof child === 'object' && !Array.isArray(child)) {
      entries.push(...flattenMessages(child, pathParts))
    }
  }

  return entries
}

const setNestedMessage = (target, dottedPath, value) => {
  const parts = dottedPath.split('.')
  let cursor = target

  for (const part of parts.slice(0, -1)) {
    if (!Object.hasOwn(cursor, part)) {
      cursor[part] = {}
    }
    cursor = cursor[part]
  }

  cursor[parts.at(-1)] = value
}

const batchByCharacters = (items, maxCharacters) => {
  const batches = []
  let currentBatch = []
  let currentSize = 0

  for (const item of items) {
    const itemSize = JSON.stringify(item).length + 2
    if (currentBatch.length > 0 && currentSize + itemSize > maxCharacters) {
      batches.push(currentBatch)
      currentBatch = []
      currentSize = 0
    }

    currentBatch.push(item)
    currentSize += itemSize
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch)
  }

  return batches
}

const translateMessageBatch = async ({
  batch,
  sourceLocale,
  targetLocale,
  sourceLabel,
  targetLabel
}) => {
  const response = await translateWithOpenAiCompatible({
    messages: [
      {
        role: 'system',
        content:
          'You translate UI messages for a multilingual Next.js site. Return only valid JSON. Preserve placeholders, ICU syntax, markdown, HTML tags, URLs, code identifiers, and product names.'
      },
      {
        role: 'user',
        content: JSON.stringify({
          sourceLocale,
          targetLocale,
          sourceLanguage: sourceLabel,
          targetLanguage: targetLabel,
          instructions:
            'Translate each value naturally. Return a JSON array with the exact same path values and translated value strings.',
          items: batch
        })
      }
    ],
    temperature: 0.1
  })

  const parsed = parseJsonFromModel(response)
  if (!Array.isArray(parsed)) {
    throw new TypeError('Message translation response must be a JSON array.')
  }

  return parsed
}

const translateMessages = async (options) => {
  const sourcePath = path.join(messagesDirectory, `${options.source}.json`)
  const targetPath = path.join(messagesDirectory, `${options.target}.json`)
  await assertFileExists(sourcePath)

  if (!options.force && (await pathExists(targetPath))) {
    return { collection: 'messages', status: 'skipped', reason: 'target exists', files: 0 }
  }

  const sourceMessages = JSON.parse(await readFile(sourcePath, 'utf8'))
  const entries = flattenMessages(sourceMessages)
  const batches = batchByCharacters(entries, options.batchChars)

  if (options.dryRun) {
    return { collection: 'messages', status: 'planned', batches: batches.length, files: 1 }
  }

  const translatedMessages = {}
  for (const batch of batches) {
    const translatedBatch = await translateMessageBatch({
      batch,
      sourceLocale: options.source,
      targetLocale: options.target,
      sourceLabel: options.sourceLabel,
      targetLabel: options.targetLabel
    })

    for (const item of translatedBatch) {
      if (typeof item?.path !== 'string' || typeof item?.value !== 'string') {
        throw new TypeError('Invalid translated message item.')
      }
      setNestedMessage(translatedMessages, item.path, item.value)
    }
  }

  await writeFile(targetPath, `${JSON.stringify(translatedMessages, undefined, 2)}\n`)
  return { collection: 'messages', status: 'written', batches: batches.length, files: 1 }
}

const splitFrontmatter = (content) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content)
  if (!match) {
    return { frontmatter: '', body: content, hasFrontmatter: false }
  }

  return {
    frontmatter: match[1],
    body: content.slice(match[0].length),
    hasFrontmatter: true
  }
}

const protectFencedCode = (markdown) => {
  const blocks = []
  const text = markdown.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, (block) => {
    const token = `@@SITE_TRANSLATION_CODE_BLOCK_${blocks.length}@@`
    blocks.push({ token, block })
    return token
  })

  return { text, blocks }
}

const restoreFencedCode = (markdown, blocks) => {
  let restored = markdown
  for (const { token, block } of blocks) {
    restored = restored.replaceAll(token, block)
  }
  return restored
}

const splitTextByCharacters = (text, maxCharacters) => {
  const chunks = []
  let current = ''

  for (const part of text.split(/(\n{2,})/)) {
    if (current.length > 0 && current.length + part.length > maxCharacters) {
      chunks.push(current)
      current = ''
    }

    if (part.length > maxCharacters) {
      const lines = part.split(/(\r?\n)/)
      for (const line of lines) {
        if (current.length > 0 && current.length + line.length > maxCharacters) {
          chunks.push(current)
          current = ''
        }
        current += line
      }
    } else {
      current += part
    }
  }

  if (current.length > 0) {
    chunks.push(current)
  }

  return chunks
}

const translatePlainText = async ({ text, sourceLabel, targetLabel, kind }) => {
  if (text.trim().length === 0) return text

  const response = await translateWithOpenAiCompatible({
    messages: [
      {
        role: 'system',
        content:
          'You are a careful localization engineer. Return only the translated content. Preserve code blocks, MDX JSX, markdown structure, frontmatter keys, placeholders, URLs, dates, and identifiers.'
      },
      {
        role: 'user',
        content: `Translate this ${kind} from ${sourceLabel} to ${targetLabel}.\n\n${text}`
      }
    ],
    temperature: 0.2
  })

  return stripMarkdownFence(response)
}

const translateMdxFile = async ({ sourcePath, targetPath, options }) => {
  if (!options.force && (await pathExists(targetPath))) {
    return { status: 'skipped', reason: 'target exists' }
  }

  const content = await readFile(sourcePath, 'utf8')
  const { frontmatter, body, hasFrontmatter } = splitFrontmatter(content)
  const { text: protectedBody, blocks } = protectFencedCode(body)
  const chunks = splitTextByCharacters(protectedBody, options.batchChars)

  if (options.dryRun) {
    return { status: 'planned', batches: chunks.length + (hasFrontmatter ? 1 : 0) }
  }

  const translatedFrontmatter = hasFrontmatter
    ? await translatePlainText({
        text: frontmatter,
        sourceLabel: options.sourceLabel,
        targetLabel: options.targetLabel,
        kind: 'YAML frontmatter'
      })
    : ''

  const translatedChunks = []
  for (const chunk of chunks) {
    translatedChunks.push(
      await translatePlainText({
        text: chunk,
        sourceLabel: options.sourceLabel,
        targetLabel: options.targetLabel,
        kind: 'MDX markdown body'
      })
    )
  }

  const translatedBody = restoreFencedCode(translatedChunks.join(''), blocks)
  const output = hasFrontmatter
    ? `---\n${translatedFrontmatter.trim()}\n---\n\n${translatedBody.trimStart()}`
    : translatedBody

  await mkdir(path.dirname(targetPath), { recursive: true })
  await writeFile(targetPath, output.endsWith('\n') ? output : `${output}\n`)
  return { status: 'written', batches: chunks.length + (hasFrontmatter ? 1 : 0) }
}

const listMdxFiles = async (directory) => {
  const entries = await readdirRecursive(directory)
  return entries.filter((entry) => entry.endsWith('.mdx')).toSorted()
}

const readdirRecursive = async (directory) => {
  const { readdir } = await import('node:fs/promises')
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await readdirRecursive(entryPath)))
    } else {
      files.push(entryPath)
    }
  }

  return files
}

const translateContentCollection = async (collection, options) => {
  const sourceDirectory = path.join(webContentDirectory, collection, options.source)
  const targetDirectory = path.join(webContentDirectory, collection, options.target)
  await assertFileExists(sourceDirectory)

  const sourceFiles = (await listMdxFiles(sourceDirectory)).slice(0, options.limit)
  let written = 0
  let skipped = 0
  let planned = 0
  let batches = 0

  for (const sourcePath of sourceFiles) {
    const relativePath = path.relative(sourceDirectory, sourcePath)
    const targetPath = path.join(targetDirectory, relativePath)
    const result = await translateMdxFile({ sourcePath, targetPath, options })

    if (result.status === 'written') written += 1
    if (result.status === 'skipped') skipped += 1
    if (result.status === 'planned') planned += 1
    batches += result.batches ?? 0
  }

  return {
    collection,
    status: options.dryRun ? 'planned' : 'processed',
    files: sourceFiles.length,
    written,
    skipped,
    planned,
    batches
  }
}

const updateI18nConfig = async (options) => {
  const configPath = path.join(i18nDirectory, 'src', 'config.ts')
  const current = await readFile(configPath, 'utf8')
  if (current.includes(`code: '${options.target}'`)) {
    return { file: configPath, status: 'skipped' }
  }

  if (options.dryRun) {
    return { file: configPath, status: 'planned' }
  }

  const insertIndex = current.lastIndexOf('\n]')
  if (insertIndex === -1) {
    throw new Error('Could not find supportedLanguages array terminator.')
  }

  const entry = `,\n  {\n    code: '${options.target}',\n    label: '${options.targetLabel}'\n  }`
  const updated = `${current.slice(0, insertIndex)}${entry}${current.slice(insertIndex)}`
  await writeFile(configPath, updated)
  return { file: configPath, status: 'updated' }
}

const updateI18nPackageExports = async (options) => {
  const packagePath = path.join(i18nDirectory, 'package.json')
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
  const exportKey = `./messages/${options.target}.json`

  if (Object.hasOwn(packageJson.exports, exportKey)) {
    return { file: packagePath, status: 'skipped' }
  }

  if (options.dryRun) {
    return { file: packagePath, status: 'planned' }
  }

  packageJson.exports[exportKey] = `./src/messages/${options.target}.json`
  await writeFile(packagePath, `${JSON.stringify(packageJson, undefined, 2)}\n`)
  return { file: packagePath, status: 'updated' }
}

const printSummary = (summary) => {
  console.log(JSON.stringify(summary, undefined, 2))
}

const main = async () => {
  await loadEnvFile(path.join(rootDirectory, '.env.local'))
  await loadEnvFile(path.join(rootDirectory, '.env'))

  const parsedOptions = parseArguments(process.argv.slice(2))
  if (parsedOptions.help) {
    console.log(usage)
    return
  }

  if (!parsedOptions.target) {
    throw new Error('--target is required.')
  }

  const options = {
    ...parsedOptions,
    source: normalizeLocale(parsedOptions.source),
    target: normalizeLocale(parsedOptions.target)
  }
  options.sourceLabel = getLanguageLabel(options.source)
  options.targetLabel = getLanguageLabel(options.target, options.label)

  assertDevelopmentOnly()

  if (!options.dryRun) {
    getOpenAiEndpoint()
    if (!process.env.OPENAI_COMPATIBLE_API_KEY)
      throw new Error('OPENAI_COMPATIBLE_API_KEY is required.')
    if (!process.env.OPENAI_COMPATIBLE_MODEL)
      throw new Error('OPENAI_COMPATIBLE_MODEL is required.')
  }

  const unknownCollections = options.collections.filter(
    (collection) => !DEFAULT_COLLECTIONS.includes(collection)
  )
  if (unknownCollections.length > 0) {
    throw new Error(`Unknown collections: ${unknownCollections.join(', ')}`)
  }

  const results = []
  if (options.collections.includes('messages')) {
    results.push(await translateMessages(options))
  }

  for (const collection of options.collections.filter((entry) => entry !== 'messages')) {
    results.push(await translateContentCollection(collection, options))
  }

  const registry = [await updateI18nConfig(options), await updateI18nPackageExports(options)]

  printSummary({
    source: options.source,
    target: options.target,
    targetLabel: options.targetLabel,
    dryRun: options.dryRun,
    collections: results,
    registry
  })
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
