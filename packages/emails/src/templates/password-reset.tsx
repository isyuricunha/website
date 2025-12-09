import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text
} from '@react-email/components'

import Footer from '../components/footer'
import Logo from '../components/logo'

type PasswordResetProps = {
  name: string
  resetUrl: string
}

const PasswordReset = (props: PasswordResetProps) => {
  const { name, resetUrl } = props

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
      <Preview>Reset your password for yuricunha.com</Preview>
      <Tailwind>
        <Body className='mx-auto my-auto bg-white px-2 font-sans'>
          <Container className='mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]'>
            <Logo />
            <Text className='text-[14px] leading-[24px] text-black'>Hi {name},</Text>
            <Text className='text-[14px] leading-[24px] text-black'>
              You recently requested to reset your password for your yuricunha.com account. Click
              the button below to reset it.
            </Text>
            <Section className='mb-[32px] mt-[32px] text-center'>
              <Button
                className='rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline'
                href={resetUrl}
              >
                Reset Password
              </Button>
            </Section>
            <Text className='text-[14px] leading-[24px] text-black'>
              Or copy and paste this URL into your browser:{' '}
              <a href={resetUrl} className='text-blue-600 no-underline'>
                {resetUrl}
              </a>
            </Text>
            <Text className='text-[14px] leading-[24px] text-black'>
              This link will expire in 1 hour for security reasons.
            </Text>
            <Text className='text-[14px] leading-[24px] text-black'>
              If you didn't request this password reset, you can safely ignore this email.
            </Text>
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

PasswordReset.PreviewProps = {
  name: 'John Doe',
  resetUrl: 'https://yuricunha.com/reset-password?token=abc123'
} as PasswordResetProps

export default PasswordReset
