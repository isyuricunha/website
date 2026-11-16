// Announcement presentation mapping by type, mirroring the Next.js app
// implementation without React nodes: icons are referenced by id and resolved
// by the Svelte icon component.
export type AnnouncementType =
  'info' | 'warning' | 'success' | 'error' | 'maintenance' | 'feature' | 'update'

export type AnnouncementUi = {
  type: AnnouncementType
  iconId:
    | 'alert-circle'
    | 'alert-triangle'
    | 'check-circle'
    | 'sparkles'
    | 'refresh-cw'
    | 'wrench'
    | 'info'
  iconContainerClassName: string
  containerClassName: string
  iconClassName: string
  titleClassName: string
  contentClassName: string
  buttonClassName: string
  badgeClassName: string
}

export const normalizeAnnouncementType = (raw: string): AnnouncementType => {
  switch (raw) {
    case 'info':
    case 'warning':
    case 'success':
    case 'error':
    case 'maintenance':
    case 'feature':
    case 'update':
      return raw
    default:
      return 'info'
  }
}

export const getAnnouncementUi = (
  rawType: string,
  options?: {
    iconSize?: 'sm' | 'md'
  }
): AnnouncementUi => {
  const type = normalizeAnnouncementType(rawType)
  const iconClassName = options?.iconSize === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  if (type === 'error') {
    return {
      type,
      iconId: 'alert-circle',
      iconContainerClassName: 'bg-status-danger-soft',
      containerClassName: 'bg-bg-surface border-[var(--status-danger-border)]',
      iconClassName: 'text-status-danger',
      titleClassName: 'text-status-danger',
      contentClassName: 'text-status-danger/80',
      buttonClassName: 'text-status-danger/80 hover:text-status-danger',
      badgeClassName:
        'bg-status-danger-soft text-status-danger border-[var(--status-danger-border)]'
    }
  }

  if (type === 'warning' || type === 'maintenance') {
    return {
      type,
      iconId: type === 'maintenance' ? 'wrench' : 'alert-triangle',
      iconContainerClassName: 'bg-action-primary-soft',
      containerClassName: 'bg-bg-surface border-[var(--action-primary-border)]',
      iconClassName: 'text-accent-gold',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName:
        'bg-action-primary-soft text-accent-gold border-[var(--action-primary-border)]'
    }
  }

  if (type === 'success') {
    return {
      type,
      iconId: 'check-circle',
      iconContainerClassName: 'bg-status-success-soft',
      containerClassName: 'bg-bg-surface border-[var(--status-success-border)]',
      iconClassName: 'text-status-success',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName:
        'bg-status-success-soft text-status-success border-[var(--status-success-border)]'
    }
  }

  if (type === 'feature') {
    return {
      type,
      iconId: 'sparkles',
      iconContainerClassName: 'bg-status-agent-soft',
      containerClassName: 'bg-bg-surface border-[var(--status-agent-border)]',
      iconClassName: 'text-status-agent',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName: 'bg-status-agent-soft text-status-agent border-[var(--status-agent-border)]'
    }
  }

  if (type === 'update') {
    return {
      type,
      iconId: 'refresh-cw',
      iconContainerClassName: 'bg-status-info-soft',
      containerClassName: 'bg-bg-surface border-[var(--status-info-border)]',
      iconClassName: 'text-status-info',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName: 'bg-status-info-soft text-status-info border-[var(--status-info-border)]'
    }
  }

  return {
    type,
    iconId: 'info',
    iconContainerClassName: 'bg-status-info-soft',
    containerClassName: 'bg-bg-surface border-[var(--status-info-border)]',
    iconClassName: 'text-status-info',
    titleClassName: 'text-foreground',
    contentClassName: 'text-muted-foreground',
    buttonClassName: 'text-muted-foreground hover:text-foreground',
    badgeClassName: 'bg-status-info-soft text-status-info border-[var(--status-info-border)]'
  }
}
