import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  // MDX runtime aliases jsxs to jsx by design (same pattern as React).
  exclude: ['duplicates'],
  ignore: [
    'apps/web/public/sw.js',
    // Referenced by name from the [[lang=locale]] param in routes, not by
    // an import; the SvelteKit runtime resolves it at build time.
    'apps/web/src/params.ts',
    'apps/web/src/tests/stubs/**',
    'packages/db/src/migrations/**'
  ],
  vitest: {
    config: ['vitest.{config,shared,workspace}.ts']
  },
  ignoreDependencies: ['@isyuricunha/tsconfig'],
  workspaces: {
    '.': {
      entry: ['scripts/vercel-ignore.js']
    },
    'apps/docs': {
      entry: ['content-collections.ts', 'src/routes/**/*.{ts,svelte}']
    },
    'apps/web': {
      // Referenced only through vi.mock factories in tests.
      ignoreDependencies: ['@isyuricunha/env'],
      entry: [
        'content-collections.ts',
        'src/routes/**/*.{ts,svelte}',
        // Markdown is data, not imported code; index it as entries.
        'src/content/**/*.mdx'
      ]
    },
    'packages/eslint-config': {
      // @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/325
    }
  }
}

export default config
