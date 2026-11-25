import { describe, expect, it } from 'vitest'

import {
  getMascotImage,
  isIdleMascotImage,
  MASCOT_AVATAR_SRC
} from '@/components/mascot/mascot-art'

describe('Nery artwork registry', () => {
  it.each([1, 2, 3, 4, 5])('retains the stored idle pose %s', (index) => {
    expect(isIdleMascotImage(index)).toBe(true)
    expect(getMascotImage(index)).toMatch(/^\/images\/nery\/.+\.webp$/)
  })

  it.each([0, -1, 1.5, 6, 8, 9, NaN, Infinity])(
    'rejects non-idle or invalid stored values: %s',
    (index) => {
      expect(isIdleMascotImage(index)).toBe(false)
    }
  )

  it('maps context-dependent poses and safely falls back to the portrait', () => {
    expect(getMascotImage(6)).toBe('/images/nery/thinking.webp')
    expect(getMascotImage(7)).toBe('/images/nery/coding.webp')
    expect(getMascotImage(8)).toBe('/images/nery/thinking.webp')
    expect(getMascotImage(999)).toBe(MASCOT_AVATAR_SRC)
    expect(getMascotImage(NaN)).toBe(MASCOT_AVATAR_SRC)
  })
})
