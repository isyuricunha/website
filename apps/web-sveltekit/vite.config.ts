import adapter from '@sveltejs/adapter-vercel'
import contentCollections from '@content-collections/vite'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// SvelteKit 3 keeps all framework configuration in vite.config.ts. The
// repository standard is Vite 8, TypeScript 6 and Node.js 24.
export default defineConfig({
  plugins: [
    // Reuses the exact same collections config as the Next.js app, so both
    // apps compile the single source of MDX content. The generated files land
    // next to the config, in apps/web/.content-collections.
    contentCollections({ configPath: '../web/content-collections.ts' }),
    sveltekit({
      adapter: adapter()
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      // The Vite server does not read tsconfig paths; the alias mirrors the
      // one declared in tsconfig.json for types.
      'content-collections': fileURLToPath(
        new URL('../web/.content-collections/generated', import.meta.url)
      )
    }
  }
})
