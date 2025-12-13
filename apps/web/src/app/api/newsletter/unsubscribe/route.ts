import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'

import { ratelimit } from '@/lib/ratelimit'
import { rate_limit_keys } from '@/lib/rate-limit-keys'
import { getClientIp } from '@/lib/spam-detection'
import { resendService } from '@/lib/resend-service'

const unsubscribeSchema = z.object({
  email: z.string().email('Valid email is required')
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.newsletter_unsubscribe(ip))

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = unsubscribeSchema.parse(body)

    // Get audiences from Resend
    const audiences = await resendService.listAudiences()
    if (audiences.length === 0) {
      return NextResponse.json({ error: 'No newsletter audience available' }, { status: 500 })
    }

    // Use the first audience
    const mainAudience = audiences[0]
    if (!mainAudience) {
      return NextResponse.json({ error: 'No newsletter audience available' }, { status: 500 })
    }

    const mainAudienceId = mainAudience.id

    // Find contact in Resend audience
    const contact = await resendService.findContactByEmail(mainAudienceId, email)

    if (!contact) {
      return NextResponse.json({ error: 'Email not found in newsletter' }, { status: 404 })
    }

    // Update contact to unsubscribed in Resend
    const updatedContact = await resendService.updateContact(mainAudienceId, contact.id, {
      unsubscribed: true
    })

    if (!updatedContact) {
      return NextResponse.json({ error: 'Failed to unsubscribe from newsletter' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })
  } catch (error) {
    logger.error('Newsletter unsubscribe error', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to unsubscribe from newsletter' }, { status: 500 })
  }
}
