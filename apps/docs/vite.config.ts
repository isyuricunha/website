import adapter from '@sveltejs/adapter-vercel'
import contentCollections from '@content-collections/vite'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // Compiles the docs MDX with build-time React SSR for the yutheme
    // component previews; the served output is plain HTML.
    contentCollections(),
    sveltekit({
      adapter: adapter(),
      prerender: {
        handleHttpError: 'warn',
        // The catch-all docs route prerenders whatever the crawl reaches and
        // serves the rest on demand.
        handleUnseenRoutes: 'warn'
      }
    }),
    tailwindcss()
  ],
  ssr: {
    // The yutheme React package imports next/link without an extension, which
    // pure Node ESM cannot resolve; bundling it into the server output lets
    // the Vite resolver handle the peers for build-time component previews.
    noExternal: ['@isyuricunha/yutheme']
  },
  resolve: {
    alias: {
      'content-collections': fileURLToPath(
        new URL('./.content-collections/generated', import.meta.url)
      )
    }
  }
})
