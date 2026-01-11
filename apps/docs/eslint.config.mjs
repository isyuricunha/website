import isyuricunha from '@isyuricunha/eslint-config'

export default isyuricunha(
  {
    project: './tsconfig.json',
    tsconfigRootDir: import.meta.dirname,
    react: true,
    next: true,
    turbo: true
  },
  {
    ignores: ['scripts/vercel-ignore.js']
  }
)
