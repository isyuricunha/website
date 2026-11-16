// Feature flags mirroring packages/env (default off). Build-time inlined by the
// vite define mapping from NEXT_PUBLIC_FLAG_* so no new env vars are required.
export const flags = {
  comment: import.meta.env.PUBLIC_FLAG_COMMENT === 'true',
  auth: import.meta.env.PUBLIC_FLAG_AUTH === 'true',
  stats: import.meta.env.PUBLIC_FLAG_STATS === 'true',
  lastfm: import.meta.env.PUBLIC_FLAG_LASTFM === 'true',
  lastfmImport: import.meta.env.PUBLIC_FLAG_LASTFM_IMPORT === 'true',
  analytics: import.meta.env.PUBLIC_FLAG_ANALYTICS === 'true',
  guestbookNotification: import.meta.env.PUBLIC_FLAG_GUESTBOOK_NOTIFICATION === 'true',
  likeButton: import.meta.env.PUBLIC_FLAG_LIKE_BUTTON === 'true',
  turnstile: import.meta.env.PUBLIC_FLAG_TURNSTILE === 'true'
} as const
