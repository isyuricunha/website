import { createAuthClient } from 'better-auth/svelte'
import {
  adminClient,
  anonymousClient,
  inferAdditionalFields,
  usernameClient
} from 'better-auth/client/plugins'
import type { Auth } from '@isyuricunha/trpc-server/auth'

/**
 * Svelte-side Better Auth client. Mirrors the React client plugin set so
 * custom fields (username, admin, anonymous) type the same way.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>(), usernameClient(), adminClient(), anonymousClient()]
})

export const { signIn, signUp, signOut, useSession } = authClient
