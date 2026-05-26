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
import type { CSSProperties } from 'react'

import Footer from '../components/footer'
import Logo from '../components/logo'
import { emailThemeVars } from '../theme'

type PasswordResetProps = {
  name: string
  resetUrl: string
  locale?: 'en' | 'pt'
}

const PasswordReset = (props: PasswordResetProps) => {
  const { name, resetUrl } = props
  const locale = props.locale ?? 'en'

  const copy =
    locale === 'pt'
      ? {
          preview: 'Redefina sua senha para yuricunha.com',
          greeting: `Olá ${name},`,
          intro:
            'Você solicitou recentemente a redefinição da senha da sua conta em yuricunha.com. Clique no botão abaixo para redefinir.',
          button: 'Redefinir senha',
          alternative: 'Ou copie e cole este URL no seu navegador:',
          expires: 'Este link expira em 1 hora por motivos de segurança.',
          ignore:
            'Se você não solicitou essa redefinição de senha, pode ignorar este e-mail com segurança.'
        }
      : {
          preview: 'Reset your password for yuricunha.com',
          greeting: `Hi ${name},`,
          intro:
            'You recently requested to reset your password for your yuricunha.com account. Click the button below to reset it.',
          button: 'Reset Password',
          alternative: 'Or copy and paste this URL into your browser:',
          expires: 'This link will expire in 1 hour for security reasons.',
          ignore: "If you didn't request this password reset, you can safely ignore this email."
        }

  return (
    <Html lang={locale} dir='ltr'>
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
      <Preview>{copy.preview}</Preview>
      <Tailwind>
        <Body
          className='mx-auto my-auto bg-[color:var(--email-bg)] px-2 font-sans'
          style={emailThemeVars as CSSProperties}
        >
          <Container className='mx-auto my-[40px] max-w-[465px] rounded-[8px] border-[0.5px] border-solid border-[color:var(--email-border)] bg-[color:var(--email-bg)] p-[20px]'>
            <Logo />
            <Text className='text-[14px] leading-[24px] text-[color:var(--email-fg)]'>
              {copy.greeting}
            </Text>
            <Text className='text-[14px] leading-[24px] text-[color:var(--email-fg)]'>
              {copy.intro}
            </Text>
            <Section className='mt-[32px] mb-[32px] text-center'>
              <Button
                className='rounded-[8px] bg-[color:var(--email-accent-bg)] px-5 py-3 text-center text-[12px] font-medium text-[color:var(--email-inverse)] no-underline'
                href={resetUrl}
              >
                {copy.button}
              </Button>
            </Section>
            <Text className='text-[14px] leading-[24px] text-[color:var(--email-fg)]'>
              {copy.alternative}{' '}
              <a href={resetUrl} className='text-[color:var(--email-accent)] no-underline'>
                {resetUrl}
              </a>
            </Text>
            <Text className='text-[14px] leading-[24px] text-[color:var(--email-muted)]'>
              {copy.expires}
            </Text>
            <Text className='text-[14px] leading-[24px] text-[color:var(--email-muted)]'>
              {copy.ignore}
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
  resetUrl: 'https://yuricunha.com/reset-password?token=abc123',
  locale: 'en'
} as PasswordResetProps

export default PasswordReset
