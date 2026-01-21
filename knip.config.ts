import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignore: [
    '**/fixtures/**',
    '**/*.css',
    'apps/web/public/sw.js',
    'apps/web/scripts/vercel-ignore.js',
    'packages/db/src/migrations/**',
    'packages/eslint-config/eslint.config.bundled_*.mjs'
  ],
  vitest: {
    config: ['vitest.{config,shared,workspace}.ts']
  },
  ignoreDependencies: [
    'sharp',
    '@isyuricunha/tsconfig',
    // Can't detect `pnpm with-env tsx`
    'tsx'
  ],
  workspaces: {
    '.': {
      entry: ['scripts/vercel-ignore.js']
    },
    'apps/docs': {
      entry: [
        'content-collections.ts',
        'src/app/**/*.{ts,tsx}',
        'src/components/demos/**/*.tsx',
        'scripts/vercel-ignore.js'
      ]
    },
    'apps/web': {
      entry: ['content-collections.ts', 'src/app/**/*.{ts,tsx}', 'src/e2e/auth.setup.ts']
    },
    'packages/db': {
      entry: ['src/seed.ts']
    },
    'packages/eslint-config': {
      // @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/325
    },
    'packages/ui': {
      // @see https://github.com/shadcn-ui/ui/issues/4792
      ignoreDependencies: ['@radix-ui/react-context']
    }
  }
}

export default config
