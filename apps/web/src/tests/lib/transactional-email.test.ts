import { describe, expect, it, vi } from 'vitest'

import { sendBestEffortEmail, sendTransactionalEmail } from '@/lib/transactional-email'

const email = {
  from: 'yuricunha.com <noreply@yuricunha.com>',
  to: 'marina@example.com',
  subject: 'Verify your email',
  html: '<p>Verify your email</p>'
}

describe('sendTransactionalEmail', () => {
  it('rejects a returned provider error instead of reporting delivery as successful', async () => {
    const send = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'The sending domain is not verified' }
    })

    await expect(sendTransactionalEmail({ emails: { send } }, email)).rejects.toThrow(
      'The sending domain is not verified'
    )
  })

  it('resolves after the provider accepts the email', async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null })

    await expect(sendTransactionalEmail({ emails: { send } }, email)).resolves.toEqual({
      id: 'email-1'
    })
  })
})

describe('sendBestEffortEmail', () => {
  it('records a delivery failure without throwing to the persisted action', async () => {
    const send = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'The sending domain is not verified' }
    })
    const onError = vi.fn()

    await expect(sendBestEffortEmail({ emails: { send } }, email, onError)).resolves.toBe(false)
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
  })
})
