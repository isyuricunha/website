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
import { EMAIL_LANG, resolve_email_locale, type EmailLocale } from '../locales'

type EmailVerificationProps = {
  name: string
  verifyUrl: string
  locale?: EmailLocale
}

const copy_by_locale: Record<
  EmailLocale,
  {
    preview: string
    intro: string
    button: string
    alternative: string
    ignore: string
  }
> = {
  en: {
    preview: 'Verify your email for yuricunha.com',
    intro:
      'You requested email verification for your yuricunha.com account. Click the button below to confirm.',
    button: 'Verify email',
    alternative: 'Or copy and paste this URL into your browser:',
    ignore: "If you didn't request this, you can safely ignore this email."
  },
  pt: {
    preview: 'Verifique seu e-mail para yuricunha.com',
    intro:
      'Você solicitou a verificação do seu e-mail para sua conta em yuricunha.com. Clique no botão abaixo para confirmar.',
    button: 'Verificar e-mail',
    alternative: 'Ou copie e cole este URL no seu navegador:',
    ignore: 'Se você não solicitou isso, pode ignorar este e-mail com segurança.'
  },
  es: {
    preview: 'Verifica tu correo electrónico para yuricunha.com',
    intro:
      'Solicitaste la verificación de tu correo electrónico para tu cuenta en yuricunha.com. Haz clic en el botón de abajo para confirmar.',
    button: 'Verificar correo electrónico',
    alternative: 'O copia y pega esta URL en tu navegador:',
    ignore: 'Si no solicitaste esto, puedes ignorar este correo con seguridad.'
  },
  ja: {
    preview: 'yuricunha.com のメールアドレス確認',
    intro:
      'yuricunha.com アカウントのメールアドレス確認を受け付けました。下のボタンをクリックして確認してください。',
    button: 'メールアドレスを確認',
    alternative: 'または、この URL をブラウザに貼り付けてください:',
    ignore: '心当たりのない場合は、このメールを無視して問題ありません。'
  },
  'zh-CN': {
    preview: '验证您在 yuricunha.com 的电子邮箱',
    intro: '您请求验证 yuricunha.com 账户的电子邮箱。点击下面的按钮进行确认。',
    button: '验证电子邮箱',
    alternative: '或者将此网址复制并粘贴到浏览器中：',
    ignore: '如果您没有请求此项操作，可以放心忽略这封邮件。'
  },
  fr: {
    preview: 'Vérifiez votre e-mail pour yuricunha.com',
    intro:
      "Vous avez demandé la vérification de l'e-mail de votre compte yuricunha.com. Cliquez sur le bouton ci-dessous pour confirmer.",
    button: "Vérifier l'e-mail",
    alternative: 'Ou copiez-collez cette URL dans votre navigateur :',
    ignore:
      "Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet e-mail en toute sécurité."
  },
  de: {
    preview: 'Bestätigen Sie Ihre E-Mail-Adresse für yuricunha.com',
    intro:
      'Sie haben die Verifizierung Ihrer E-Mail-Adresse für Ihr yuricunha.com-Konto angefordert. Klicken Sie zur Bestätigung auf die Schaltfläche unten.',
    button: 'E-Mail-Adresse bestätigen',
    alternative: 'Oder kopieren Sie diese URL und fügen Sie sie in Ihren Browser ein:',
    ignore: 'Wenn Sie dies nicht angefordert haben, können Sie diese E-Mail sicher ignorieren.'
  }
}

const greetings: Record<EmailLocale, (name: string) => string> = {
  en: (name) => `Hi ${name},`,
  pt: (name) => `Olá ${name},`,
  es: (name) => `Hola ${name},`,
  ja: (name) => `${name} さん、`,
  'zh-CN': (name) => `${name}，您好！`,
  fr: (name) => `Bonjour ${name},`,
  de: (name) => `Hallo ${name},`
}

const EmailVerification = (props: EmailVerificationProps) => {
  const { name, verifyUrl } = props
  const locale = resolve_email_locale(props.locale)
  const copy = copy_by_locale[locale]
  const greeting = greetings[locale](name)

  return (
    <Html lang={EMAIL_LANG[locale]} dir='ltr'>
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
              {greeting}
            </Text>
            <Text className='text-[14px] leading-[24px] text-[color:var(--email-fg)]'>
              {copy.intro}
            </Text>
            <Section className='mt-[32px] mb-[32px] text-center'>
              <Button
                className='rounded-[8px] bg-[color:var(--email-accent-bg)] px-5 py-3 text-center text-[12px] font-medium text-[color:var(--email-inverse)] no-underline'
                href={verifyUrl}
              >
                {copy.button}
              </Button>
            </Section>
            <Text className='text-[14px] leading-[24px] text-[color:var(--email-fg)]'>
              {copy.alternative}{' '}
              <a href={verifyUrl} className='text-[color:var(--email-accent)] no-underline'>
                {verifyUrl}
              </a>
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

EmailVerification.PreviewProps = {
  name: 'John Doe',
  verifyUrl: 'https://yuricunha.com/api/auth/verify-email?token=abc123',
  locale: 'en'
} as EmailVerificationProps

export default EmailVerification
