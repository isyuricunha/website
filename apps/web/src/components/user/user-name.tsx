'use client'

import { cn } from '@isyuricunha/utils'

type UserNameProps = {
    name: string
    color?: string | null
    effect?: 'none' | 'rays' | 'glow' | string | null
    className?: string
}

const UserName = (props: UserNameProps) => {
    const { name, color, effect, className } = props

    const resolved_effect = effect ?? 'none'

    return (
        <span
            className={cn(
                'font-semibold',
                resolved_effect === 'glow' && 'drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]',
                resolved_effect === 'rays' && 'drop-shadow-[0_0_14px_rgba(255,122,151,0.35)]',
                className
            )}
            style={color ? { color } : undefined}
        >
            {name}
        </span>
    )
}

export default UserName
