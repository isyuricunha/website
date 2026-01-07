import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/server.ts'],
  dts: true,
  format: ['esm'],
  target: 'esnext',
  clean: true
})
