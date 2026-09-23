import { useFormatter } from '@isyuricunha/i18n/client'
import dayjs from 'dayjs'
import { useMemo } from 'react'

import type { DateTimeFormatOptions } from '@isyuricunha/i18n/client'

type Options = {
  relative?: boolean
  formatOptions?: DateTimeFormatOptions
}

export const useFormattedDate = (date: Date | string, options: Options = {}) => {
  const {
    relative = false,
    formatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  } = options

  const format = useFormatter()
  const now = useMemo(() => new Date(), [])

  const convertedDate = typeof date === 'string' ? new Date(date) : date

  // An invalid date would make dayjs diff to NaN and then crash the
  // relative-time formatter; fall back to a plain string instead.
  if (Number.isNaN(convertedDate.getTime())) {
    return typeof date === 'string' ? date : ''
  }

  if (relative) {
    const weeksDiff = dayjs().diff(convertedDate, 'week')

    return Math.abs(weeksDiff) > 1
      ? format.dateTime(convertedDate, formatOptions)
      : format.relativeTime(convertedDate, now)
  }

  return format.dateTime(convertedDate, formatOptions)
}
