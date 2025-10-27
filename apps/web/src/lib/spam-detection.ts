/**
 * Anti-spam utilities for contact form
 */

// In-memory rate limiter (em produção, considere usar Redis ou similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3 // Max 3 emails por hora por IP

/**
 * Check if IP has exceeded rate limit
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    const entries = Array.from(rateLimitMap.entries())
    entries.forEach(([key, value]) => {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    })
  }

  if (!record || record.resetTime < now) {
    // Create new record or reset expired one
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return { allowed: true }
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  record.count++
  return { allowed: true }
}

/**
 * Detect if text looks like random spam (like: "sUhKsKAWYfKXAkRUiKLMNPm")
 */
export function isSpamText(text: string): boolean {
  if (!text || text.length < 5) return false

  const cleanText = text.toLowerCase().trim()

  // Check 1: Too many consecutive consonants (spam often has random strings)
  const consonantPattern = /[bcdfghjklmnpqrstvwxyz]{8,}/i
  if (consonantPattern.test(cleanText)) {
    return true
  }

  // Check 2: Very low vowel ratio (less than 15% vowels)
  const vowels = cleanText.match(/[aeiou]/gi) || []
  const letters = cleanText.match(/[a-z]/gi) || []
  if (letters.length > 10 && vowels.length / letters.length < 0.15) {
    return true
  }

  // Check 3: Random mixed case pattern (like "sUhKsK")
  const upperCaseCount = (text.match(/[A-Z]/g) || []).length
  const lowerCaseCount = (text.match(/[a-z]/g) || []).length
  const totalLetters = upperCaseCount + lowerCaseCount
  
  if (totalLetters > 10 && upperCaseCount > 0) {
    // If there's a lot of case switching, it might be spam
    const caseChanges = text.match(/[a-z][A-Z]|[A-Z][a-z]/g) || []
    if (caseChanges.length > totalLetters * 0.3) {
      return true
    }
  }

  // Check 4: Contains common spam patterns
  const spamPatterns = [
    /^[a-z]+[A-Z]+[a-z]+[A-Z]+/i, // alternating case
    /^[A-Z]{20,}$/, // all caps long string
    /[0-9]{10,}/, // long number sequences
  ]

  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      return true
    }
  }

  return false
}

/**
 * Validate contact form data for spam patterns
 */
export function validateContactData(data: {
  name: string
  email: string
  subject: string
  message: string
}): { isSpam: boolean; reason?: string } {
  // Check each field for spam patterns
  if (isSpamText(data.name)) {
    return { isSpam: true, reason: 'Suspicious name pattern detected' }
  }

  if (isSpamText(data.subject)) {
    return { isSpam: true, reason: 'Suspicious subject pattern detected' }
  }

  if (isSpamText(data.message)) {
    return { isSpam: true, reason: 'Suspicious message pattern detected' }
  }

  // Check if message is too short relative to name/subject
  if (data.message.length < 20 && (isSpamText(data.name) || isSpamText(data.subject))) {
    return { isSpam: true, reason: 'Message too short with suspicious patterns' }
  }

  return { isSpam: false }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(headers: Headers): string {
  // Check various headers that might contain the real IP
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback
  return headers.get('x-client-ip') || 'unknown'
}
