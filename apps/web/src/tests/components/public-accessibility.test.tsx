import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from '@isyuricunha/i18n/client'
import messages from '@isyuricunha/i18n/messages/en.json'
import ptMessages from '@isyuricunha/i18n/messages/pt.json'
import { describe, expect, it, vi } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { ReactNode } from 'react'

import CommentEditor from '@/components/comments/comment-editor'
import CommandMenu from '@/components/command-menu'
import NewsletterSignup from '@/components/newsletter-signup'
import SiteSearch from '@/components/site-search'

class ResizeObserverMock {
  observe() {
    return
  }
  disconnect() {
    return
  }
  unobserve() {
    return
  }
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)

vi.mock('@/lib/auth-client', () => ({
  signOut: vi.fn(),
  useSession: () => ({ data: null })
}))

vi.mock('@/store/dialogs', () => ({
  useDialogsStore: () => ({ setIsSignInOpen: vi.fn() })
}))

vi.mock('@/hooks/use-copy-to-clipboard', () => ({
  useCopyToClipboard: () => [vi.fn()]
}))

vi.mock('content-collections', () => ({
  allPosts: [],
  allProjects: []
}))

const withMessages = (children: ReactNode) => (
  <NextIntlClientProvider locale='en' messages={messages}>
    {children}
  </NextIntlClientProvider>
)

describe('public accessibility contracts', () => {
  it('gives the site search a named combobox and semantic active options', () => {
    render(withMessages(<SiteSearch />))

    const input = screen.getByRole('combobox', { name: 'Search the site' })
    expect(input).toHaveAttribute('aria-controls', 'site-search-results')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')

    fireEvent.change(input, { target: { value: 'about' } })

    const listbox = screen.getByRole('listbox', { name: 'Search results' })
    const options = screen.getAllByRole('option')
    const firstOption = options.at(0)
    expect(listbox).toBeInTheDocument()
    expect(options.length).toBeGreaterThan(0)
    expect(input).not.toHaveAttribute('aria-activedescendant')
    expect(firstOption).toBeDefined()

    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(firstOption).toHaveAttribute('aria-selected', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', firstOption?.id)
  })

  it('associates a visible newsletter field name and error description', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Failed to subscribe' })
      })
    )
    render(withMessages(<NewsletterSignup />))

    const input = screen.getByLabelText('Email address')
    expect(input).toHaveAttribute('type', 'email')

    fireEvent.change(input, { target: { value: 'person@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }))

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-describedby', 'newsletter-email-error')
    })
  })

  it('labels the comment editor instead of relying on its placeholder', () => {
    render(withMessages(<CommentEditor label='Comment' />))

    expect(screen.getByLabelText('Comment')).toBeInTheDocument()
  })

  it('disables Tailwind pulse and spin animations for reduced motion', () => {
    // Resolve the stylesheet from the repository root marker (turbo.json)
    // instead of process.cwd(): running the suite from another directory
    // (e.g. `pnpm --filter @isyuricunha/web exec`) would otherwise double
    // the apps/web prefix and fail with ENOENT.
    const repoRoot = (() => {
      let dir = process.cwd()
      while (dir !== path.parse(dir).root && !existsSync(path.join(dir, 'turbo.json'))) {
        dir = path.dirname(dir)
      }
      return dir
    })()
    const globalsCssPath = path.join(repoRoot, 'apps/web/src/styles/globals.css')
    const css = readFileSync(globalsCssPath, 'utf8')
    const reducedMotionBlock = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))

    expect(reducedMotionBlock).toContain('.animate-pulse')
    expect(reducedMotionBlock).toContain('.animate-spin')
  })

  it('provides localized command dialog labels', () => {
    expect(messages['command-menu']['dialog-title']).toBe('Command menu')
    expect(messages['command-menu']['dialog-description']).toBe('Search commands')
    expect(messages['command-menu']['input-label']).toBe('Search commands')
  })

  it('uses localized accessible names for the command dialog and input', () => {
    render(withMessages(<CommandMenu />))

    fireEvent.click(screen.getByRole('button', { name: 'Open command menu' }))

    expect(screen.getByRole('dialog', { name: 'Command menu' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Search commands' })).toBeInTheDocument()
    expect(screen.queryByText('Search a command')).not.toBeInTheDocument()
  })

  it('does not expose English cmdk defaults in the Portuguese command palette', () => {
    render(
      <NextIntlClientProvider locale='pt' messages={ptMessages}>
        <CommandMenu />
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de comandos' }))

    expect(screen.getByRole('dialog', { name: 'Menu de comandos' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Pesquisar comandos' })).toBeInTheDocument()
    expect(screen.getByRole('listbox', { name: 'Sugestões de comandos' })).toBeInTheDocument()
    expect(screen.queryByText('Command Menu')).not.toBeInTheDocument()
    expect(screen.queryByText('Search a command')).not.toBeInTheDocument()
  })
})
