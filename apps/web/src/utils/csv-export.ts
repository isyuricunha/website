export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: Array<{ key: keyof T; label: string }>
) => {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  const firstRow = data[0]
  if (!firstRow) {
    console.warn('No data to export')
    return
  }

  // If no columns specified, use all keys from first object
  const columnsToUse =
    columns ??
    (Object.keys(firstRow) as Array<keyof T>).map((key) => ({
      key,
      label: String(key)
    }))

  // Create CSV header
  const headers = columnsToUse.map(col => col.label).join(',')

  // Create CSV rows
  const rows = data.map(item =>
    columnsToUse.map(col => {
      const value = item[col.key]

      // Handle different data types
      if (value === null || value === undefined) {
        return ''
      }

      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = value.replace(/"/g, '""')
        return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
          ? `"${escaped}"`
          : escaped
      }

      if (Object.prototype.toString.call(value) === '[object Date]') {
        return (value as Date).toISOString()
      }

      return String(value)
    }).join(',')
  )

  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n')

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }
}

// Predefined column configurations for common exports
export const USER_EXPORT_COLUMNS = [
  { key: 'id' as const, label: 'ID' },
  { key: 'name' as const, label: 'Name' },
  { key: 'email' as const, label: 'Email' },
  { key: 'username' as const, label: 'Username' },
  { key: 'role' as const, label: 'Role' },
  { key: 'createdAt' as const, label: 'Created At' },
  { key: 'updatedAt' as const, label: 'Updated At' }
]

export const COMMENT_EXPORT_COLUMNS = [
  { key: 'id' as const, label: 'ID' },
  { key: 'userId' as const, label: 'User ID' },
  { key: 'body' as const, label: 'Comment' },
  { key: 'type' as const, label: 'Type' },
  { key: 'createdAt' as const, label: 'Created At' }
]
