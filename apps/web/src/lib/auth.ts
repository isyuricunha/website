import { db } from '@tszhong0411/db'
import { env } from '@tszhong0411/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'
import { headers } from 'next/headers'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true
  }),
  plugins: [
    username({ minUsernameLength: 3 }) // Permite login por username
  ],
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    }
  },
  user: {
    additionalFields: {
      role: { type: 'string', required: true, input: false, defaultValue: 'user' }
    }
  }
})

export const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers()
  })
}
