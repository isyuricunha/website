import '@testing-library/jest-dom/vitest'

import * as React from 'react'
import { vi } from 'vitest'

const globalThisTyped = globalThis as unknown as { __NEXT_IMAGE_OPTS?: unknown }

globalThisTyped.__NEXT_IMAGE_OPTS = {
  qualities: [25, 50, 75, 100]
}

const toImgProps = (props: Record<string, unknown>) => {
  const blockedKeys = new Set([
    'lazy',
    'quality',
    'priority',
    'placeholder',
    'blurDataURL',
    'unoptimized',
    'fill',
    'loader'
  ])

  const output: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (blockedKeys.has(key)) continue
    output[key] = value
  }

  const alt = props.alt
  output.alt = typeof alt === 'string' ? alt : ''

  return output
}

vi.mock('next/image', () => {
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => {
      return React.createElement('img', {
        ...toImgProps(props)
      })
    }
  }
})

// eslint-disable react-hooks/rules-of-hooks
vi.mock('next-intl/navigation', () => {
  return {
    __esModule: true,
    createNavigation: () => {
      return {
        Link: (props: any) => {
          const { href, children, ...rest } = props ?? {}
          return React.createElement('a', { href, ...rest }, children)
        },
        useRouter: () => ({
          push: vi.fn(),
          replace: vi.fn(),
          prefetch: vi.fn(),
          back: vi.fn(),
          forward: vi.fn(),
          refresh: vi.fn()
        }),
        usePathname: () => '/',
        useSearchParams: () => new URLSearchParams(),
        useParams: () => ({}),
        redirect: vi.fn(),
        permanentRedirect: vi.fn(),
        notFound: vi.fn()
      }
    },
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn()
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({})
  }
})
// eslint-enable react-hooks/rules-of-hooks

// eslint-disable react-hooks/rules-of-hooks
vi.mock('next/navigation', () => {
  return {
    __esModule: true,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn()
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: vi.fn(),
    permanentRedirect: vi.fn(),
    notFound: vi.fn()
  }
})
// eslint-enable react-hooks/rules-of-hooks

vi.mock('@isyuricunha/ui', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@isyuricunha/ui')>()

  return {
    ...mod,
    BlurImage: (props: Record<string, unknown>) => {
      return React.createElement('img', {
        ...toImgProps(props)
      })
    }
  }
})

const scrollIntoViewMock = vi.fn()

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: scrollIntoViewMock,
  writable: true
})

if (globalThis.HTMLElement) {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: scrollIntoViewMock,
    writable: true
  })
}

if (globalThis.SVGElement) {
  Object.defineProperty(SVGElement.prototype, 'scrollIntoView', {
    value: scrollIntoViewMock,
    writable: true
  })
}
