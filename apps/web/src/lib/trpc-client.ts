import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { SuperJSON } from 'superjson'
import type { AppRouter } from '@isyuricunha/trpc-server/root'

/**
 * Vanilla tRPC client for Svelte components. Same endpoint and transformer
 * contract as the Next.js React provider.
 */
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: SuperJSON
    })
  ]
})
