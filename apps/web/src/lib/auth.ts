import { render } from '@react-email/render'
import { db } from '@isyuricunha/db'
import { AccountDeletion, EmailVerification, PasswordReset } from '@isyuricunha/emails'
import { env } from '@isyuricunha/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { admin, anonymous, username } from 'better-auth/plugins'
import { headers } from 'next/headers'
import { Resend } from 'resend'

import { logger } from '@/lib/logger'
import { getSelfServiceDeletionBlockReason } from '@/lib/privacy/account-deletion-policy'
import { get_request_locale } from '@/lib/request-locale'
import { sendTransactionalEmail } from '@/lib/transactional-email'

const is_anonymous_email = (email: string) => {
  return /^temp-[^@]+@yuricunha\.com$/i.test(email)
}

const resend = new Resend(env.RESEND_API_KEY)

export const auth = betterAuth({
  rateLimit: {
    customRules: {
      '/delete-user': { window: 3600, max: 3 },
      '/delete-user/callback': { window: 3600, max: 10 }
    }
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true
  }),
  databaseHooks: {
    user: {
      update: {
        before: async (data, ctx) => {
          const auth_session = ctx?.context.session
          if (!auth_session) return { data }

          const current_user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, auth_session.user.id),
            columns: {
              id: true,
              image: true,
              email: true,
              isAnonymous: true
            }
          })

          if (!current_user) return { data }

          if (current_user.isAnonymous) {
            if (data.image !== undefined && data.image !== current_user.image) {
              throw new APIError('FORBIDDEN', {
                message: 'Anonymous users cannot change avatar until they update their email.'
              })
            }

            if (typeof data.email === 'string' && !is_anonymous_email(data.email)) {
              return {
                data: {
                  ...data,
                  isAnonymous: false
                }
              }
            }
          }

          return { data }
        }
      }
    }
  },
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
      const subject_by_locale: Partial<Record<string, string>> = {
        en: 'Reset your password',
        pt: 'Redefina sua senha',
        es: 'Restablece tu contraseña',
        ja: 'パスワードのリセット',
        'zh-CN': '重置密码',
        fr: 'Réinitialisez votre mot de passe',
        de: 'Passwort zurücksetzen'
      }
      const subject = subject_by_locale[locale] ?? 'Reset your password'

      try {
        const html = await render(
          PasswordReset({
            name: user.name,
            resetUrl: url,
            locale
          })
        )

        await sendTransactionalEmail(resend, {
          from: 'yuricunha.com <noreply@yuricunha.com>',
          to: user.email,
          subject,
          html
        })
      } catch (error) {
        logger.error('Failed to send password reset email', error)
        throw error
      }
    },
    onPasswordReset: async ({ user }) => {
      logger.info('Password reset completed', { userId: user.id })
    }
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }, request) => {
      const locale = request?.headers ? get_request_locale(request.headers) : 'en'
      const subject_by_locale: Partial<Record<string, string>> = {
        en: 'Verify your email',
        pt: 'Verifique seu e-mail',
        es: 'Verifica tu correo electrónico',
        ja: 'メールアドレスの確認',
        'zh-CN': '验证您的电子邮箱',
        fr: 'Vérifiez votre e-mail',
        de: 'Bestätigen Sie Ihre E-Mail-Adresse'
      }
      const subject = subject_by_locale[locale] ?? 'Verify your email'

      try {
        const html = await render(
          EmailVerification({
            name: user.name,
            verifyUrl: url,
            locale
          })
        )

        await sendTransactionalEmail(resend, {
          from: 'yuricunha.com <noreply@yuricunha.com>',
          to: user.email,
          subject,
          html
        })
      } catch (error) {
        logger.error('Failed to send verification email', error)
        throw error
      }
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
    deleteUser: {
      enabled: true,
      deleteTokenExpiresIn: 15 * 60,
      sendDeleteAccountVerification: async ({ user, url }, request) => {
        const candidate = user as typeof user & {
          role?: string | null
          isAnonymous?: boolean | null
        }
        const blockReason = getSelfServiceDeletionBlockReason(candidate)

        if (blockReason) {
          throw new APIError('FORBIDDEN', {
            message: 'Self-service account deletion is unavailable for this account.'
          })
        }

        const locale = request?.headers ? get_request_locale(request.headers) : 'en'
        const subject =
          (
            {
              en: 'Confirm account deletion',
              pt: 'Confirme a exclusão da sua conta',
              es: 'Confirma la eliminación de tu cuenta',
              ja: 'アカウント削除の確認',
              'zh-CN': '确认删除账户',
              fr: 'Confirmer la suppression du compte',
              de: 'Kontolöschung bestätigen'
            } as Record<string, string>
          )[locale] ?? 'Confirm account deletion'
        const html = await render(
          AccountDeletion({
            name: user.name,
            confirmationUrl: url,
            locale
          })
        )
        try {
          await sendTransactionalEmail(resend, {
            from: 'yuricunha.com <noreply@yuricunha.com>',
            to: user.email,
            subject,
            html
          })
        } catch (error) {
          logger.error('Failed to send account deletion confirmation email', error)
          throw new APIError('INTERNAL_SERVER_ERROR', {
            message: 'Unable to send account deletion confirmation.'
          })
        }
      },
      beforeDelete: async (user) => {
        const candidate = user as typeof user & {
          role?: string | null
          isAnonymous?: boolean | null
        }
        const blockReason = getSelfServiceDeletionBlockReason(candidate)

        if (blockReason) {
          throw new APIError('FORBIDDEN', {
            message: 'Self-service account deletion is unavailable for this account.'
          })
        }
      }
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
