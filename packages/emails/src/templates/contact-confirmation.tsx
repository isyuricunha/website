import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text
} from '@react-email/components'

import Footer from '../components/footer'
import Logo from '../components/logo'

type ContactConfirmationProps = {
  name: string
  subject: string
  message: string
}

const ContactConfirmation = (props: ContactConfirmationProps) => {
  const { name, subject, message } = props

  return (
    <Html>
      <Head>
        <Font
          fontFamily='Geist'
          fallbackFontFamily='Arial'
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap',
            format: 'woff2'
          }}
          fontWeight={400}
          fontStyle='normal'
        />
      </Head>
      <Preview>Thank you for contacting me, {name}!</Preview>
      <Tailwind>
        <Body className='m-auto bg-white p-1'>
          <Container className='mx-auto w-full max-w-[660px] rounded-lg border border-solid border-[#e5e5e5] bg-white p-8 shadow-sm'>
            <Logo />
            <Section>
              <Text className='m-0 p-0 text-xl font-semibold text-gray-900'>
                Thank you for reaching out!
              </Text>
              <Text className='m-0 mt-2 p-0 text-base font-normal text-gray-500'>
                Hi {name}, I've received your message and will get back to you within 24-48 hours.
              </Text>
            </Section>
            
            <Section className='mt-6 rounded-lg border border-solid border-[#e5e5e5] bg-gray-50 p-6'>
              <Text className='m-0 p-0 text-sm font-medium text-gray-700'>
                Here's a copy of your message:
              </Text>
              
              <Row className='mt-4'>
                <Column>
                  <Text className='m-0 p-0 text-sm font-medium text-gray-700'>Subject:</Text>
                  <Text className='m-0 mt-1 p-0 text-base font-medium text-gray-900'>{subject}</Text>
                </Column>
              </Row>
              
              <Row className='mt-4'>
                <Column>
                  <Text className='m-0 p-0 text-sm font-medium text-gray-700'>Message:</Text>
                  <Text className='m-0 mt-2 p-0 text-base font-normal text-gray-700 leading-6'>
                    {message.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < message.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </Text>
                </Column>
              </Row>
            </Section>
            
            <Section className='mt-6'>
              <Text className='m-0 p-0 text-base font-normal text-gray-700'>
                Best regards,<br />
                <span className='font-medium'>Yuri Cunha</span>
              </Text>
            </Section>
            
            <Button
              className='mt-6 rounded-full bg-gray-900 px-8 py-2.5 align-middle text-sm font-medium text-white'
              href='https://yuricunha.com'
            >
              Visit My Website
            </Button>
            
            <Section className='mt-6 rounded-lg border border-solid border-[#f3f4f6] bg-gray-50 p-4'>
              <Text className='m-0 p-0 text-xs font-normal text-gray-500'>
                This is an automated confirmation email. Please do not reply to this email.
                If you need to send additional information, please use the contact form on my website.
              </Text>
            </Section>
            
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

ContactConfirmation.PreviewProps = {
  name: 'John Doe',
  subject: 'Interested in collaboration',
  message: 'Hi Yuri,\n\nI came across your website and I\'m really impressed with your work. I would love to discuss a potential collaboration opportunity.\n\nBest regards,\nJohn'
} satisfies ContactConfirmationProps

export default ContactConfirmation
