import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import { env } from '@isyuricunha/env'

// Rows written before encryption existed are stored as plain text. New writes
// are AES-256-GCM encrypted and prefixed so reads can tell them apart.
const ENCRYPTION_PREFIX = 'enc1:'

const get_encryption_key = (): Buffer => {
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error('2FA storage requires BETTER_AUTH_SECRET to be configured')
  }

  // NOTE: the key is derived directly from BETTER_AUTH_SECRET. Rotating that
  // secret invalidates every stored 2FA record (they become undecryptable);
  // users must re-enroll. A multi-key migration scheme was deemed out of
  // scope for this codebase size.
  return createHash('sha256').update(`website:two-factor:${env.BETTER_AUTH_SECRET}`).digest()
}

export const encrypt_2fa_value = (value: string): string => {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', get_encryption_key(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [
    ENCRYPTION_PREFIX.replace(':', ''),
    iv.toString('base64'),
    encrypted.toString('base64'),
    authTag.toString('base64')
  ].join(':')
}

export const decrypt_2fa_value = (stored: string): string => {
  if (!stored.startsWith(ENCRYPTION_PREFIX)) {
    // Legacy plaintext row: kept readable so existing 2FA setups keep working.
    return stored
  }

  const parts = stored.split(':')
  if (parts.length !== 4 || !parts[1] || !parts[2] || !parts[3]) {
    throw new Error('Malformed encrypted 2FA value')
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    get_encryption_key(),
    Buffer.from(parts[1], 'base64')
  )
  decipher.setAuthTag(Buffer.from(parts[3], 'base64'))

  return Buffer.concat([
    decipher.update(Buffer.from(parts[2], 'base64')),
    decipher.final()
  ]).toString('utf8')
}
