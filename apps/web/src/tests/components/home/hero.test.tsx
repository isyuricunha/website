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

  it('should render the English Infrastructure & Platform hero title in order', () => {
    render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <Hero />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('I’m Yuri, an Infrastructure & Platform Engineer')).toBeInTheDocument()

    const left = screen.getByText('building')
    const dynamic = screen.getByText('reliable')
    const right = screen.getByText('systems')

    expect(left.compareDocumentPosition(dynamic) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
    expect(dynamic.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })

  it('should render the Portuguese Infrastructure & Platform hero title in order', () => {
    render(
      <NextIntlClientProvider locale='pt' messages={pt_messages}>
        <Hero />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Sou Yuri, um Infrastructure & Platform Engineer')).toBeInTheDocument()

    const left = screen.getByText('construindo')
    const right = screen.getByText('sistemas')
    const dynamic = screen.getByText('confiáveis')

    expect(left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
    expect(right.compareDocumentPosition(dynamic) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })
})
