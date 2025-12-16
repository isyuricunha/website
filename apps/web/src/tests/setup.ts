import '@testing-library/jest-dom/vitest'

import * as React from 'react'
import { vi } from 'vitest'
;

(globalThis as unknown as { __NEXT_IMAGE_OPTS?: unknown }).__NEXT_IMAGE_OPTS = {
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

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true
})
