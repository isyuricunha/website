import { cn } from '@isyuricunha/utils'
import { cva, type VariantProps } from 'cva'
import NextLink from 'next/link'

const linkVariants = cva({
  variants: {
    variant: {
      default:
        'text-status-info hover:text-accent-cyan-hover underline-offset-4 transition-colors hover:underline',
      muted: 'text-muted-foreground hover:text-foreground transition-colors'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

type LinkProps = {
  href: string
} & Omit<React.ComponentProps<'a'>, 'href'> &
  VariantProps<typeof linkVariants>

const Link = (props: LinkProps) => {
  const { href, className, children, variant, ...rest } = props

  if (href.startsWith('/')) {
    return (
      <NextLink className={cn(linkVariants({ variant, className }))} href={href} {...rest}>
        {children}
      </NextLink>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a className={cn(linkVariants({ variant, className }))} href={href} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <a
      className={cn(linkVariants({ variant, className }))}
      target='_blank'
      rel='noopener noreferrer'
      href={href}
      {...rest}
    >
      {children}
    </a>
  )
}

export { Link, linkVariants }
