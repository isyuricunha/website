import type { NextRequest } from 'next/server'

import { render } from '@react-email/components'
import { ContactConfirmation, ContactForm } from '@tszhong0411/emails'
import { env, flags } from '@tszhong0411/env'
import { Resend } from 'resend'
import { z } from 'zod'

import { logger } from '@/lib/logger'
import { contactRatelimit } from '@/lib/ratelimit'
import { getClientIp, verifyTurnstileToken } from '@/lib/spam-detection'

const resend = new Resend(env.RESEND_API_KEY)

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  timestamp: z.number().optional(),
  turnstileToken: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get client IP for rate limiting
    const clientIp = getClientIp(request.headers)

    // Check rate limit
    const { success } = await contactRatelimit.limit(`contact:${clientIp}`)
    if (!success) {
      logger.warn('Rate limit exceeded', { ip: clientIp })
      return Response.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: 3600
        },
        {
          status: 429,
          headers: {
            'Retry-After': '3600'
          }
        }
      )
    }

    // Validate the form data
    const validatedData = contactFormSchema.parse(body)

    // Verify Turnstile token (required)
    const isTurnstileEnabled = flags.turnstile

    if (isTurnstileEnabled) {
      if (!validatedData.turnstileToken) {
        logger.warn('Missing Turnstile token', { ip: clientIp })
        return Response.json(
          { error: 'Security verification required. Please refresh the page and try again.' },
          { status: 400 }
        )
      }

      const turnstileResult = await verifyTurnstileToken(
        validatedData.turnstileToken,
        env.TURNSTILE_SECRET_KEY,
        clientIp
      )

      if (!turnstileResult.success) {
        logger.warn('Turnstile verification failed', {
          ip: clientIp,
          error: turnstileResult.error
        })
        return Response.json(
          { error: 'Security verification failed. Please try again.' },
          { status: 400 }
        )
      }

      logger.info('Turnstile verification successful', { ip: clientIp })
    }

    const currentDate = new Date().toLocaleString()

    // Send email to yourself using the template
    const emailResult = await resend.emails.send({
      from: 'Contact Form <noreply@yuricunha.com>',
      to: ['me@yuricunha.com'],
      subject: `Contact Form: ${validatedData.subject}`,
      html: await render(
        ContactForm({
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message,
          date: currentDate
        })
      ),
      text: `
New Contact Form Submission

Name: ${validatedData.name}
Email: ${validatedData.email}
Subject: ${validatedData.subject}

Message:
${validatedData.message}

Reply to: ${validatedData.email}
Sent at: ${currentDate}
      `
    })

    if (emailResult.error) {
      logger.error('Email sending error', emailResult.error)
      return Response.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      )
    }

    // Send confirmation email to the user using the template
    await resend.emails.send({
      from: 'Yuri Cunha <noreply@yuricunha.com>',
      to: [validatedData.email],
      subject: 'Thank you for contacting me!',
      html: await render(
        ContactConfirmation({
          name: validatedData.name,
          subject: validatedData.subject,
          message: validatedData.message
        })
      ),
      text: `
Hi ${validatedData.name},

I've received your message and will get back to you within 24-48 hours. Here's a copy of what you sent:

Subject: ${validatedData.subject}
Message: ${validatedData.message}

Best regards,
Yuri Cunha

This is an automated confirmation email. Please do not reply to this email.
      `
    })

    return Response.json({
      success: true,
      message: 'Message sent successfully! You should receive a confirmation email shortly.'
    })
  } catch (error) {
    logger.error('Contact form error', error)

    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid form data', details: error.issues }, { status: 400 })
    }

    return Response.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
