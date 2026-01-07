import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from '@isyuricunha/i18n/client'
import messages from '@isyuricunha/i18n/messages/en.json'
import { describe, expect, it, vi } from 'vitest'

import NotificationsDropdown from '@/components/layout/notifications-dropdown'

const { setIsSignInOpenMock } = vi.hoisted(() => {
  return {
    setIsSignInOpenMock: vi.fn()
  }
})

vi.mock('@/lib/auth-client', () => {
  return {
    useSession: () => ({ data: null, isPending: false })
  }
})

vi.mock('@/store/dialogs', () => {
  return {
    useDialogsStore: () => ({ setIsSignInOpen: setIsSignInOpenMock })
  }
})

vi.mock('@/trpc/react', () => {
  return {
    api: {
      useUtils: () => ({ communication: { getNotifications: { invalidate: vi.fn() } } }),
      communication: {
        getNotifications: {
          useQuery: () => ({ data: undefined })
        },
        markNotificationRead: {
          useMutation: () => ({ mutate: vi.fn() })
        },
        markAllNotificationsRead: {
          useMutation: () => ({ mutate: vi.fn(), isPending: false })
        }
      }
    }
  }
})

describe('<NotificationsDropdown />', () => {
  it('should not open sign-in dialog on bell click when logged out', async () => {
    render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <NotificationsDropdown />
      </NextIntlClientProvider>
    )

    const trigger = screen.getByRole('button', { name: 'Open notifications' })

    fireEvent.pointerDown(trigger)

    expect(setIsSignInOpenMock).not.toHaveBeenCalled()

    expect(await screen.findByText('Sign in to view your notifications.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })
})
