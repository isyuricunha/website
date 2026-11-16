export type NotificationPage = {
  total: number
  notifications: Array<{ read: boolean }>
}

export const reconcileSelection = (selectedIds: string[], visibleIds: string[]) => {
  const visible = new Set(visibleIds)
  return selectedIds.filter((id) => visible.has(id))
}

export const getSelectionState = (selectedIds: string[], visibleIds: string[]) => {
  const selected = new Set(selectedIds)
  const selectedVisibleCount = visibleIds.filter((id) => selected.has(id)).length

  return {
    checked: visibleIds.length > 0 && selectedVisibleCount === visibleIds.length,
    indeterminate: selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length
  }
}

export const getNotificationPageStats = (data: NotificationPage) => {
  const loaded = data.notifications.length
  const unread = data.notifications.filter((notification) => !notification.read).length
  const read = loaded - unread

  return {
    total: data.total,
    loaded,
    unread,
    readRate: loaded > 0 ? Math.round((read / loaded) * 100) : 0,
    isPageScoped: true
  }
}
