import { describe, expect, it } from 'vitest'

import {
  criticalAnnouncementPriorityThreshold,
  getAnnouncementToastDurationMs,
  hasHighPriorityBadge,
  highPriorityBadgeThreshold,
  isCriticalAnnouncement,
  isUrgentAnnouncement,
  urgentAnnouncementPriorityThreshold
} from '@/lib/announcement-priority'

describe('announcement-priority', () => {
  it('keeps thresholds stable', () => {
    expect(urgentAnnouncementPriorityThreshold).toBe(3)
    expect(criticalAnnouncementPriorityThreshold).toBe(5)
    expect(highPriorityBadgeThreshold).toBe(5)
  })

  it('classifies urgent announcements (>= 3)', () => {
    expect(isUrgentAnnouncement(2)).toBe(false)
    expect(isUrgentAnnouncement(3)).toBe(true)
    expect(isUrgentAnnouncement(10)).toBe(true)
  })

  it('classifies critical announcements (>= 5)', () => {
    expect(isCriticalAnnouncement(4)).toBe(false)
    expect(isCriticalAnnouncement(5)).toBe(true)
    expect(isCriticalAnnouncement(10)).toBe(true)
  })

  it('shows high priority badge only for > 5', () => {
    expect(hasHighPriorityBadge(5)).toBe(false)
    expect(hasHighPriorityBadge(6)).toBe(true)
  })

  it('returns correct toast duration (Infinity for critical, 10s otherwise)', () => {
    expect(getAnnouncementToastDurationMs(4)).toBe(10_000)
    expect(getAnnouncementToastDurationMs(5)).toBe(Infinity)
  })
})
