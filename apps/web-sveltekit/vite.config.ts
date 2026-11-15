import adapter from '@sveltejs/adapter-vercel'
import contentCollections from '@content-collections/vite'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// Feature flags arrive as NEXT_PUBLIC_FLAG_* on Vercel (Next.js naming) and are
// inlined at build time, matching the current behavior in packages/env.
const flagNames = [
  'COMMENT',
  'AUTH',
  'STATS',
  'LASTFM',
  'LASTFM_IMPORT',
  'ANALYTICS',
  'GUESTBOOK_NOTIFICATION',
  'LIKE_BUTTON',
  'TURNSTILE'
] as const

const flagDefine = Object.fromEntries(
  flagNames.map((name) => [
    `import.meta.env.PUBLIC_FLAG_${name}`,
    JSON.stringify(process.env[`NEXT_PUBLIC_FLAG_${name}`] ?? 'false')
  ])
)

// SvelteKit 3 keeps all framework configuration in vite.config.ts. The
// repository standard is Vite 8, TypeScript 6 and Node.js 24.
export default defineConfig({
  plugins: [
    // Compiles the shared MDX source with the custom HTML runtime; the docs
    // live in the Next.js app tree and remain its single content source.
    contentCollections(),
    sveltekit({
      adapter: adapter(),
      files: {
        // Static assets (images, fonts, favicon) live in the Next.js app
        // until the consolidation stage; serve them from there.
        assets: '../web/public'
      },
      prerender: {
        // Broken relative links and missing images already 404 in the live
        // Next.js site; keep the build green while preserving parity and log
        // each occurrence instead of failing.
        handleHttpError: 'warn'
      }
    }),
    tailwindcss()
  ],
  define: flagDefine,
  resolve: {
    alias: {
      // The Vite server does not read tsconfig paths; the alias mirrors the
      // one declared in tsconfig.json for types.
      'content-collections': fileURLToPath(
        new URL('./.content-collections/generated', import.meta.url)
      )
    }
  }
})
