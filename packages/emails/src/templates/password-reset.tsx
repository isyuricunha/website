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

type PasswordResetProps = {
  name: string
  resetUrl: string
  locale?: EmailLocale
}

const copy_by_locale: Record<
  EmailLocale,
  {
    preview: string
    intro: string
    button: string
    alternative: string
    expires: string
    ignore: string
  }
> = {
  en: {
    preview: 'Reset your password for yuricunha.com',
    intro:
      'You recently requested to reset your password for your yuricunha.com account. Click the button below to reset it.',
    button: 'Reset Password',
    alternative: 'Or copy and paste this URL into your browser:',
    expires: 'This link will expire in 1 hour for security reasons.',
    ignore: "If you didn't request this password reset, you can safely ignore this email."
  },
  pt: {
    preview: 'Redefina sua senha para yuricunha.com',
    intro:
      'Você solicitou recentemente a redefinição da senha da sua conta em yuricunha.com. Clique no botão abaixo para redefinir.',
    button: 'Redefinir senha',
    alternative: 'Ou copie e cole este URL no seu navegador:',
    expires: 'Este link expira em 1 hora por motivos de segurança.',
    ignore:
      'Se você não solicitou essa redefinição de senha, pode ignorar este e-mail com segurança.'
  },
  es: {
    preview: 'Restablece tu contraseña para yuricunha.com',
    intro:
      'Recientemente solicitaste restablecer la contraseña de tu cuenta en yuricunha.com. Haz clic en el botón de abajo para restablecerla.',
    button: 'Restablecer contraseña',
    alternative: 'O copia y pega esta URL en tu navegador:',
    expires: 'Este enlace caduca en 1 hora por motivos de seguridad.',
    ignore:
      'Si no solicitaste este restablecimiento de contraseña, puedes ignorar este correo con seguridad.'
  },
  ja: {
    preview: 'yuricunha.com のパスワードをリセット',
    intro:
      'yuricunha.com アカウントのパスワードリセットを受け付けました。下のボタンをクリックしてパスワードを再設定してください。',
    button: 'パスワードをリセット',
    alternative: 'または、この URL をブラウザに貼り付けてください:',
    expires: 'セキュリティ上の理由により、このリンクは 1 時間で失効します。',
    ignore: '心当たりのない場合は、このメールを無視して問題ありません。'
  },
  'zh-CN': {
    preview: '重置您在 yuricunha.com 的密码',
    intro: '您最近请求重置 yuricunha.com 账户的密码。点击下面的按钮进行重置。',
    button: '重置密码',
    alternative: '或者将此网址复制并粘贴到浏览器中：',
    expires: '出于安全考虑，此链接将在 1 小时后失效。',
    ignore: '如果您没有请求重置密码，可以放心忽略这封邮件。'
  },
  fr: {
    preview: 'Réinitialisez votre mot de passe pour yuricunha.com',
    intro:
      'Vous avez récemment demandé la réinitialisation du mot de passe de votre compte yuricunha.com. Cliquez sur le bouton ci-dessous pour le réinitialiser.',
    button: 'Réinitialiser le mot de passe',
    alternative: 'Ou copiez-collez cette URL dans votre navigateur :',
    expires: 'Ce lien expirera dans 1 heure pour des raisons de sécurité.',
    ignore:
      "Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité."
  },
  de: {
    preview: 'Setzen Sie Ihr Passwort für yuricunha.com zurück',
    intro:
      'Sie haben kürzlich das Zurücksetzen des Passworts für Ihr yuricunha.com-Konto angefordert. Klicken Sie zum Zurücksetzen auf die Schaltfläche unten.',
    button: 'Passwort zurücksetzen',
    alternative: 'Oder kopieren Sie diese URL und fügen Sie sie in Ihren Browser ein:',
    expires: 'Dieser Link läuft aus Sicherheitsgründen in 1 Stunde ab.',
    ignore:
      'Wenn Sie diese Passwort-Anforderung nicht veranlasst haben, können Sie diese E-Mail sicher ignorieren.'
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

const PasswordReset = (props: PasswordResetProps) => {
  const { name, resetUrl } = props
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
