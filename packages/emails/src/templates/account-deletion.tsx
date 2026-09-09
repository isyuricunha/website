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

type AccountDeletionProps = {
  name: string
  confirmationUrl: string
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
    warning: string
    ignore: string
  }
> = {
  en: {
    preview: 'Confirm deletion of your yuricunha.com account',
    intro:
      'We received a request to permanently delete your account and its associated data. Confirm only if you initiated this request.',
    button: 'Confirm account deletion',
    alternative: 'Or copy and paste this URL into your browser:',
    expires: 'This link expires in 15 minutes.',
    warning: 'This action is permanent and cannot be undone.',
    ignore: "If you didn't request deletion, ignore this email and your account will remain intact."
  },
  pt: {
    preview: 'Confirme a exclusão da sua conta em yuricunha.com',
    intro:
      'Recebemos uma solicitação para excluir permanentemente sua conta e os dados vinculados a ela. Confirme somente se foi você quem iniciou essa solicitação.',
    button: 'Confirmar exclusão da conta',
    alternative: 'Ou copie e cole este URL no navegador:',
    expires: 'Este link expira em 15 minutos.',
    warning: 'Esta ação é permanente e não pode ser desfeita.',
    ignore: 'Se você não solicitou a exclusão, ignore este e-mail e sua conta permanecerá intacta.'
  },
  es: {
    preview: 'Confirma la eliminación de tu cuenta en yuricunha.com',
    intro:
      'Recibimos una solicitud para eliminar permanentemente tu cuenta y los datos asociados. Confirma solo si tú iniciaste esta solicitud.',
    button: 'Confirmar eliminación de cuenta',
    alternative: 'O copia y pega esta URL en tu navegador:',
    expires: 'Este enlace caduca en 15 minutos.',
    warning: 'Esta acción es permanente y no se puede deshacer.',
    ignore: 'Si no solicitaste la eliminación, ignora este correo y tu cuenta permanecerá intacta.'
  },
  ja: {
    preview: 'yuricunha.com アカウントの削除の確認',
    intro:
      'アカウントと関連データを完全に削除するリクエストを受け付けました。ご本人によるリクエストの場合のみご確認ください。',
    button: 'アカウント削除を確認',
    alternative: 'または、この URL をブラウザに貼り付けてください:',
    expires: 'このリンクは 15 分で失効します。',
    warning: 'この操作は元に戻せません。',
    ignore: '心当たりのない場合は、このメールを無視すればアカウントはそのまま維持されます。'
  },
  'zh-CN': {
    preview: '确认删除您在 yuricunha.com 的账户',
    intro: '我们收到永久删除您的账户及其相关数据的请求。只有您本人发起此请求时才需确认。',
    button: '确认删除账户',
    alternative: '或者将此网址复制并粘贴到浏览器中：',
    expires: '此链接将在 15 分钟后失效。',
    warning: '此操作永久生效且无法撤销。',
    ignore: '如果您没有请求删除账户，请忽略此邮件，您的账户将保持不变。'
  },
  fr: {
    preview: 'Confirmez la suppression de votre compte yuricunha.com',
    intro:
      "Nous avons reçu une demande de suppression définitive de votre compte et de ses données associées. Ne confirmez que si vous êtes à l'origine de cette demande.",
    button: 'Confirmer la suppression du compte',
    alternative: 'Ou copiez-collez cette URL dans votre navigateur :',
    expires: 'Ce lien expirera dans 15 minutes.',
    warning: 'Cette action est permanente et irréversible.',
    ignore:
      "Si vous n'avez pas demandé cette suppression, ignorez cet e-mail et votre compte restera intact."
  },
  de: {
    preview: 'Bestätigen Sie die Löschung Ihres yuricunha.com-Kontos',
    intro:
      'Wir haben eine Anfrage erhalten, Ihr Konto und die zugehörigen Daten endgültig zu löschen. Bestätigen Sie dies nur, wenn Sie die Anfrage selbst gestellt haben.',
    button: 'Kontolöschung bestätigen',
    alternative: 'Oder kopieren Sie diese URL und fügen Sie sie in Ihren Browser ein:',
    expires: 'Dieser Link läuft in 15 Minuten ab.',
    warning: 'Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden.',
    ignore:
      'Wenn Sie die Löschung nicht angefordert haben, ignorieren Sie diese E-Mail und Ihr Konto bleibt bestehen.'
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

const AccountDeletion = (props: AccountDeletionProps) => {
  const { name, confirmationUrl } = props
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
