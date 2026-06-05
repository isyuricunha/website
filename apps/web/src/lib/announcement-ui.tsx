import type { ReactNode } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Sparkles,
  Wrench
} from 'lucide-react'

type AnnouncementType =
  | 'info'
  | 'warning'
  | 'success'
  | 'error'
  | 'maintenance'
  | 'feature'
  | 'update'

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'info'
  | 'agent'
  | 'warning'

type IconSize = 'sm' | 'md'

type AnnouncementUi = {
  type: AnnouncementType
  icon: ReactNode
  iconContainerClassName: string
  containerClassName: string
  iconClassName: string
  titleClassName: string
  contentClassName: string
  buttonClassName: string
  badgeClassName: string
  badgeVariant: BadgeVariant
}

const normalizeType = (raw: string): AnnouncementType => {
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

const getIconSizeClassName = (size: IconSize): string => {
  return size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
}

export const getAnnouncementUi = (
  rawType: string,
  options?: {
    iconSize?: IconSize
  }
): AnnouncementUi => {
  const type = normalizeType(rawType)
  const iconSize = options?.iconSize ?? 'md'
  const iconClassName = getIconSizeClassName(iconSize)

  if (type === 'error') {
    return {
      type,
      icon: <AlertCircle className={iconClassName} />,
      iconContainerClassName: 'bg-status-danger-soft',
      containerClassName: 'bg-bg-surface border-[var(--status-danger-border)]',
      iconClassName: 'text-status-danger',
      titleClassName: 'text-status-danger',
      contentClassName: 'text-status-danger/80',
      buttonClassName: 'text-status-danger/80 hover:text-status-danger',
      badgeClassName:
        'bg-status-danger-soft text-status-danger border-[var(--status-danger-border)]',
      badgeVariant: 'destructive'
    }
  }

  if (type === 'warning' || type === 'maintenance') {
    return {
      type,
      icon:
        type === 'maintenance' ? (
          <Wrench className={iconClassName} />
        ) : (
          <AlertTriangle className={iconClassName} />
        ),
      iconContainerClassName: 'bg-action-primary-soft',
      containerClassName: 'bg-bg-surface border-[var(--action-primary-border)]',
      iconClassName: 'text-accent-gold',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName:
        'bg-action-primary-soft text-accent-gold border-[var(--action-primary-border)]',
      badgeVariant: 'warning'
    }
  }

  if (type === 'success') {
    return {
      type,
      icon: <CheckCircle className={iconClassName} />,
      iconContainerClassName: 'bg-status-success-soft',
      containerClassName: 'bg-bg-surface border-[var(--status-success-border)]',
      iconClassName: 'text-status-success',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName:
        'bg-status-success-soft text-status-success border-[var(--status-success-border)]',
      badgeVariant: 'success'
    }
  }

  if (type === 'feature') {
    return {
      type,
      icon: <Sparkles className={iconClassName} />,
      iconContainerClassName: 'bg-status-agent-soft',
      containerClassName: 'bg-bg-surface border-[var(--status-agent-border)]',
      iconClassName: 'text-status-agent',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName: 'bg-status-agent-soft text-status-agent border-[var(--status-agent-border)]',
      badgeVariant: 'agent'
    }
  }

  if (type === 'update') {
    return {
      type,
      icon: <RefreshCw className={iconClassName} />,
      iconContainerClassName: 'bg-status-info-soft',
      containerClassName: 'bg-bg-surface border-[var(--status-info-border)]',
      iconClassName: 'text-status-info',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName: 'bg-status-info-soft text-status-info border-[var(--status-info-border)]',
      badgeVariant: 'info'
    }
  }

  return {
    type,
    icon: <Info className={iconClassName} />,
    iconContainerClassName: 'bg-status-info-soft',
    containerClassName: 'bg-bg-surface border-[var(--status-info-border)]',
    iconClassName: 'text-status-info',
    titleClassName: 'text-foreground',
    contentClassName: 'text-muted-foreground',
    buttonClassName: 'text-muted-foreground hover:text-foreground',
    badgeClassName: 'bg-status-info-soft text-status-info border-[var(--status-info-border)]',
    badgeVariant: 'info'
  }
}
