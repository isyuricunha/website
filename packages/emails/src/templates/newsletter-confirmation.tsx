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
import { EMAIL_LANG, type EmailLocale } from '../locales'

type NewsletterConfirmationProps = {
  confirmUrl: string
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
    preview: 'Confirm your newsletter subscription for yuricunha.com',
    intro:
      'You recently requested to subscribe to the yuricunha.com newsletter. Click the button below to confirm your subscription.',
    button: 'Confirm subscription',
    alternative: 'Or copy and paste this URL into your browser:',
    expires: 'This link will expire in 24 hours.',
    ignore: "If you didn't request this subscription, you can safely ignore this email."
  },
  pt: {
    preview: 'Confirme sua assinatura da newsletter do yuricunha.com',
    intro:
      'Você solicitou recentemente assinar a newsletter do yuricunha.com. Clique no botão abaixo para confirmar sua assinatura.',
    button: 'Confirmar assinatura',
    alternative: 'Ou copie e cole este URL no seu navegador:',
    expires: 'Este link expira em 24 horas.',
    ignore: 'Se você não solicitou essa assinatura, pode ignorar este e-mail com segurança.'
  },
  es: {
    preview: 'Confirma tu suscripción al boletín de yuricunha.com',
    intro:
      'Recientemente solicitaste suscribirte al boletín de yuricunha.com. Haz clic en el botón de abajo para confirmar tu suscripción.',
    button: 'Confirmar suscripción',
    alternative: 'O copia y pega esta URL en tu navegador:',
    expires: 'Este enlace caduca en 24 horas.',
    ignore: 'Si no solicitaste esta suscripción, puedes ignorar este correo con seguridad.'
  },
  ja: {
    preview: 'yuricunha.com のニュースレター登録の確認',
    intro:
      'yuricunha.com のニュースレターへの登録リクエストを受け付けました。下のボタンをクリックして登録を完了してください。',
    button: '登録を確認',
    alternative: 'または、この URL をブラウザに貼り付けてください:',
    expires: 'このリンクは 24 時間で失効します。',
    ignore: '心当たりのない場合は、このメールを無視して問題ありません。'
  },
  'zh-CN': {
    preview: '确认订阅 yuricunha.com 的新闻邮件',
    intro: '您最近请求订阅 yuricunha.com 的新闻邮件。点击下面的按钮确认您的订阅。',
    button: '确认订阅',
    alternative: '或者将此网址复制并粘贴到浏览器中：',
    expires: '此链接将在 24 小时后失效。',
    ignore: '如果您没有请求此订阅，可以放心忽略这封邮件。'
  },
  fr: {
    preview: 'Confirmez votre abonnement à la newsletter de yuricunha.com',
    intro:
      'Vous avez récemment demandé à vous abonner à la newsletter de yuricunha.com. Cliquez sur le bouton ci-dessous pour confirmer votre abonnement.',
    button: "Confirmer l'abonnement",
    alternative: 'Ou copiez-collez cette URL dans votre navigateur :',
    expires: 'Ce lien expirera dans 24 heures.',
    ignore:
      "Si vous n'avez pas demandé cet abonnement, vous pouvez ignorer cet e-mail en toute sécurité."
  },
  de: {
    preview: 'Bestätigen Sie Ihre Newsletter-Anmeldung für yuricunha.com',
    intro:
      'Sie haben kürzlich den Newsletter von yuricunha.com abonniert. Klicken Sie auf die Schaltfläche unten, um Ihre Anmeldung zu bestätigen.',
    button: 'Anmeldung bestätigen',
    alternative: 'Oder kopieren Sie diese URL und fügen Sie sie in Ihren Browser ein:',
    expires: 'Dieser Link läuft in 24 Stunden ab.',
    ignore:
      'Wenn Sie diese Anmeldung nicht angefordert haben, können Sie diese E-Mail sicher ignorieren.'
  }
}

const NewsletterConfirmation = (props: NewsletterConfirmationProps) => {
  const { confirmUrl } = props
  const locale = props.locale ?? 'en'
  const copy = copy_by_locale[locale]

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
              {copy.intro}
            </Text>
            <Section className='mt-[32px] mb-[32px] text-center'>
              <Button
                className='rounded-[8px] bg-[color:var(--email-accent-bg)] px-5 py-3 text-center text-[12px] font-medium text-[color:var(--email-inverse)] no-underline'
                href={confirmUrl}
              >
                {copy.button}
              </Button>
            </Section>
            <Text className='text-[14px] leading-[24px] text-[color:var(--email-fg)]'>
              {copy.alternative}{' '}
              <a href={confirmUrl} className='text-[color:var(--email-accent)] no-underline'>
                {confirmUrl}
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

NewsletterConfirmation.PreviewProps = {
  confirmUrl: 'https://yuricunha.com/api/newsletter/confirm?token=abc123',
  locale: 'en'
} as NewsletterConfirmationProps

export default NewsletterConfirmation
