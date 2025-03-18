import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@tszhong0411/utils'

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root>

const Avatar = (props: AvatarProps) => {
  const { className, ...rest } = props

  return (
    <AvatarPrimitive.Root
      className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}
      {...rest}
    />
  )
}

type AvatarImageProps = React.ComponentProps<typeof AvatarPrimitive.Image>

const AvatarImage = (props: AvatarImageProps) => {
  const { className, ...rest } = props

  return <AvatarPrimitive.Image className={cn('aspect-square size-full', className)} {...rest} />
}

type AvatarFallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback>

const AvatarFallback = (props: AvatarFallbackProps) => {
  const { className, ...rest } = props

  return (
    <AvatarPrimitive.Fallback
      className={cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
      {...rest}
    />
  )
}

const getAvatarAbbreviation = (name: string) => {
  const abbreviation = name
    .split(' ')
    .map((n) => n[0])
    .join('')

  if (abbreviation.length > 2) {
    return abbreviation.slice(0, 2)
  }

  return abbreviation
}

export { Avatar, AvatarFallback, AvatarImage, getAvatarAbbreviation }
