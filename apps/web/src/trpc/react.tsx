'use client'

import type { AppRouter } from './root'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { env } from '@isyuricunha/env'
import { useMemo } from 'react'
import { SuperJSON } from 'superjson'

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5
      }
    }
  })

let browserQueryClient: QueryClient | undefined

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''
  if (env.NEXT_PUBLIC_WEBSITE_URL) return env.NEXT_PUBLIC_WEBSITE_URL
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`
  return 'http://localhost:3000'
}

const getQueryClient = () => {
  // On the server, always create a new QueryClient per request — sharing one
  // across requests would leak data between users.
  if (typeof window === 'undefined') {
    return createQueryClient()
  }

  // In the browser, reuse a single QueryClient across re-renders/navigations.
  // This module-level singleton is only read/written from inside this
  // function (never during render itself), matching tRPC's own documented
  // setup for the Next.js App Router.
  // eslint-disable-next-line unicorn/no-top-level-assignment-in-function, @eslint-react/globals -- documented tRPC/Next.js App Router singleton pattern: https://trpc.io/docs/client/tanstack-react-query/setup#3-create-trpc-hooks
  browserQueryClient ??= createQueryClient()
  return browserQueryClient
}

export const api = createTRPCReact<AppRouter>()

export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

type TRPCReactProviderProps = {
  children: React.ReactNode
}

export const TRPCReactProvider = (props: TRPCReactProviderProps) => {
  const { children } = props
  const queryClient = getQueryClient()

  const trpcClient = useMemo(
    () =>
      api.createClient({
        links: [
          loggerLink({
            enabled: (op) =>
              env.NODE_ENV === 'development' ||
              (op.direction === 'down' && op.result instanceof Error)
          }),
          unstable_httpBatchStreamLink({
            transformer: SuperJSON,
            url: `${getBaseUrl()}/api/trpc`,
            headers: () => {
              const headers = new Headers()
              headers.set('x-trpc-source', 'nextjs-react')

              if (typeof document !== 'undefined') {
                const current_locale = document.documentElement?.lang
                if (current_locale) {
                  headers.set('x-locale', current_locale)
                }
              }

              return headers
            }
          })
        ]
      }),
    []
  )

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
        <ReactQueryDevtools />
      </api.Provider>
    </QueryClientProvider>
  )
}
