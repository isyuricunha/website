import { describe, expect, it } from 'vitest'

describe('getSelfServiceDeletionBlockReason', () => {
  it('allows a regular user with a verified email', async () => {
    const { getSelfServiceDeletionBlockReason } =
      await import('@/lib/privacy/account-deletion-policy')

    expect(
      getSelfServiceDeletionBlockReason({
        role: 'user',
        email: 'alice@example.com',
        emailVerified: true,
        isAnonymous: false
      })
    ).toBeNull()
  })

  it.each([
    [
      'administrator',
      { role: 'admin', email: 'admin@example.com', emailVerified: true, isAnonymous: false }
    ],
    [
      'anonymous-account',
      { role: 'user', email: 'temp-123@yuricunha.com', emailVerified: true, isAnonymous: true }
    ],
    [
      'unverified-email',
      { role: 'user', email: 'alice@example.com', emailVerified: false, isAnonymous: false }
    ],
    [
      'unsupported-role',
      { role: 'unknown', email: 'alice@example.com', emailVerified: true, isAnonymous: false }
    ]
  ])('blocks %s accounts', async (expectedReason, user) => {
    const { getSelfServiceDeletionBlockReason } =
      await import('@/lib/privacy/account-deletion-policy')

    expect(getSelfServiceDeletionBlockReason(user)).toBe(expectedReason)
  })
})
