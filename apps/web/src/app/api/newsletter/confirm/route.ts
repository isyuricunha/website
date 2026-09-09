import { NextRequest, NextResponse } from 'next/server'

import { ratelimit } from '@/lib/ratelimit'
import { rate_limit_keys } from '@/lib/rate-limit-keys'
import { getClientIp } from '@/lib/spam-detection'
import { resendService } from '@/lib/resend-service'
import { logger } from '@/lib/logger'
import { redis, redisKeys } from '@isyuricunha/kv'

// Double opt-in confirmation: the token was created by /api/newsletter/subscribe
// and stored in Redis with a 24h TTL. A valid token exchanges the pending email
// for an actual audience contact; the token is single-use (deleted on success).
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.newsletter_subscribe(ip))

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const token = new URL(request.url).searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'Confirmation token is required' }, { status: 400 })
    }

    const redisKey = redisKeys.newsletterConfirm(token)
    const email = await redis.get<string>(redisKey)

    if (!email) {
      return NextResponse.json({ error: 'Invalid or expired confirmation token' }, { status: 400 })
    }

    const mainAudienceId = await resendService.getMainAudienceId()
    if (!mainAudienceId) {
      return NextResponse.json({ error: 'No newsletter audience available' }, { status: 500 })
    }

    const existingContact = await resendService.findContactByEmail(mainAudienceId, email)
    if (existingContact && !existingContact.unsubscribed) {
      // Already subscribed: burn the token and report success so the user is
      // not stuck re-clicking an email whose token still exists.
      await redis.del(redisKey)
      return NextResponse.json({
        success: true,
        message: 'Email is already subscribed'
      })
    }

    if (existingContact) {
      // Previously unsubscribed: re-enable the existing contact.
      const updated = await resendService.updateContact(mainAudienceId, existingContact.id, {
        unsubscribed: false
      })
      if (!updated) {
        return NextResponse.json({ error: 'Failed to confirm subscription' }, { status: 500 })
      }
    } else {
      const contact = await resendService.addContact(mainAudienceId, {
        email,
        unsubscribed: false
      })
      if (!contact) {
        return NextResponse.json({ error: 'Failed to confirm subscription' }, { status: 500 })
      }
    }

    // Single-use: the token must not confirm twice.
    await redis.del(redisKey)

    logger.info('Newsletter subscription confirmed', { email })

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    })
  } catch (error) {
    logger.error('Newsletter confirmation error', error)
    return NextResponse.json({ error: 'Failed to confirm subscription' }, { status: 500 })
  }
}
