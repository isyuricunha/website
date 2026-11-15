import adapter from '@sveltejs/adapter-vercel'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

// SvelteKit 3 keeps all framework configuration in vite.config.ts. The
// repository standard is Vite 8, TypeScript 6 and Node.js 24.
export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter()
    }),
    tailwindcss()
  ]
})
