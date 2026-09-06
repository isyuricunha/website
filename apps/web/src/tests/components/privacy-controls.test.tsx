import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from '@isyuricunha/i18n/client'
import messages from '@isyuricunha/i18n/messages/en.json'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { deleteUserMock } = vi.hoisted(() => ({ deleteUserMock: vi.fn() }))

vi.mock('@/lib/auth-client', () => ({
  deleteUser: deleteUserMock
}))

describe('<PrivacyControls />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteUserMock.mockResolvedValue({ data: { success: true }, error: null })
  })

  const renderControls = async (canDelete = true) => {
    const { default: PrivacyControls } = await import('@/components/account/privacy-controls')

    return render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <PrivacyControls email='alice@example.com' canDelete={canDelete} />
      </NextIntlClientProvider>
    )
  }

  it('offers a same-origin data download', async () => {
    await renderControls()

    expect(screen.getByRole('link', { name: 'Download my data' })).toHaveAttribute(
      'href',
      '/api/account/data-export'
    )
  })

  it('keeps deletion confirmation in a separate dialog', async () => {
    await renderControls()

    expect(screen.queryByLabelText('Type your email to continue')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }))

    const button = screen.getByRole('button', { name: 'Send confirmation email' })
    expect(button).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Type your email to continue'), {
      target: { value: 'alice@example.com' }
    })
    expect(button).toBeEnabled()

    fireEvent.click(button)

    await waitFor(() => {
      expect(deleteUserMock).toHaveBeenCalledWith({ callbackURL: '/' })
    })
  })

  it('does not expose the deletion action for ineligible accounts', async () => {
    await renderControls(false)

    expect(screen.queryByRole('button', { name: 'Request account deletion' })).toBeNull()
    expect(screen.getByText('Contact support for account deletion.')).toBeInTheDocument()
  })
})
