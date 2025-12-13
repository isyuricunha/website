import { getClientIp } from '@/lib/spam-detection'

export const getIp = (headersList: Headers) => {
  const ip = getClientIp(headersList)
  return ip === 'unknown' ? '0.0.0.0' : ip
}
