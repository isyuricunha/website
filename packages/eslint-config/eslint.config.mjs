import isyuricunha from './dist/index.js'

export default isyuricunha(
  {
    project: './tsconfig.json',
    tsconfigRootDir: import.meta.dirname,
    react: true,
    next: true,
    playwright: true,
    testingLibrary: true,
    turbo: true,
    typescript: true
  },
  {
    ignores: ['eslint.config.bundled_*.mjs', 'tsup.config.bundled_*.mjs']
  }
)
