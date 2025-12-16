import { describe, expect, it } from 'vitest'

import { calculate_visible_count } from '@/utils/navbar-overflow'

describe('calculate_visible_count', () => {
  it('returns all items when everything fits', () => {
    const visible = calculate_visible_count({
      availableWidth: 200,
      itemWidths: [50, 50, 50],
      moreWidth: 40,
      gapPx: 8
    })

    expect(visible).toBe(3)
  })

  it('reserves space for the more button when overflow exists', () => {
    // 3 items (50 each) + 2 gaps (8) = 166 (does not fit in 140)
    // best is 1 item (50) + gap (8) + more (40) = 98 (fits)
    const visible = calculate_visible_count({
      availableWidth: 140,
      itemWidths: [50, 50, 50],
      moreWidth: 40,
      gapPx: 8
    })

    expect(visible).toBe(1)
  })

  it('can return 0 when even one item plus more does not fit', () => {
    const visible = calculate_visible_count({
      availableWidth: 60,
      itemWidths: [50, 50],
      moreWidth: 40,
      gapPx: 8
    })

    expect(visible).toBe(0)
  })

  it('returns 0 for empty items', () => {
    const visible = calculate_visible_count({
      availableWidth: 100,
      itemWidths: [],
      moreWidth: 40,
      gapPx: 8
    })

    expect(visible).toBe(0)
  })
})
