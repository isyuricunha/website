import { cn } from '@isyuricunha/utils'

type CardProps = React.ComponentProps<'div'>

const Card = (props: CardProps) => {
  const { className, ...rest } = props

  return (
    <div
      className={cn('bg-card text-card-foreground shadow-xs rounded-lg border', className)}
      {...rest}
    />
  )
}

type CardHeaderProps = React.ComponentProps<'div'>

const CardHeader = (props: CardHeaderProps) => {
  const { className, ...rest } = props

  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...rest} />
}

type CardTitleProps = React.ComponentProps<'h3'>

const CardTitle = (props: CardTitleProps) => {
  const { className, children, ...rest } = props

  return (
    <h3 className={cn('text-2xl font-semibold', className)} {...rest}>
      {children}
    </h3>
  )
}

type CardDescriptionProps = React.ComponentProps<'p'>

const CardDescription = (props: CardDescriptionProps) => {
  const { className, ...rest } = props

  return <p className={cn('text-muted-foreground text-sm', className)} {...rest} />
}

type CardContentProps = React.ComponentProps<'div'>

const CardContent = (props: CardContentProps) => {
  const { className, ...rest } = props

  return <div className={cn('px-6 pb-6', className)} {...rest} />
}

type CardFooterProps = React.ComponentProps<'div'>

const CardFooter = (props: CardFooterProps) => {
  const { className, ...rest } = props

  return <div className={cn('flex items-center px-6 pb-6', className)} {...rest} />
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
