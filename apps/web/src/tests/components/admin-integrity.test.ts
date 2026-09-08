import { describe, expect, it } from 'vitest'

import {
  getNotificationPageStats,
  getSelectionState,
  reconcileSelection
} from '@/components/admin/admin-integrity'

describe('admin integrity helpers', () => {
  it('removes selected users that are no longer in the current result set', () => {
    expect(reconcileSelection(['a', 'gone', 'b'], ['a', 'b', 'new'])).toEqual(['a', 'b'])
  })

  it('reports checked and indeterminate state for visible bulk selections', () => {
    expect(getSelectionState(['a', 'b'], ['a', 'b'])).toEqual({
      checked: true,
      indeterminate: false
    })
    expect(getSelectionState(['a'], ['a', 'b'])).toEqual({
      checked: false,
      indeterminate: true
    })
  })

  it('uses the authoritative total and scopes derived read metrics to the loaded page', () => {
    expect(
      getNotificationPageStats({
        total: 125,
        notifications: [{ read: true }, { read: false }]
      })
    ).toEqual({ total: 125, loaded: 2, unread: 1, readRate: 50, isPageScoped: true })
  })
})
