import type { NextRequest } from 'next/server'

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { appRouter } from '@/trpc/root'
import { createTRPCContext } from '@/trpc/trpc'
import { env } from '@isyuricunha/env'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const create_trpc_context = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
    method: req.method,
    url: req.nextUrl.pathname
  })
}

const handler = async (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,

    createContext: () => create_trpc_context(req),
    onError:
      env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            logger.error(`tRPC failed on ${path ?? '<no-path>'}`, error)
          }
        : undefined
  })

export { handler as GET, handler as POST }
