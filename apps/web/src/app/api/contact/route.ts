import { NextRequest } from 'next'
import { z } from 'zod'
import { Resend } from 'resend'
import { render } from '@react-email/components'

import { ContactForm, ContactConfirmation } from '@tszhong0411/emails'
import { logger } from '@/lib/logger'
import { checkRateLimit, validateContactData, getClientIp, verifyTurnstileToken } from '@/lib/spam-detection'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const rateLimitResult = checkRateLimit(clientIp)
    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', { ip: clientIp, retryAfter: rateLimitResult.retryAfter })
      return Response.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 3600)
          }
        }
      )
    }
    
    // Validate the form data
    const validatedData = contactFormSchema.parse(body)
    
    // Verify Turnstile token if enabled
    const isTurnstileEnabled = 
      process.env.NEXT_PUBLIC_FLAG_TURNSTILE === 'true' && 
      process.env.TURNSTILE_SECRET_KEY
    
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
        process.env.TURNSTILE_SECRET_KEY!,
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
    }
    
    // Check for spam patterns in the data
    const spamCheck = validateContactData(validatedData)
    if (spamCheck.isSpam) {
      logger.warn('Spam detected in contact form', {
        ip: clientIp,
        reason: spamCheck.reason,
        name: validatedData.name,
        subject: validatedData.subject
      })
      
      // Return success to the bot (don't let them know they were blocked)
      return Response.json({ 
        success: true, 
        message: 'Message sent successfully! You should receive a confirmation email shortly.' 
      })
    }
    
    const currentDate = new Date().toLocaleString()

    // Send email to yourself using the template
    const emailResult = await resend.emails.send({
      from: 'Contact Form <noreply@yuricunha.com>',
      to: ['me@yuricunha.com'],
      subject: `Contact Form: ${validatedData.subject}`,
      html: await render(ContactForm({
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        date: currentDate
      })),
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
      html: await render(ContactConfirmation({
        name: validatedData.name,
        subject: validatedData.subject,
        message: validatedData.message
      })),
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
      return Response.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      )
    }
    
    return Response.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
