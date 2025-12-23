import { beforeEach, describe, expect, it } from 'vitest'

import {
  addDismissedAnnouncementId,
  addShownAnnouncementToastId,
  addViewedAnnouncementId,
  getDismissedAnnouncementIds,
  getShownAnnouncementToastIds,
  getViewedAnnouncementIds,
  setDismissedAnnouncementIds,
  setShownAnnouncementToastIds,
  setViewedAnnouncementIds
} from '@/utils/announcement-storage'

describe('announcement-storage', () => {
  beforeEach(() => {
    localStorage.clear()
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

  it('stores and retrieves viewed announcement ids', () => {
    setViewedAnnouncementIds(['v1'])
    expect(getViewedAnnouncementIds()).toEqual(['v1'])

    const next = addViewedAnnouncementId(getViewedAnnouncementIds(), 'v2')
    expect(next).toEqual(['v1', 'v2'])
    expect(getViewedAnnouncementIds()).toEqual(['v1', 'v2'])
  })

  it('deduplicates viewed ids when appending', () => {
    setViewedAnnouncementIds(['v1'])
    const next = addViewedAnnouncementId(getViewedAnnouncementIds(), 'v1')
    expect(next).toEqual(['v1'])
    expect(getViewedAnnouncementIds()).toEqual(['v1'])
  })

  it('tolerates corrupted or invalid json by returning empty arrays', () => {
    localStorage.setItem('dismissedAnnouncements', '{')
    localStorage.setItem('shownAnnouncementToasts', 'not-json')
    localStorage.setItem('viewedAnnouncements', '{')

    expect(getDismissedAnnouncementIds()).toEqual([])
    expect(getShownAnnouncementToastIds()).toEqual([])
    expect(getViewedAnnouncementIds()).toEqual([])
  })

  it('tolerates non-string arrays by returning empty arrays', () => {
    localStorage.setItem('dismissedAnnouncements', JSON.stringify([1, 2, 3]))
    localStorage.setItem('shownAnnouncementToasts', JSON.stringify(['ok', 2]))
    localStorage.setItem('viewedAnnouncements', JSON.stringify([1, 2, 3]))

    expect(getDismissedAnnouncementIds()).toEqual([])
    expect(getShownAnnouncementToastIds()).toEqual([])
    expect(getViewedAnnouncementIds()).toEqual([])
  })
})
