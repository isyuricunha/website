import { defineConfig } from 'tsup'

const isWatchMode = process.argv.includes('--watch')

export default defineConfig({
  entry: ['src/**/*.ts'],
  dts: true,
  format: ['esm'],
  target: 'esnext',
  clean: !isWatchMode
})
