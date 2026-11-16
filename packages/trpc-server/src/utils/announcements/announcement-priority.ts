export const urgentAnnouncementPriorityThreshold = 3
export const criticalAnnouncementPriorityThreshold = 5
export const highPriorityBadgeThreshold = 5

export const isUrgentAnnouncement = (priority: number): boolean => {
  return priority >= urgentAnnouncementPriorityThreshold
}

export const isCriticalAnnouncement = (priority: number): boolean => {
  return priority >= criticalAnnouncementPriorityThreshold
}

export const hasHighPriorityBadge = (priority: number): boolean => {
  return priority > highPriorityBadgeThreshold
}

export const getAnnouncementToastDurationMs = (priority: number): number => {
  return isCriticalAnnouncement(priority) ? Infinity : 10_000
}
