import isyuricunha, { GLOB_E2E, GLOB_JS } from '@isyuricunha/eslint-config'

export default isyuricunha(
  {
    project: './tsconfig.json',
    tsconfigRootDir: import.meta.dirname,
    react: true,
    next: true,
    playwright: true,
    testingLibrary: true,
    turbo: true
  },
  {
    ignores: ['public/**/*.js', 'scripts/vercel-ignore.js']
  },
  {
    files: [GLOB_E2E],
    rules: {
      'playwright/expect-expect': [
        'error',
        {
          assertFunctionNames: ['checkStoredTheme', 'checkAppliedTheme', 'a11y']
        }
      ]
    }
  },
  {
    // The shared react config applies the TypeScript parser to `.mjs` files
    // (via GLOB_JS) but does not set `tsconfigRootDir` for them, so
    // `parserOptions.project` is resolved relative to the invoking process's
    // cwd rather than this package. Set it explicitly here so linting this
    // file works regardless of the caller's cwd (e.g. `pnpm -w exec eslint`
    // run from the monorepo root).
    files: [GLOB_JS],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
)
