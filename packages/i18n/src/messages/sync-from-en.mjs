import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const messagesDir = __dirname
const enPath = path.join(messagesDir, 'en.json')

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8')
}

function fillMissing(fromEn, toLocale) {
  // Only fill when missing. Do not overwrite existing translations.
  if (Array.isArray(fromEn) || Array.isArray(toLocale)) {
    return toLocale ?? fromEn
  }
  if (typeof fromEn !== 'object' || fromEn === null) {
    return toLocale === undefined ? fromEn : toLocale
  }
  const result = { ...(typeof toLocale === 'object' && toLocale ? toLocale : {}) }
  for (const key of Object.keys(fromEn)) {
    result[key] = fillMissing(fromEn[key], result[key])
  }
  return result
}

function main() {
  const en = readJson(enPath)
  const files = fs
    .readdirSync(messagesDir)
    .filter((f) => f.endsWith('.json') && f !== 'en.json')

  const updated = []
  for (const file of files) {
    const localePath = path.join(messagesDir, file)
    const before = readJson(localePath)
    const after = fillMissing(en, before)

    // Only write if changed
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      writeJson(localePath, after)
      updated.push(file)
    }
  }

  console.log(
    updated.length
      ? `Updated ${updated.length} locale file(s):\n - ${updated.join('\n - ')}`
      : 'No locale files needed updates.'
  )
}

main()
