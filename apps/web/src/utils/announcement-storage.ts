const dismissedKey = 'dismissedAnnouncements'
const shownToastsKey = 'shownAnnouncementToasts'
const viewedAnnouncementsKey = 'viewedAnnouncements'

const safeGetStorage = (): Storage | null => {
  try {
    if (globalThis.window === undefined) return null
    return localStorage
  } catch {
    return null
  }
}

const parseStringArray = (raw: string | null): string[] => {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    if (!parsed.every((item) => typeof item === 'string')) return []
    return parsed
  } catch {
    return []
  }
}

const uniqueAppend = (items: string[], next: string): string[] => {
  if (items.includes(next)) return items
  return [...items, next]
}

export const getDismissedAnnouncementIds = (): string[] => {
  const storage = safeGetStorage()
  if (!storage) return []
  return parseStringArray(storage.getItem(dismissedKey))
}

export const setDismissedAnnouncementIds = (ids: string[]): void => {
  const storage = safeGetStorage()
  if (!storage) return

  try {
    storage.setItem(dismissedKey, JSON.stringify(ids))
  } catch {
    // ignore storage errors
  }
}

export const addDismissedAnnouncementId = (current: string[], announcementId: string): string[] => {
  const next = uniqueAppend(current, announcementId)
  setDismissedAnnouncementIds(next)
  return next
}

export const getShownAnnouncementToastIds = (): string[] => {
  const storage = safeGetStorage()
  if (!storage) return []
  return parseStringArray(storage.getItem(shownToastsKey))
}

export const setShownAnnouncementToastIds = (ids: string[]): void => {
  const storage = safeGetStorage()
  if (!storage) return

  try {
    storage.setItem(shownToastsKey, JSON.stringify(ids))
  } catch {
    // ignore storage errors
  }
}

export const addShownAnnouncementToastId = (
  current: string[],
  announcementId: string
): string[] => {
  const next = uniqueAppend(current, announcementId)
  setShownAnnouncementToastIds(next)
  return next
}

export const getViewedAnnouncementIds = (): string[] => {
  const storage = safeGetStorage()
  if (!storage) return []
  return parseStringArray(storage.getItem(viewedAnnouncementsKey))
}

export const setViewedAnnouncementIds = (ids: string[]): void => {
  const storage = safeGetStorage()
  if (!storage) return

  try {
    storage.setItem(viewedAnnouncementsKey, JSON.stringify(ids))
  } catch {
    // ignore storage errors
  }
}

export const addViewedAnnouncementId = (current: string[], announcementId: string): string[] => {
  const next = uniqueAppend(current, announcementId)
  setViewedAnnouncementIds(next)
  return next
}
