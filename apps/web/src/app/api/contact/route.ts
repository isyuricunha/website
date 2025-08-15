import { NextRequest } from 'next'
import { z } from 'zod'
import { Resend } from 'resend'
import { render } from '@react-email/components'

import { ContactForm, ContactConfirmation } from '@tszhong0411/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the form data
    const validatedData = contactFormSchema.parse(body)
    
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
      console.error('Email sending error:', emailResult.error)
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
    console.error('Contact form error:', error)
    
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
