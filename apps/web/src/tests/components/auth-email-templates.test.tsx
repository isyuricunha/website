import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'

const resetUrl =
  'https://yuricunha.com/api/auth/reset-password/test-token?callbackURL=https%3A%2F%2Fyuricunha.com%2Fen%2Freset-password'
const verificationUrl =
  'https://yuricunha.com/api/auth/verify-email?token=test-token&callbackURL=https%3A%2F%2Fyuricunha.com%2Fen'

describe('authentication email templates', () => {
  it.each([
    ['en', 'Reset your password', 'This link will expire in 1 hour for security reasons.'],
    ['pt', 'Redefinir senha', 'Este link expira em 1 hora por motivos de segurança.']
  ] as const)(
    'renders the password reset link and expiry in %s',
    async (locale, button, expiry) => {
      const { PasswordReset } = await import('@isyuricunha/emails')
      const view = await render(
        PasswordReset({ name: '<script>alert(1)</script>', resetUrl, locale })
      )

      expect(view).toContain(button)
      expect(view).toContain(expiry)
      expect(view).toContain(resetUrl.replaceAll('&', '&amp;'))
      expect(view).toContain('Privacy keeps life yours.')
      expect(view).not.toContain('<script>alert(1)</script>')
    }
  )

  it.each([
    ['en', 'Verify email'],
    ['pt', 'Verificar e-mail']
  ] as const)('renders the email verification link in %s', async (locale, button) => {
    const { EmailVerification } = await import('@isyuricunha/emails')
    const view = await render(
      EmailVerification({ name: '<script>alert(1)</script>', verifyUrl: verificationUrl, locale })
    )

    expect(view).toContain(button)
    expect(view).toContain(verificationUrl.replaceAll('&', '&amp;'))
    expect(view).not.toContain('<script>alert(1)</script>')
  })
})
