import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'

describe('ContactConfirmation email', () => {
  it('renders a polished transactional confirmation without mailing-list controls', async () => {
    const { ContactConfirmation } = await import('@isyuricunha/emails')

    const view = await render(
      ContactConfirmation({
        name: 'Marina',
        subject: 'Project inquiry',
        message: 'I would like to discuss a project.',
        locale: 'en'
      })
    )

    expect(view).toContain('Thank you for reaching out, Marina!')
    expect(view).toContain('I will reply within 48 hours.')
    expect(view).not.toContain('Unsubscribe')
    expect(view).not.toContain('dbA')
    expect(view).not.toContain('cloudfront.net')
  })
})
