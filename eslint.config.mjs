import isyuricunha from '@isyuricunha/eslint-config'

export default isyuricunha(
  {
    project: './tsconfig.json',
    tsconfigRootDir: import.meta.dirname,
    turbo: true
  },
  {
    ignores: ['apps/**', 'packages/**']
  },
  {
    files: ['scripts/vercel-ignore.js'],
    rules: {
      'sonarjs/no-os-command-from-path': 'off',
      'sonarjs/os-command': 'off',
      'turbo/no-undeclared-env-vars': 'off'
    }
  }
)
