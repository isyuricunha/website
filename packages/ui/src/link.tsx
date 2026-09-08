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
  const { href, className, children, variant, target, rel, ...rest } = props

  const isRootRelative = href.startsWith('/') && !href.startsWith('//')
  const isExternalHttp = /^(?:https?:)?\/\//i.test(href)

  if (isRootRelative) {
    return (
      <NextLink
        className={cn(linkVariants({ variant, className }))}
        href={href}
        target={target}
        rel={rel}
        {...rest}
      >
        {children}
      </NextLink>
    )
  }

  return (
    <a
      className={cn(linkVariants({ variant, className }))}
      href={href}
      target={target ?? (isExternalHttp ? '_blank' : undefined)}
      rel={rel ?? (isExternalHttp ? 'noopener noreferrer' : undefined)}
      {...rest}
    >
      {children}
    </a>
  )
}

export { Link, linkVariants }
