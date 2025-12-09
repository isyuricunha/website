import {
  Body,
  Column,
  Container,
  Head,
  Heading,
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

type ContactConfirmationProps = {
  name: string
  subject?: string
  message?: string
}

const ContactConfirmation = (props: ContactConfirmationProps) => {
  const { name: contactName = 'there' } = props

  return (
    <Html lang='en' dir='ltr'>
      <Head />
      <Preview>Thank you for contacting yuricunha.com - I'll respond within 48 hours</Preview>
      <Tailwind>
        <Body className='bg-black py-[40px] font-sans'>
          <Container className='mx-auto max-w-[600px] bg-black px-[20px]'>
            {/* Header with Logo */}
            <Section className='mb-[32px] text-center'>
              <Img
                src='https://di867tnz6fwga.cloudfront.net/brand-kits/fcb0c687-f9fb-478b-ac69-67bdccfcd37a/primary/63d1ccea-870c-4147-a2c6-695fe9b6e9fa.png'
                alt='yuricunha.com'
                className='mx-auto h-auto w-full max-w-[200px] object-cover'
              />
            </Section>

            {/* Main Content */}
            <Section className='mb-[32px]'>
              <Heading className='mb-[24px] text-left text-[24px] font-bold text-white'>
                Thank you for reaching out, {contactName}!
              </Heading>

              <Text className='mb-[16px] text-[16px] leading-[24px] text-white'>
                I have successfully received your contact inquiry and wanted to personally confirm
                that your message is now in my queue for review.
              </Text>

              <Text className='mb-[16px] text-[16px] leading-[24px] text-white'>
                As a Server Infrastructure and Database Administration specialist, I understand the
                importance of timely communication. I will respond within 48 hours, probably much
                less (~)
              </Text>

              <Text className='mb-[24px] text-[16px] leading-[24px] text-white'>
                In the meantime, feel free to explore my website at{' '}
                <Link href='https://yuricunha.com' className='text-[#c24000] underline'>
                  yuricunha.com
                </Link>{' '}
                to learn more about my expertise in cloud infrastructure and database solutions.
              </Text>
            </Section>

            {/* Contact Information */}
            <Section className='mb-[40px] rounded-[8px] border border-solid border-[#333333] p-[20px]'>
              <Text className='mb-[8px] text-[14px] font-bold leading-[20px] text-white'>
                What happens next?
              </Text>
              <Text className='mb-[4px] text-[14px] leading-[20px] text-white'>
                • I will review your inquiry thoroughly
              </Text>
              <Text className='mb-[4px] text-[14px] leading-[20px] text-white'>
                • I will respond within 48 hours, probably much less (~)
              </Text>
              <Text className='text-[14px] leading-[20px] text-white'>
                • If urgent, please, put in the SUBJECT
              </Text>
            </Section>

            {/* Social Links */}
            <Section className='mb-[40px] text-center'>
              <Row>
                <Column className='text-center'>
                  <Link href='https://github.com/isyuricunha' className='mx-[8px] inline-block'>
                    <Img
                      src='https://new.email/static/emails/social/social-github.png'
                      alt='GitHub'
                      width='32'
                      height='32'
                      className='h-[32px] w-[32px]'
                    />
                  </Link>
                  <Link href='https://x.com/isyuricunha' className='mx-[8px] inline-block'>
                    <Img
                      src='https://new.email/static/emails/social/social-x.png'
                      alt='X (Twitter)'
                      width='32'
                      height='32'
                      className='h-[32px] w-[32px]'
                    />
                  </Link>
                </Column>
              </Row>
            </Section>

            {/* Footer */}
            <Section className='border-t border-solid border-[#333333] pt-[24px]'>
              <Text className='m-0 mb-[8px] text-center text-[12px] leading-[16px] text-[#888888]'>
                dbA
              </Text>
              <Text className='m-0 mb-[8px] text-center text-[12px] leading-[16px] text-[#888888]'>
                Brazil
              </Text>
              <Text className='m-0 text-center text-[12px] leading-[16px] text-[#888888]'>
                © {new Date().getFullYear()} yuricunha.com. All rights reserved.
              </Text>
              <Text className='m-0 mt-[8px] text-center text-[12px] leading-[16px] text-[#888888]'>
                <Link href='https://yuricunha.com' className='text-[#c24000] underline'>
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

ContactConfirmation.PreviewProps = {
  name: 'John'
}

export default ContactConfirmation
