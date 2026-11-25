export const MASCOT_AVATAR_SRC = '/images/nery/avatar.webp'

const poses = [
  MASCOT_AVATAR_SRC,
  '/images/nery/happy.webp',
  '/images/nery/coffee.webp',
  '/images/nery/with-cat.webp',
  '/images/nery/sleeping.webp',
  '/images/nery/fullbody.webp',
  '/images/nery/thinking.webp',
  '/images/nery/coding.webp',
  '/images/nery/thinking.webp'
] as const

export const getMascotImage = (index: number) => poses[index] ?? MASCOT_AVATAR_SRC

export const isIdleMascotImage = (index: number) =>
  Number.isSafeInteger(index) && index >= 1 && index <= 5
