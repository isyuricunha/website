import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text
} from '@react-email/components'
import * as React from 'react'

type ContactFormProps = {
  name: string
  email: string
  subject: string
  message: string
  date?: string
}

const ContactForm = (props: ContactFormProps) => {
  const { name: senderName, email: senderEmail, subject, message } = props

  return (
    <Html lang='en' dir='ltr'>
      <Head />
      <Preview>New contact form submission from {senderName || senderEmail}</Preview>
      <Tailwind>
        <Body
          className='bg-[color:var(--email-bg)] py-[40px] font-sans'
          style={
            {
              '--email-bg': 'hsl(0 0% 0%)',
              '--email-surface': 'hsl(0 0% 7%)',
              '--email-fg': 'hsl(0 0% 100%)',
              '--email-border': 'hsl(0 0% 20%)',
              '--email-muted': 'hsl(0 0% 55%)',
              '--email-accent': 'hsl(42 100% 56%)'
            } as React.CSSProperties
          }
        >
          <Container className='mx-auto max-w-[600px] rounded-[8px] border border-solid border-[color:var(--email-border)] bg-[color:var(--email-bg)]'>
            {/* Header with Logo */}
            <Section className='px-[32px] pt-[32px] pb-[24px]'>
              <Img
                src='https://di867tnz6fwga.cloudfront.net/brand-kits/fcb0c687-f9fb-478b-ac69-67bdccfcd37a/primary/63d1ccea-870c-4147-a2c6-695fe9b6e9fa.png'
                alt='Yuri'
                className='h-auto w-full max-w-[200px] object-cover'
              />
            </Section>

            {/* Main Content */}
            <Section className='px-[32px] pb-[32px]'>
              <Heading className='mt-0 mb-[24px] text-[24px] font-bold text-[color:var(--email-fg)]'>
                New Contact Form Submission
              </Heading>

              <Text className='mt-0 mb-[24px] text-[16px] text-[color:var(--email-fg)]'>
                You have received a new message through your contact form on yuricunha.com.
              </Text>

              {/* Contact Details Card */}
              <Section className='mb-[24px] rounded-[8px] border border-solid border-[color:var(--email-border)] bg-[color:var(--email-surface)] p-[24px]'>
                <Row>
                  <Column>
                    <Text className='mt-0 mb-[8px] text-[14px] font-bold tracking-wide text-[color:var(--email-accent)] uppercase'>
                      From
                    </Text>
                    <Text className='mt-0 mb-[16px] text-[16px] text-[color:var(--email-fg)]'>
                      {senderName ? `${senderName} <${senderEmail}>` : senderEmail}
                    </Text>
                  </Column>
                </Row>

                <Row>
                  <Column>
                    <Text className='mt-0 mb-[8px] text-[14px] font-bold tracking-wide text-[color:var(--email-accent)] uppercase'>
                      Subject
                    </Text>
                    <Text className='mt-0 mb-[16px] text-[16px] text-[color:var(--email-fg)]'>
                      {subject}
                    </Text>
                  </Column>
                </Row>

                <Row>
                  <Column>
                    <Text className='mt-0 mb-[8px] text-[14px] font-bold tracking-wide text-[color:var(--email-accent)] uppercase'>
                      Message
                    </Text>
                    <Text className='mt-0 mb-0 text-[16px] leading-[24px] whitespace-pre-wrap text-[color:var(--email-fg)]'>
                      {message}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Quick Actions */}
              <Text className='mt-0 mb-[16px] text-[16px] text-[color:var(--email-fg)]'>
                You can reply directly to this email to respond to {senderName || 'the sender'}.
              </Text>

              <Text className='mt-0 mb-0 text-[14px] text-[color:var(--email-muted)]'>
                This notification was automatically generated from your contact form at{' '}
                <Link
                  href='https://yuricunha.com'
                  className='text-[color:var(--email-accent)] underline'
                >
                  yuricunha.com
                </Link>
              </Text>
            </Section>

            <Hr className='mx-[32px] border-[color:var(--email-border)]' />

            {/* Footer */}
            <Section className='px-[32px] py-[24px]'>
              <Text className='mt-0 mb-[16px] text-[12px] text-[color:var(--email-muted)]'>
                Database Administrator (DBA) and Server Infrastructure Specialist
              </Text>

              <Text className='m-0 text-[12px] text-[color:var(--email-muted)]'>Brazil</Text>

              <Row className='mt-[16px]'>
                <Column className='w-auto pr-[16px]'>
                  <Link href='https://github.com/isyuricunha'>
                    <Img
                      src='https://new.email/static/emails/social/social-github.png'
                      alt='GitHub'
                      className='h-[24px] w-[24px]'
                    />
                  </Link>
                </Column>
                <Column className='w-auto'>
                  <Link href='https://x.com/isyuricunha'>
                    <Img
                      src='https://new.email/static/emails/social/social-x.png'
                      alt='X (Twitter)'
                      className='h-[24px] w-[24px]'
                    />
                  </Link>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

ContactForm.PreviewProps = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  subject: 'Interested in your cloud infrastructure services',
  message:
    "Hello Yuri,\n\nI came across your website and I'm very impressed with your expertise in server infrastructure and database administration.\n\nI'm currently working on a project that requires cloud migration and would love to discuss potential collaboration opportunities.\n\nLooking forward to hearing from you.\n\nBest regards,\nJohn Doe"
}

export default ContactForm
