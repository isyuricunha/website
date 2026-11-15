export type SelfServiceDeletionBlockReason =
  'administrator' | 'anonymous-account' | 'unverified-email' | 'unsupported-role'

type DeletionCandidate = {
  role?: string | null
  email: string
  emailVerified: boolean
  isAnonymous?: boolean | null
}

export const getSelfServiceDeletionBlockReason = (
  user: DeletionCandidate
): SelfServiceDeletionBlockReason | null => {
  if (user.role === 'admin') return 'administrator'
  if (user.role !== 'user') return 'unsupported-role'
  if (user.isAnonymous === true || /^temp-[^@]+@yuricunha\.com$/i.test(user.email)) {
    return 'anonymous-account'
  }
  if (!user.emailVerified) return 'unverified-email'

  return null
}
