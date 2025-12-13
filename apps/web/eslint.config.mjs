import isyuricunha, { GLOB_E2E } from '@isyuricunha/eslint-config'

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
    ignores: ['public/**/*.js']
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
  }
)
