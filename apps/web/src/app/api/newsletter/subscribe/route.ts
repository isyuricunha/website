import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'

import { ratelimit } from '@/lib/ratelimit'
import { rate_limit_keys } from '@/lib/rate-limit-keys'
import { getClientIp } from '@/lib/spam-detection'
import { resendService } from '@/lib/resend-service'

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.newsletter_subscribe(ip))

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = subscribeSchema.parse(body)

    // Get audiences from Resend
    const audiences = await resendService.listAudiences()
    if (audiences.length === 0) {
      return NextResponse.json({ error: 'No newsletter audience available' }, { status: 500 })
    }

    // Use the first audience (or you can specify a specific audience ID)
    const mainAudience = audiences[0]
    if (!mainAudience) {
      return NextResponse.json({ error: 'No newsletter audience available' }, { status: 500 })
    }

    const mainAudienceId = mainAudience.id

    // Check if email already exists in the audience
    const existingContact = await resendService.findContactByEmail(mainAudienceId, email)
    if (existingContact && !existingContact.unsubscribed) {
      return NextResponse.json({ error: 'Email is already subscribed' }, { status: 400 })
    }

    // Add contact to Resend audience
    const contact = await resendService.addContact(mainAudienceId, {
      email: email,
      unsubscribed: false
    })

    if (!contact) {
      return NextResponse.json({ error: 'Failed to subscribe to newsletter' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    })
  } catch (error) {
    logger.error('Newsletter subscription error', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to subscribe to newsletter' }, { status: 500 })
  }
}
