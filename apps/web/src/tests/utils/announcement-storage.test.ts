import { beforeEach, describe, expect, it } from 'vitest'

import {
  addDismissedAnnouncementId,
  addShownAnnouncementToastId,
  getDismissedAnnouncementIds,
  getShownAnnouncementToastIds,
  setDismissedAnnouncementIds,
  setShownAnnouncementToastIds
} from '@/utils/announcement-storage'

describe('announcement-storage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns empty arrays when storage is empty', () => {
    expect(getDismissedAnnouncementIds()).toEqual([])
    expect(getShownAnnouncementToastIds()).toEqual([])
  })

  it('stores and retrieves dismissed announcement ids', () => {
    setDismissedAnnouncementIds(['a1'])
    expect(getDismissedAnnouncementIds()).toEqual(['a1'])

    const next = addDismissedAnnouncementId(getDismissedAnnouncementIds(), 'a2')
    expect(next).toEqual(['a1', 'a2'])
    expect(getDismissedAnnouncementIds()).toEqual(['a1', 'a2'])
  })

  it('deduplicates values when appending', () => {
    setDismissedAnnouncementIds(['a1'])
    const next = addDismissedAnnouncementId(getDismissedAnnouncementIds(), 'a1')
    expect(next).toEqual(['a1'])
    expect(getDismissedAnnouncementIds()).toEqual(['a1'])
  })

  it('stores and retrieves shown toast ids', () => {
    setShownAnnouncementToastIds(['t1'])
    expect(getShownAnnouncementToastIds()).toEqual(['t1'])

    const next = addShownAnnouncementToastId(getShownAnnouncementToastIds(), 't2')
    expect(next).toEqual(['t1', 't2'])
    expect(getShownAnnouncementToastIds()).toEqual(['t1', 't2'])
  })

  it('tolerates corrupted or invalid json by returning empty arrays', () => {
    sessionStorage.setItem('dismissedAnnouncements', '{')
    sessionStorage.setItem('shownAnnouncementToasts', 'not-json')

    expect(getDismissedAnnouncementIds()).toEqual([])
    expect(getShownAnnouncementToastIds()).toEqual([])
  })

  it('tolerates non-string arrays by returning empty arrays', () => {
    sessionStorage.setItem('dismissedAnnouncements', JSON.stringify([1, 2, 3]))
    sessionStorage.setItem('shownAnnouncementToasts', JSON.stringify(['ok', 2]))

    expect(getDismissedAnnouncementIds()).toEqual([])
    expect(getShownAnnouncementToastIds()).toEqual([])
  })
})
