import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from '@isyuricunha/i18n/client'
import messages from '@isyuricunha/i18n/messages/en.json'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * Loading states must use the canonical skeleton sweep, not dead "--"
 * placeholders and not Tailwind's generic opacity pulse. These tests pin the
 * pending-state DOM: skeleton bars visible, no fake values, no "--".
 */

type CounterQuery = {
  status: 'pending' | 'success' | 'error'
  data?: { views: number; likes: number; currentUserLikes: number }
}

const queryState = vi.hoisted((): { views: CounterQuery; likes: CounterQuery } => ({
  views: { status: 'pending', data: undefined },
  likes: { status: 'pending', data: undefined }
}))

vi.mock('@/trpc/react', () => ({
  api: {
    views: {
      get: {
        useQuery: vi.fn(() => queryState.views)
      }
    },
    likes: {
      get: {
        useQuery: vi.fn(() => queryState.likes)
      }
    }
  }
}))

vi.mock('@/hooks/use-formatted-date', () => ({
  useFormattedDate: vi.fn(() => 'Jan 1, 2026')
}))

vi.mock('@isyuricunha/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@isyuricunha/ui')>()

  const FakeBlurImage = (props: { alt?: string }) => {
    const React = require('react') as typeof import('react')
    return React.createElement('div', {
      'data-testid': 'blur-image',
      role: 'img',
      'aria-label': props.alt
    })
  }

  // Keep the REAL Skeleton: the assertion target is its .yu-skeleton class.
  return { ...actual, BlurImage: FakeBlurImage }
})

vi.mock('./link', () => {
  const React = require('react') as typeof import('react')
  const FakeLink = (props: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href: props.href }, props.children)
  return { default: FakeLink }
})

const renderCard = async () => {
  const { default: PostCards } = await import('@/components/post-cards')

  const post = {
    slug: 'hello-world',
    title: 'Hello world',
    summary: 'A summary',
    date: '2026-01-01T00:00:00.000Z',
    featured: false
  }

  return render(
    <NextIntlClientProvider locale='en' messages={messages}>
      <PostCards posts={[post as never]} />
    </NextIntlClientProvider>
  )
}

describe('<PostCards /> loading states', () => {
  beforeEach(() => {
    queryState.views = { status: 'pending', data: undefined }
    queryState.likes = { status: 'pending', data: undefined }
  })

  it('shows canonical skeleton bars while likes and views are pending', async () => {
    await renderCard()

    const skeletons = screen.getAllByTestId('counter-skeleton')
    expect(skeletons).toHaveLength(2)
    expect(skeletons[0]).toHaveClass('yu-skeleton')

    // No dead placeholder text, no fabricated counters.
    expect(screen.queryByText('--')).not.toBeInTheDocument()
    expect(screen.queryByText(/likes/)).not.toBeInTheDocument()
    expect(screen.queryByText(/views/)).not.toBeInTheDocument()
  })

  it('replaces the skeletons with real counters once queries succeed', async () => {
    queryState.views = { status: 'success', data: { views: 120, likes: 3, currentUserLikes: 0 } }
    queryState.likes = { status: 'success', data: { views: 120, likes: 3, currentUserLikes: 0 } }

    await renderCard()

    expect(screen.getByText('120 views')).toBeInTheDocument()
    expect(screen.getByText('3 likes')).toBeInTheDocument()
    expect(screen.queryByTestId('counter-skeleton')).not.toBeInTheDocument()
  })
})
