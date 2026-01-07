import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from '@isyuricunha/i18n/client'
import messages from '@isyuricunha/i18n/messages/en.json'
import pt_messages from '@isyuricunha/i18n/messages/pt.json'
import { describe, expect, it } from 'vitest'

import Hero from '@/components/home/hero'

describe('<Hero />', () => {
  it('should have a hero image', () => {
    render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <Hero />
      </NextIntlClientProvider>
    )

    expect(screen.getByAltText('Yuri Cunha')).toBeInTheDocument()
  })

  it('should render english hero title with adjective before “data solutions”', () => {
    render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <Hero />
      </NextIntlClientProvider>
    )

    const left = screen.getByText('optimizing')
    const dynamic = screen.getByText('agile')
    const right = screen.getByText('data solutions')

    expect(left.compareDocumentPosition(dynamic) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
    expect(dynamic.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })

  it('should render portuguese hero title with adjective after “soluções de dados”', () => {
    render(
      <NextIntlClientProvider locale='pt' messages={pt_messages}>
        <Hero />
      </NextIntlClientProvider>
    )

    const left = screen.getByText('otimizando')
    const right = screen.getByText('soluções de dados')
    const dynamic = screen.getByText('ágeis')

    expect(left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
    expect(right.compareDocumentPosition(dynamic) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })
})
