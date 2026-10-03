import { cn } from '@isyuricunha/utils'

type DotMatrixLoaderProps = {
  /** Accessible name announced through role='status'. */
  label: string
  /** Purple variant for AI thinking/working states. */
  agent?: boolean
} & React.ComponentProps<'div'>

const DotMatrixLoader = (props: DotMatrixLoaderProps) => {
  const { label, agent, className, ...rest } = props

  return (
    <div
      className={cn('yu-dot-matrix', agent && 'yu-dot-matrix--agent', className)}
      role='status'
      aria-label={label}
      {...rest}
    >
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} aria-hidden='true' data-testid='dot' />
      ))}
    </div>
  )
}

export { DotMatrixLoader }
