import { ratelimit } from '../../lib/ratelimit'
import { rate_limit_keys } from '../../lib/rate-limit-keys'
import { getClientIp } from '../../lib/spam-detection'
import { resendService } from '../../lib/resend-service'
import { logger } from '../../lib/logger'
import { redis, redisKeys } from '@isyuricunha/kv'

// Double opt-in confirmation: the token was created by /api/newsletter/subscribe
// and stored in Redis with a 24h TTL. A valid token exchanges the pending email
// for an actual audience contact; the token is single-use (deleted on success).
export async function newsletterConfirmGet(
  request: Request,
  deps?: {
    kv?: {
      redis: Pick<typeof redis, 'get' | 'del' | 'set'>
      redisKeys: Pick<typeof redisKeys, 'newsletterConfirm'>
    }
  }
): Promise<Response> {
  const activeRedis = deps?.kv?.redis ?? redis
  const activeRedisKeys = deps?.kv?.redisKeys ?? redisKeys
  try {
    const ip = getClientIp(request.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.newsletter_subscribe(ip))

    if (!success) {
      return Response.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const token = new URL(request.url).searchParams.get('token')
    if (!token) {
      return Response.json({ error: 'Confirmation token is required' }, { status: 400 })
    }

    const redisKey = activeRedisKeys.newsletterConfirm(token)
    const email = await activeRedis.get<string>(redisKey)

    if (!email) {
      return Response.json({ error: 'Invalid or expired confirmation token' }, { status: 400 })
    }

    const mainAudienceId = await resendService.getMainAudienceId()
    if (!mainAudienceId) {
      return Response.json({ error: 'No newsletter audience available' }, { status: 500 })
    }

    const existingContact = await resendService.findContactByEmail(mainAudienceId, email)
    if (existingContact && !existingContact.unsubscribed) {
      // Already subscribed: burn the token and report success so the user is
      // not stuck re-clicking an email whose token still exists.
      await activeRedis.del(redisKey)
      return Response.json({
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
        return Response.json({ error: 'Failed to confirm subscription' }, { status: 500 })
      }
    } else {
      const contact = await resendService.addContact(mainAudienceId, {
        email,
        unsubscribed: false
      })
      if (!contact) {
        return Response.json({ error: 'Failed to confirm subscription' }, { status: 500 })
      }
    }

    // Single-use: the token must not confirm twice.
    await activeRedis.del(redisKey)

    logger.info('Newsletter subscription confirmed', { email })

    return Response.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    })
  } catch (error) {
    logger.error('Newsletter confirmation error', error)
    return Response.json({ error: 'Failed to confirm subscription' }, { status: 500 })
  }
}
