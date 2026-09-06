import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'

describe('AccountDeletion email', () => {
  it.each([
    ['en', 'Confirm account deletion', 'This link expires in 15 minutes'],
    ['pt', 'Confirmar exclusão da conta', 'Este link expira em 15 minutos']
  ] as const)('renders safe %s copy and the verification URL', async (locale, button, expiry) => {
    const { AccountDeletion } = await import('@isyuricunha/emails')
    const confirmationUrl = 'https://yuricunha.com/api/auth/delete-user/callback?token=test-token'

    const view = await render(
      AccountDeletion({ name: '<script>alert(1)</script>', confirmationUrl, locale })
    )

    expect(view).toContain(button)
    expect(view).toContain(expiry)
    expect(view).toContain(confirmationUrl.replaceAll('&', '&amp;'))
    expect(view).not.toContain('<script>alert(1)</script>')
  })
})
