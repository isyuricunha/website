import { cn } from '@isyuricunha/utils'
import TextareaAutosize, { type TextareaAutosizeProps } from 'react-textarea-autosize'

type TextareaProps = TextareaAutosizeProps & React.ComponentProps<'textarea'>

const Textarea = (props: TextareaProps) => {
  const { className, ...rest } = props

  return (
    <TextareaAutosize
      className={cn(
        'border-input ring-offset-background text-foreground flex min-h-20 w-full rounded-md border bg-[var(--yu-bg-input)] px-3 py-2 text-sm transition-colors',
        'placeholder:text-muted-foreground',
        'hover:bg-[var(--yu-bg-input-hover)]',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...rest}
    />
  )
}

export { Textarea }
