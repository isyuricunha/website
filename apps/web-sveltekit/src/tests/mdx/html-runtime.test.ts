import { describe, expect, it } from 'vitest'

import { Fragment, escapeHtml, jsx, jsxs } from '../../../mdx/html-runtime.ts'

describe('escapeHtml', () => {
  it('escapes HTML-sensitive characters', () => {
    expect(escapeHtml(`<a href="/x" title='y'>&done</a>`)).toBe(
      '&lt;a href=&quot;/x&quot; title=&#39;y&#39;&gt;&amp;done&lt;/a&gt;'
    )
  })
})

describe('jsx runtime', () => {
  it('renders intrinsic elements with attributes', () => {
    expect(jsx('a', { href: '/pt/blog', class: 'link' }).html).toBe(
      '<a href="/pt/blog" class="link"></a>'
    )
  })

  it('renders string children escaped', () => {
    expect(jsx('p', { children: 'a < b' }).html).toBe('<p>a &lt; b</p>')
  })

  it('escapes raw string children', () => {
    expect(jsx('span', { children: '<em>hi</em>' }).html).toBe(
      '<span>&lt;em&gt;hi&lt;/em&gt;</span>'
    )
  })

  it('passes rendered nodes through unescaped', () => {
    const inner = jsx('em', { children: 'hi' })
    expect(jsx('span', { children: inner }).html).toBe('<span><em>hi</em></span>')
  })

  it('renders void elements without closing tags', () => {
    expect(jsx('img', { src: '/a.png', alt: 'x' }).html).toBe('<img src="/a.png" alt="x">')
  })

  it('skips event handlers and undefined values', () => {
    expect(jsx('div', { onclick: () => {}, title: undefined }).html).toBe('<div></div>')
  })

  it('renders fragments by concatenating children', () => {
    expect(
      jsx(Fragment, { children: [jsx('p', { children: 'a' }), jsx('p', { children: 'b' })] }).html
    ).toBe('<p>a</p><p>b</p>')
  })

  it('jsxs is an alias of jsx', () => {
    expect(jsxs).toBe(jsx)
  })

  it('calls component functions with the given props', () => {
    const Badge = (props: Record<string, unknown>) => jsx('b', { children: props.children })
    expect(jsx(Badge, { children: 'hi' }).html).toBe('<b>hi</b>')
  })

  it('converts style objects to inline CSS', () => {
    expect(jsx('div', { style: { backgroundColor: 'red', marginTop: 5 } }).html).toBe(
      '<div style="background-color:red;margin-top:5"></div>'
    )
  })
})
