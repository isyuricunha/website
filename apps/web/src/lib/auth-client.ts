import type { auth } from './auth'

import { toast } from '@tszhong0411/ui'
import {
  adminClient,
  anonymousClient,
  inferAdditionalFields,
  usernameClient
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    usernameClient(),
    adminClient(),
    anonymousClient()
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error('Too many requests. Please try again later.')
      }
    }
  }
})

export const signIn: typeof authClient.signIn = authClient.signIn
export const signUp: typeof authClient.signUp = authClient.signUp
export const signOut: typeof authClient.signOut = authClient.signOut
export const useSession: typeof authClient.useSession = authClient.useSession

export type User = (typeof authClient.$Infer.Session)['user']
