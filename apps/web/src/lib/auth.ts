import { render } from '@react-email/components'
import { db } from '@isyuricunha/db'
import { EmailVerification, PasswordReset } from '@isyuricunha/emails'
import { env } from '@isyuricunha/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, anonymous, username } from 'better-auth/plugins'
import { headers } from 'next/headers'
import { Resend } from 'resend'

import { logger } from '@/lib/logger'
import { get_request_locale } from '@/lib/request-locale'

const resend = new Resend(env.RESEND_API_KEY)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true
  }),
  plugins: [
    username({ minUsernameLength: 3 }),
    admin(),
    anonymous({
      emailDomainName: 'yuricunha.com',
      onLinkAccount: () => {
        return
      }
    })
  ],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }, request) => {
      const locale = request?.headers ? get_request_locale(request.headers) : 'en'
      const subject = locale === 'pt' ? 'Redefina sua senha' : 'Reset your password'

      void (async () => {
        const html = await render(
          PasswordReset({
            name: user.name,
            resetUrl: url,
            locale
          })
        )

        await resend.emails.send({
          from: 'yuricunha.com <noreply@yuricunha.com>',
          to: user.email,
          subject,
          html
        })
      })().catch((error) => {
        logger.error('Failed to send password reset email', error)
      })
    },
    onPasswordReset: async ({ user }) => {
      logger.info('Password reset completed', { userId: user.id })
    }
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }, request) => {
      const locale = request?.headers ? get_request_locale(request.headers) : 'en'
      const subject = locale === 'pt' ? 'Verifique seu e-mail' : 'Verify your email'

      void (async () => {
        const html = await render(
          EmailVerification({
            name: user.name,
            verifyUrl: url,
            locale
          })
        )

        await resend.emails.send({
          from: 'yuricunha.com <noreply@yuricunha.com>',
          to: user.email,
          subject,
          html
        })
      })().catch((error) => {
        logger.error('Failed to send verification email', error)
      })
    }
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
    changeEmail: {
      enabled: true
    },
    additionalFields: {
      role: { type: 'string', required: true, input: false, defaultValue: 'user' },
      isAnonymous: { type: 'boolean', required: false, input: false },
      bio: { type: 'string', required: false, input: true },
      isPublic: { type: 'boolean', required: false, input: true },
      nameColor: { type: 'string', required: false, input: true },
      nameEffect: { type: 'string', required: false, input: true, defaultValue: 'none' }
    }
  }
})

export type Auth = typeof auth

export const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers()
  })
}
