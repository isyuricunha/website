import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@isyuricunha/trpc-server/root'
import { createTRPCContext } from '@isyuricunha/trpc-server/trpc'
import type { RequestHandler } from './$types'

// Same tRPC contract as the Next.js implementation (endpoint /api/trpc,
// SuperJSON transformer, request-scoped context).
const handleAll: RequestHandler = ({ request }) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: request.headers,
        method: request.method,
        url: new URL(request.url).pathname
      })
  })
}

export const GET: RequestHandler = handleAll
export const POST: RequestHandler = handleAll
