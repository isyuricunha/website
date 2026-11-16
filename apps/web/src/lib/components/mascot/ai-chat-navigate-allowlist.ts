/**
 * Allowlist for NAVIGATE: tokens emitted by the assistant. Only same-origin
 * absolute paths are accepted: a leading slash, no scheme (javascript:,
 * data:, etc.), and no protocol-relative or external URLs. Prompt injection
 * must never steer the client router onto an attacker-controlled origin.
 */
export const is_safe_internal_path = (path: string): boolean => {
  if (!path.startsWith('/')) return false
  if (path.startsWith('//')) return false
  // Reject any scheme prefix (e.g. javascript:alert(1)) even after a slash.
  if (/^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false
  // WHATWG parser quirks: a backslash enters the authority state and ASCII
  // tab/newline are stripped before host detection, so inputs like
  // '/\evil.com' or '/\t/evil.com' parse as EXTERNAL origins. Validate
  // with the same parser the browser router uses and require same-origin.
  try {
    const parsed = new URL(path, 'https://local.invalid')
    return parsed.origin === 'https://local.invalid'
  } catch {
    return false
  }
}
