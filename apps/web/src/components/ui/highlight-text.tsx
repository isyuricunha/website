interface HighlightTextProps {
  text: string
  searchTerm: string
  className?: string
  highlightClassName?: string
}

export function HighlightText({
  text,
  searchTerm,
  className = '',
  highlightClassName = 'rounded bg-[var(--accent-dim)] px-0.5 text-accent-earth-text'
}: HighlightTextProps) {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>
  }

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi')
  const parts = text.split(regex)
  const normalizedSearchTerm = searchTerm.toLowerCase()

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === normalizedSearchTerm ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  )
}
