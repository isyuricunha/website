import { createEnv } from '@t3-oss/env-nextjs'
import { vercel } from '@t3-oss/env-nextjs/presets-zod'
import { z } from 'zod'

export const flags = {
  comment: process.env.NEXT_PUBLIC_FLAG_COMMENT === 'true',
  auth: process.env.NEXT_PUBLIC_FLAG_AUTH === 'true',
  stats: process.env.NEXT_PUBLIC_FLAG_STATS === 'true',
  spotify: process.env.NEXT_PUBLIC_FLAG_SPOTIFY === 'true',
  spotifyImport: process.env.NEXT_PUBLIC_FLAG_SPOTIFY_IMPORT === 'true',
  gemini: process.env.NEXT_PUBLIC_FLAG_GEMINI === 'true',
  groq: process.env.NEXT_PUBLIC_FLAG_GROQ === 'true',
  hf: process.env.NEXT_PUBLIC_FLAG_HF === 'true',
  hfLocal: process.env.NEXT_PUBLIC_FLAG_HF_LOCAL === 'true',
  ollama: process.env.NEXT_PUBLIC_FLAG_OLLAMA === 'true',
  analytics: process.env.NEXT_PUBLIC_FLAG_ANALYTICS === 'true',
  guestbookNotification: process.env.NEXT_PUBLIC_FLAG_GUESTBOOK_NOTIFICATION === 'true',
  likeButton: process.env.NEXT_PUBLIC_FLAG_LIKE_BUTTON === 'true',
  turnstile: process.env.NEXT_PUBLIC_FLAG_TURNSTILE === 'true'
}

export const env = createEnv({
  skipValidation: !!process.env.CI,
  extends: [vercel()],

  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
  },

  server: {
    ...(flags.spotify
      ? {
        SPOTIFY_CLIENT_ID: z.string().min(1),
        SPOTIFY_CLIENT_SECRET: z.string().min(1),
        SPOTIFY_REFRESH_TOKEN: z.string().min(1)
      }
      : {}),

    ...(flags.auth
      ? {
        BETTER_AUTH_SECRET: z.string().min(1),
        BETTER_AUTH_URL: z.string().url(),
        GOOGLE_CLIENT_ID: z.string().min(1),
        GOOGLE_CLIENT_SECRET: z.string().min(1),
        GITHUB_CLIENT_ID: z.string().min(1),
        GITHUB_CLIENT_SECRET: z.string().min(1)
      }
      : {}),

    ...(flags.stats
      ? {
        GOOGLE_API_KEY: z.string().min(1),
        GITHUB_TOKEN: z.string().min(1),
        WAKATIME_API_KEY: z.string().min(1)
      }
      : {}),

    RESEND_API_KEY: z.string().min(1),

    ...(flags.comment ? { AUTHOR_EMAIL: z.string().email() } : {}),

    ...(flags.turnstile
      ? {
        TURNSTILE_SECRET_KEY: z.string().min(1)
      }
      : {}),

    ...(flags.guestbookNotification
      ? {
        DISCORD_WEBHOOK_URL: z.string().url()
      }
      : {}),

    ...(flags.likeButton
      ? {
        IP_ADDRESS_SALT: z.string().min(1)
      }
      : {}),

    ...(flags.gemini
      ? {
        GEMINI_API_KEY: z.string().min(1)
      }
      : {}),

    ...(flags.groq
      ? {
        GROQ_API_KEY: z.string().min(1)
      }
      : {}),

    ...((flags.hf || flags.hfLocal)
      ? {
        YUE_LLM_SPACE_URL: z.string().url(),
        YUE_LLM_API_TOKEN: z.string().min(1)
      }
      : {}),

    GEMINI_MODEL: z.string().min(1).optional(),
    GROQ_MODEL: z.string().min(1).optional(),
    YUE_LLM_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).optional(),
    OLLAMA_BASE_URL: z.string().url().optional(),
    OLLAMA_MODEL: z.string().min(1).optional(),

    DATABASE_URL: z.string().url(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    REACT_SCAN_MONITOR_API_KEY: z.string().optional()
  },
  client: {
    ...(flags.analytics
      ? {
        NEXT_PUBLIC_UMAMI_URL: z.string().url(),
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().uuid()
      }
      : {}),

    NEXT_PUBLIC_WEBSITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_FLAG_COMMENT: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_AUTH: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_STATS: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_SPOTIFY: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_SPOTIFY_IMPORT: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_GEMINI: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_GROQ: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_HF: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_HF_LOCAL: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_OLLAMA: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_ANALYTICS: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_GUESTBOOK_NOTIFICATION: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_LIKE_BUTTON: z.string().min(1).optional(),
    NEXT_PUBLIC_FLAG_TURNSTILE: z.string().min(1).optional(),

    ...(flags.turnstile
      ? {
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1)
      }
      : {}),

    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: z.string().min(1).optional()
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_UMAMI_URL: process.env.NEXT_PUBLIC_UMAMI_URL,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,

    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,

    NEXT_PUBLIC_FLAG_COMMENT: process.env.NEXT_PUBLIC_FLAG_COMMENT,
    NEXT_PUBLIC_FLAG_AUTH: process.env.NEXT_PUBLIC_FLAG_AUTH,
    NEXT_PUBLIC_FLAG_STATS: process.env.NEXT_PUBLIC_FLAG_STATS,
    NEXT_PUBLIC_FLAG_SPOTIFY: process.env.NEXT_PUBLIC_FLAG_SPOTIFY,
    NEXT_PUBLIC_FLAG_SPOTIFY_IMPORT: process.env.NEXT_PUBLIC_FLAG_SPOTIFY_IMPORT,
    NEXT_PUBLIC_FLAG_GEMINI: process.env.NEXT_PUBLIC_FLAG_GEMINI,
    NEXT_PUBLIC_FLAG_GROQ: process.env.NEXT_PUBLIC_FLAG_GROQ,
    NEXT_PUBLIC_FLAG_HF: process.env.NEXT_PUBLIC_FLAG_HF,
    NEXT_PUBLIC_FLAG_HF_LOCAL: process.env.NEXT_PUBLIC_FLAG_HF_LOCAL,
    NEXT_PUBLIC_FLAG_OLLAMA: process.env.NEXT_PUBLIC_FLAG_OLLAMA,
    NEXT_PUBLIC_FLAG_ANALYTICS: process.env.NEXT_PUBLIC_FLAG_ANALYTICS,
    NEXT_PUBLIC_FLAG_GUESTBOOK_NOTIFICATION: process.env.NEXT_PUBLIC_FLAG_GUESTBOOK_NOTIFICATION,
    NEXT_PUBLIC_FLAG_LIKE_BUTTON: process.env.NEXT_PUBLIC_FLAG_LIKE_BUTTON,
    NEXT_PUBLIC_FLAG_TURNSTILE: process.env.NEXT_PUBLIC_FLAG_TURNSTILE,

    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,

    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  },

  emptyStringAsUndefined: true
})
