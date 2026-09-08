import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { Button } from '../button'
import { Card } from '../card'
import { ComboboxInput } from '../combobox'
import { Link } from '../link'
import { SelectTrigger } from '../select'

const readSource = (file: string) =>
  readFileSync(path.resolve(process.cwd(), 'packages/ui/src', file), 'utf8')

describe('Button pending state', () => {
  it('remains disabled when pending even when disabled is explicitly false', () => {
    const element = Button({ children: 'Save', isPending: true, disabled: false })

    expect(element.props.disabled).toBe(true)
  })
})

describe('Link navigation classification', () => {
  it('uses NextLink only for root-relative routes', () => {
    const root = Link({ href: '/docs', children: 'Docs' })
    const path = Link({ href: './docs', children: 'Docs' })

    expect(root.type).not.toBe('a')
    expect(path.type).toBe('a')
    expect(path.props.target).toBeUndefined()
  })

  it('keeps query, hash, and protocol actions in the current browsing context', () => {
    for (const href of [
      '?tab=api',
      '#installation',
      'mailto:yuri@example.com',
      'tel:+15551234567'
    ]) {
      const element = Link({ href, children: 'Open' })

      expect(element.type).toBe('a')
      expect(element.props.target).toBeUndefined()
    }
  })

  it('opens only actual external HTTP(S) links in a new tab by default and honors overrides', () => {
    const external = Link({ href: 'https://example.com', children: 'External' })
    const overridden = Link({ href: 'https://example.com', target: '_self', children: 'Same tab' })

    expect(external.props.target).toBe('_blank')
    expect(external.props.rel).toBe('noopener noreferrer')
    expect(overridden.props.target).toBe('_self')
  })
})

describe('canonical primitive sizing and elevation', () => {
  it('uses the 36px default control height while preserving explicit compact overrides', () => {
    expect(SelectTrigger({ children: 'Select' }).props.className).toContain('h-9')
    expect(ComboboxInput({}).props.className).toContain('h-9')
  })

  it('does not elevate generic cards unless an explicit variant is selected', () => {
    expect(Card({ children: 'Plain' }).props.className).not.toContain('shadow-feature-card')
    expect(Card({ children: 'Feature', variant: 'feature' }).props.className).toContain(
      'shadow-feature-card'
    )
  })
})

describe('shared YuTheme interaction invariants', () => {
  it('uses visible keyboard focus rings for interactive navigation primitives', () => {
    const files = [
      'accordion.tsx',
      'select.tsx',
      'navigation-menu.tsx',
      'segment-group.tsx',
      'tree-view.tsx',
      'command.tsx',
      'sidebar.tsx'
    ]

    for (const file of files) {
      expect(readSource(file), file).toContain('focus-visible:ring-')
    }

    expect(readSource('sidebar.tsx')).toContain('tabIndex={0}')
  })

  it('keeps copy controls visible when focused from the keyboard', () => {
    expect(readSource('code-block.tsx')).toContain('focus-visible:opacity-100')
  })

  it('has reduced-motion paths for animated shared primitives', () => {
    expect(readSource('blur-fade.tsx')).toContain('useReducedMotion')
    expect(readSource('blur-image.tsx')).toContain('motion-reduce:')
    expect(readSource('marquee.tsx')).toContain('motion-reduce:animate-none')
  })

  it('uses named shadow semantics and a tokenized Sheet duration', () => {
    const source = [
      'button.tsx',
      'callout.tsx',
      'command.tsx',
      'input-otp.tsx',
      'navigation-menu.tsx',
      'sidebar.tsx',
      'switch.tsx',
      'toggle.tsx'
    ]
      .map((file) => readSource(file))
      .join('\n')

    expect(source).not.toMatch(/shadow-(xs|sm|md|lg)(?![\\w-])/)
    expect(source).not.toContain('shadow-[')
    expect(readSource('sheet.tsx')).not.toMatch(/duration-(300|500)/)
    expect(readSource('sheet.tsx')).toContain('var(--duration-sheet)')
    const presetSource = readFileSync(
      path.resolve(process.cwd(), 'packages/ui/styles/preset.css'),
      'utf8'
    )
    expect(presetSource).toContain('--duration-sheet:')
  })
})
