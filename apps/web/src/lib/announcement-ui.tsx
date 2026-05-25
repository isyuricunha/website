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

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

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
      iconContainerClassName: 'bg-destructive/10',
      containerClassName: 'bg-bg-surface border-destructive/20',
      iconClassName: 'text-destructive',
      titleClassName: 'text-destructive',
      contentClassName: 'text-destructive/80',
      buttonClassName: 'text-destructive/80 hover:text-destructive',
      badgeClassName: 'bg-destructive/10 text-destructive border-destructive/20',
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
      iconContainerClassName: 'bg-[var(--accent-dim)]',
      containerClassName: 'bg-bg-surface border-[var(--accent-border)]',
      iconClassName: 'text-accent-earth-text',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName: 'bg-[var(--accent-dim)] text-accent-earth-text border-[var(--accent-border)]',
      badgeVariant: 'secondary'
    }
  }

  if (type === 'success') {
    return {
      type,
      icon: <CheckCircle className={iconClassName} />,
      iconContainerClassName: 'bg-[var(--accent-dim)]',
      containerClassName: 'bg-bg-surface border-[var(--accent-border)]',
      iconClassName: 'text-accent-earth-text',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName: 'bg-[var(--accent-dim)] text-accent-earth-text border-[var(--accent-border)]',
      badgeVariant: 'default'
    }
  }

  if (type === 'feature') {
    return {
      type,
      icon: <Sparkles className={iconClassName} />,
      iconContainerClassName: 'bg-[var(--accent-dim)]',
      containerClassName: 'bg-bg-surface border-[var(--accent-border)]',
      iconClassName: 'text-accent-earth-text',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName: 'bg-[var(--accent-dim)] text-accent-earth-text border-[var(--accent-border)]',
      badgeVariant: 'secondary'
    }
  }

  if (type === 'update') {
    return {
      type,
      icon: <RefreshCw className={iconClassName} />,
      iconContainerClassName: 'bg-[var(--accent-dim)]',
      containerClassName: 'bg-bg-surface border-[var(--accent-border)]',
      iconClassName: 'text-accent-earth-text',
      titleClassName: 'text-foreground',
      contentClassName: 'text-muted-foreground',
      buttonClassName: 'text-muted-foreground hover:text-foreground',
      badgeClassName: 'bg-[var(--accent-dim)] text-accent-earth-text border-[var(--accent-border)]',
      badgeVariant: 'outline'
    }
  }

  return {
    type,
    icon: <Info className={iconClassName} />,
    iconContainerClassName: 'bg-[var(--accent-dim)]',
    containerClassName: 'bg-bg-surface border-[var(--accent-border)]',
    iconClassName: 'text-accent-earth-text',
    titleClassName: 'text-foreground',
    contentClassName: 'text-muted-foreground',
    buttonClassName: 'text-muted-foreground hover:text-foreground',
    badgeClassName: 'bg-[var(--accent-dim)] text-accent-earth-text border-[var(--accent-border)]',
    badgeVariant: 'outline'
  }
}
