import isyuricunha from '@isyuricunha/eslint-config'

export default isyuricunha(
  {
    project: './tsconfig.json',
    tsconfigRootDir: import.meta.dirname,
    turbo: true
  },
  {
    ignores: ['apps/**', 'packages/**']
  }
)
