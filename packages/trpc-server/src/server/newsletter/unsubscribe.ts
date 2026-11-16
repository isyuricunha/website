import { z } from 'zod'
import { logger } from '../../lib/logger'

import { ratelimit } from '../../lib/ratelimit'
import { rate_limit_keys } from '../../lib/rate-limit-keys'
import { getClientIp } from '../../lib/spam-detection'
import { resendService } from '../../lib/resend-service'

const unsubscribeSchema = z.object({
  email: z.string().email('Valid email is required')
})

export async function newsletterUnsubscribePost(request: Request): Promise<Response> {
  try {
    const ip = getClientIp(request.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.newsletter_unsubscribe(ip))

    if (!success) {
      return Response.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = unsubscribeSchema.parse(body)

    const mainAudienceId = await resendService.getMainAudienceId()
    if (!mainAudienceId) {
      return Response.json({ error: 'No newsletter audience available' }, { status: 500 })
    }

    // Find contact in Resend audience
    const contact = await resendService.findContactByEmail(mainAudienceId, email)

    if (!contact) {
      // Uniform success: a 404 here would let anyone probe which addresses
      // are subscribed (existence oracle). Unsubscribing a non-subscriber is
      // a no-op from the caller's perspective.
      return Response.json({
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      })
    }

    // Update contact to unsubscribed in Resend
    const updatedContact = await resendService.updateContact(mainAudienceId, contact.id, {
      unsubscribed: true
    })

    if (!updatedContact) {
      return Response.json({ error: 'Failed to unsubscribe from newsletter' }, { status: 500 })
    }

    return Response.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })
  } catch (error) {
    logger.error('Newsletter unsubscribe error', error)

    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 })
    }

    return Response.json({ error: 'Failed to unsubscribe from newsletter' }, { status: 500 })
  }
}
