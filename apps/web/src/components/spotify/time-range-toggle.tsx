"use client"

import { useTranslations } from '@tszhong0411/i18n/client'

type Props = {
  value: 'short_term' | 'medium_term' | 'long_term'
  onChange: (v: 'short_term' | 'medium_term' | 'long_term') => void
  className?: string
}

const TimeRangeToggle = ({ value, onChange, className }: Props) => {
  const t = useTranslations()
  const opts: Array<{ key: 'short_term' | 'medium_term' | 'long_term'; label: string }> = [
    { key: 'short_term', label: t('spotify.range.short') || 'Last 4 weeks' },
    { key: 'medium_term', label: t('spotify.range.medium') || 'Last 6 months' },
    { key: 'long_term', label: t('spotify.range.long') || 'All time' }
  ]
  return (
    <div className={`inline-flex items-center gap-1 rounded-md bg-muted p-1 text-xs ${className ?? ''}`}>
      {opts.map((o) => (
        <button
          key={o.key}
          type='button'
          onClick={() => onChange(o.key)}
          className={`px-2 py-1 rounded-md transition-colors ${value === o.key ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          aria-pressed={value === o.key}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default TimeRangeToggle
