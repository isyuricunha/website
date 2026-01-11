import { execFileSync, execSync } from 'node:child_process'

const ignoredPathPatterns = [
  /^README\.md$/i,
  /^LICENSE(\..*)?$/i,
  /^license\.md$/i,
  /^CREDITS\.md$/i,
  /^\.github\//,
  /^\.changeset\//,
  /^\.vscode\//,
  /^\.husky\//,
  /^assets\//,
  /^apps\/web\//
]

function commitExists(rev) {
  if (!rev) return false

  try {
    execFileSync('git', ['cat-file', '-e', `${rev}^{commit}`], {
      stdio: ['ignore', 'ignore', 'ignore']
    })
    return true
  } catch {
    return false
  }
}

function getChangedFiles(base, head) {
  try {
    const output = execFileSync('git', ['diff', '--name-only', base, head], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })

    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  } catch {
    return null
  }
}

function shouldIgnoreBuild(files) {
  return files.every((file) => ignoredPathPatterns.some((pattern) => pattern.test(file)))
}

function main() {
  const ref = process.env.VERCEL_GIT_COMMIT_REF

  if (ref?.startsWith('changeset-release/')) {
    console.log('vercel-ignore: changeset release branch; skipping build')
    process.exitCode = 0
    return
  }

  const head = process.env.VERCEL_GIT_COMMIT_SHA ?? 'HEAD'
  const baseFromEnv = process.env.VERCEL_GIT_PREVIOUS_SHA

  let base = baseFromEnv

  if (!base) {
    try {
      base = execSync('git rev-parse HEAD~1', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim()
    } catch {
      base = null
    }
  }

  if (!base) {
    console.log('vercel-ignore: no base sha available; proceeding with build')
    process.exitCode = 1
    return
  }

  if (!commitExists(base) || !commitExists(head)) {
    console.log('vercel-ignore: base/head sha not available in this clone; proceeding with build')
    process.exitCode = 1
    return
  }

  const files = getChangedFiles(base, head)

  if (!files) {
    console.log('vercel-ignore: git diff failed; proceeding with build')
    process.exitCode = 1
    return
  }

  if (files.length === 0) {
    console.log('vercel-ignore: no changed files detected; proceeding with build')
    process.exitCode = 1
    return
  }

  if (shouldIgnoreBuild(files)) {
    console.log('vercel-ignore: changes only in non-deploy files; skipping build')
    process.exitCode = 0
    return
  }

  console.log('vercel-ignore: relevant changes detected; proceeding with build')
  process.exitCode = 1
}

main()
