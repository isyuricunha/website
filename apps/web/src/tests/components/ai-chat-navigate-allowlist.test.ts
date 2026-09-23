import { describe, expect, it } from 'vitest'

import { is_safe_internal_path } from '@/components/mascot/ai-chat-interface'

describe('is_safe_internal_path', () => {
  it('accepts same-origin absolute paths', () => {
    expect(is_safe_internal_path('/blog/hello')).toBe(true)
    expect(is_safe_internal_path('/')).toBe(true)
    expect(is_safe_internal_path('/projects?tab=all')).toBe(true)
    expect(is_safe_internal_path('/about#team')).toBe(true)
  })

  it('rejects external URLs and protocol-relative URLs', () => {
    expect(is_safe_internal_path('https://evil.example/phish')).toBe(false)
    expect(is_safe_internal_path('//evil.example/phish')).toBe(false)
    expect(is_safe_internal_path('https://attacker.example')).toBe(false)
  })

  it('rejects scheme-carrying payloads even with a leading slash', () => {
    expect(is_safe_internal_path('/javascript:alert(1)')).toBe(false)
    expect(is_safe_internal_path('/data:text/html,<script>')).toBe(false)
  })

  it('rejects backslash and control-character bypasses that parse as external origins', () => {
    // WHATWG parser quirks: backslash enters the authority state and
    // tab/newline are stripped before host detection.
    expect(is_safe_internal_path('/\\evil.com')).toBe(false)
    expect(is_safe_internal_path('/\\t/evil.com')).toBe(false)
    expect(is_safe_internal_path('/\\n/evil.com')).toBe(false)
    expect(is_safe_internal_path('/\\r//evil.com')).toBe(false)
  })

  it('rejects non-slash prefixes', () => {
    expect(is_safe_internal_path('blog/hello')).toBe(false)
    expect(is_safe_internal_path('')).toBe(false)
  })
})
