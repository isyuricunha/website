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
} from 'react-email'
import type { CSSProperties } from 'react'

import Footer from '../components/footer'
import Logo from '../components/logo'
import { emailThemeVars } from '../theme'

type AccountDeletionProps = {
  name: string
  confirmationUrl: string
  locale?: 'en' | 'pt'
}

const AccountDeletion = (props: AccountDeletionProps) => {
  const { name, confirmationUrl } = props
  const locale = props.locale ?? 'en'

  const copy =
    locale === 'pt'
      ? {
          preview: 'Confirme a exclusão da sua conta em yuricunha.com',
          greeting: `Olá ${name},`,
          intro:
            'Recebemos uma solicitação para excluir permanentemente sua conta e os dados vinculados a ela. Confirme somente se foi você quem iniciou essa solicitação.',
          button: 'Confirmar exclusão da conta',
          alternative: 'Ou copie e cole este URL no navegador:',
          expires: 'Este link expira em 15 minutos.',
          warning: 'Esta ação é permanente e não pode ser desfeita.',
          ignore:
            'Se você não solicitou a exclusão, ignore este e-mail e sua conta permanecerá intacta.'
        }
      : {
          preview: 'Confirm deletion of your yuricunha.com account',
          greeting: `Hi ${name},`,
          intro:
            'We received a request to permanently delete your account and its associated data. Confirm only if you initiated this request.',
          button: 'Confirm account deletion',
          alternative: 'Or copy and paste this URL into your browser:',
          expires: 'This link expires in 15 minutes.',
          warning: 'This action is permanent and cannot be undone.',
          ignore:
            "If you didn't request deletion, ignore this email and your account will remain intact."
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
                href={confirmationUrl}
              >
                {copy.button}
              </Button>
            </Section>
            <Text className='text-[14px] leading-[24px] text-[color:var(--email-fg)]'>
              {copy.alternative}{' '}
              <a href={confirmationUrl} className='text-[color:var(--email-accent)] no-underline'>
                {confirmationUrl}
              </a>
            </Text>
            <Text className='text-[14px] leading-[24px] font-medium text-[color:var(--email-fg)]'>
              {copy.warning}
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

AccountDeletion.PreviewProps = {
  name: 'John Doe',
  confirmationUrl: 'https://yuricunha.com/api/auth/delete-user/callback?token=abc123',
  locale: 'en'
} as AccountDeletionProps

export default AccountDeletion
