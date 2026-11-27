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
  data?: Record<string, { views: number; likes: number }>
}

const queryState = vi.hoisted((): { stats: CounterQuery } => ({
  stats: { status: 'pending', data: undefined }
}))

vi.mock('@/trpc/react', () => ({
  api: {
    postStats: {
      getBatch: { useQuery: vi.fn(() => queryState.stats) }
    }
  }
}))

vi.mock('@/hooks/use-formatted-date', () => ({
  useFormattedDate: vi.fn(() => 'Jan 1, 2026')
}))

vi.mock('@isyuricunha/yutheme', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@isyuricunha/yutheme')>()

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
    queryState.stats = { status: 'pending', data: undefined }
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
    queryState.stats = {
      status: 'success',
      data: { 'hello-world': { views: 120, likes: 3 } }
    }

    await renderCard()

    expect(screen.getByText('120 views')).toBeInTheDocument()
    expect(screen.getByText('3 likes')).toBeInTheDocument()
    expect(screen.queryByTestId('counter-skeleton')).not.toBeInTheDocument()
  })

  it('keeps the article usable without inventing counters when the query fails', async () => {
    queryState.stats = { status: 'error' }
    await renderCard()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.queryByText(/likes|views|error/i)).not.toBeInTheDocument()
    expect(screen.queryByTestId('counter-skeleton')).not.toBeInTheDocument()
  })

  it('preserves the last successful counters during a failed refetch', async () => {
    queryState.stats = {
      status: 'error',
      data: { 'hello-world': { views: 120, likes: 3 } }
    }
    await renderCard()
    expect(screen.getByText('120 views')).toBeInTheDocument()
    expect(screen.getByText('3 likes')).toBeInTheDocument()
  })
})
