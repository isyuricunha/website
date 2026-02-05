import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import UserName from '@/components/user/user-name'

describe('<UserName />', () => {
    it('applies glow textShadow when effect is glow', () => {
        render(<UserName name='Yuri' effect='glow' />)

        const el = screen.getByText('Yuri')
        expect(el).toHaveStyle({
            textShadow: '0 0 12px rgba(255,255,255,0.65), 0 0 28px rgba(255,255,255,0.35)'
        })
    })

    it('applies rays textShadow when effect is rays', () => {
        render(<UserName name='Yuri' effect='rays' />)

        const el = screen.getByText('Yuri')
        expect(el).toHaveStyle({
            textShadow: '0 0 10px rgba(255,122,151,0.65), 0 0 26px rgba(255,122,151,0.35)'
        })
    })

    it('does not apply textShadow when effect is none', () => {
        render(<UserName name='Yuri' effect='none' />)

        const el = screen.getByText('Yuri')
        expect(el).toHaveStyle({
            textShadow: ''
        })
    })

    it('applies custom color when provided', () => {
        render(<UserName name='Yuri' color='#ff0000' effect='none' />)

        const el = screen.getByText('Yuri')
        expect(el).toHaveStyle({
            color: 'rgb(255, 0, 0)'
        })
    })
})
