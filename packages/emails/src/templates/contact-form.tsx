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

type ContactFormProps = {
  name: string
  email: string
  subject: string
  message: string
  date: string
}

const ContactForm = (props: ContactFormProps) => {
  const { name, email, subject, message, date } = props

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
      <Preview>New contact form submission from {name}</Preview>
      <Tailwind>
        <Body className='m-auto bg-white p-1'>
          <Container className='mx-auto w-full max-w-[660px] rounded-lg border border-solid border-[#e5e5e5] bg-white p-8 shadow-sm'>
            <Logo />
            <Section>
              <Text className='m-0 p-0 text-xl font-semibold text-gray-900'>
                New Contact Form Submission
              </Text>
              <Text className='m-0 mt-2 p-0 text-base font-normal text-gray-500'>
                You have received a new message through your website contact form.
              </Text>
            </Section>
            
            <Section className='mt-6 rounded-lg border border-solid border-[#e5e5e5] bg-gray-50 p-6'>
              <Row>
                <Column>
                  <Text className='m-0 p-0 text-sm font-medium text-gray-700'>From:</Text>
                  <Text className='m-0 mt-1 p-0 text-base font-medium text-gray-900'>{name}</Text>
                  <Text className='m-0 mt-1 p-0 text-sm font-normal text-gray-600'>{email}</Text>
                </Column>
              </Row>
              
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
              
              <Row className='mt-4'>
                <Column>
                  <Text className='m-0 p-0 text-xs font-normal text-gray-500'>
                    Sent on {date}
                  </Text>
                </Column>
              </Row>
            </Section>
            
            <Button
              className='mt-6 rounded-full bg-gray-900 px-8 py-2.5 align-middle text-sm font-medium text-white'
              href={`mailto:${email}?subject=Re: ${subject}`}
            >
              Reply to {name}
            </Button>
            
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

ContactForm.PreviewProps = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Interested in collaboration',
  message: 'Hi Yuri,\n\nI came across your website and I\'m really impressed with your work. I would love to discuss a potential collaboration opportunity.\n\nBest regards,\nJohn',
  date: 'January 15, 2025 at 3:04 AM'
} satisfies ContactFormProps

export default ContactForm
