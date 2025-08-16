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
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded' 
}: HighlightTextProps) {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>
  }

  // Escape special regex characters
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  try {
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi')
    const parts = text.split(regex)

    return (
      <span className={className}>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className={highlightClassName}>
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    )
  } catch (error) {
    // Fallback if regex fails
    return <span className={className}>{text}</span>
  }
}
