'use client'

import type { CSSProperties } from 'react'

import { cn } from '@isyuricunha/utils'

type NameEffect = 'none' | 'rays' | 'glow'

type UserNameProps = {
  name: string
  color?: string | null
  effect?: NameEffect | null
  className?: string
}

const UserName = (props: UserNameProps) => {
  const { name, color, effect, className } = props

  const resolved_effect = effect ?? 'none'

  const textShadow =
    resolved_effect === 'glow'
      ? '0 0 12px rgba(240,230,200,0.34), 0 0 28px rgba(201,87,42,0.2)'
      : (resolved_effect === 'rays'
        ? '0 0 10px rgba(224,120,72,0.42), 0 0 26px rgba(201,87,42,0.22)'
        : undefined)

  const style: CSSProperties | undefined =
    color || textShadow
      ? {
          color: color ?? undefined,
          textShadow
        }
      : undefined

  return (
    <span className={cn('font-medium', className)} style={style}>
      {name}
    </span>
  )
}

export default UserName
