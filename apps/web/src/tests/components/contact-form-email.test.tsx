import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'

describe('ContactForm email', () => {
  it('renders a self-contained contact notification with the submitted details', async () => {
    const { ContactForm } = await import('@isyuricunha/emails')

    const view = await render(
      ContactForm({
        name: 'Marina',
        email: 'marina@example.com',
        subject: 'Project inquiry',
        message: 'I would like to discuss a project.',
        date: 'September 8, 2026'
      })
    )

    expect(view).toContain('New contact message')
    expect(view).toContain('marina@example.com')
    expect(view).toContain('Project inquiry')
    expect(view).toContain('I would like to discuss a project.')
    expect(view).toContain('September 8, 2026')
    expect(view).not.toContain('new.email')
    expect(view).not.toContain('cloudfront.net')
  })
})
