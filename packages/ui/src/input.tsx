import { cn } from '@isyuricunha/utils'

type InputProps = React.ComponentProps<'input'>

const Input = (props: InputProps) => {
  const { className, ...rest } = props

  return (
    <input
      className={cn(
        'border-input ring-offset-background text-foreground flex h-9 w-full rounded-md border bg-[var(--yu-bg-input)] px-3 py-2 text-sm transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
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

export { Input }
