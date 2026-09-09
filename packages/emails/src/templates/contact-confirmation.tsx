import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Link,
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

type ContactConfirmationProps = {
  name?: string
  subject?: string
  message?: string
  locale?: EmailLocale
}

const copy_by_locale: Record<
  EmailLocale,
  {
    preview: string
    title: (name: string) => string
    intro: string
    responseTime: string
    messageLabel: string
    subjectLabel: string
    messageLabelText: string
    visit: string
  }
> = {
  en: {
    preview: 'I received your message — I will reply within 48 hours.',
    title: (name) => `Thank you for reaching out, ${name}!`,
    intro: 'I received your message and it is now in my review queue.',
    responseTime: 'I will reply within 48 hours.',
    messageLabel: 'Your message',
    subjectLabel: 'Subject',
    messageLabelText: 'Message',
    visit: 'In the meantime, you can learn more about my work at'
  },
  pt: {
    preview: 'Recebi sua mensagem — vou responder em até 48 horas.',
    title: (name) => `Obrigado por entrar em contato, ${name}!`,
    intro: 'Recebi sua mensagem e ela já está na minha fila para análise.',
    responseTime: 'Vou responder em até 48 horas.',
    messageLabel: 'Sua mensagem',
    subjectLabel: 'Assunto',
    messageLabelText: 'Mensagem',
    visit: 'Enquanto isso, você pode conhecer mais do meu trabalho em'
  },
  es: {
    preview: 'He recibido tu mensaje — responderé en un plazo de 48 horas.',
    title: (name) => `¡Gracias por ponerte en contacto, ${name}!`,
    intro: 'He recibido tu mensaje y ya está en mi cola de revisión.',
    responseTime: 'Responderé en un plazo de 48 horas.',
    messageLabel: 'Tu mensaje',
    subjectLabel: 'Asunto',
    messageLabelText: 'Mensaje',
    visit: 'Mientras tanto, puedes conocer más de mi trabajo en'
  },
  ja: {
    preview: 'メッセージを受け付けました — 48時間以内に返信します。',
    title: (name) => `${name} さん、お問い合わせありがとうございます！`,
    intro: 'メッセージを受け付け、確認のためにキューに追加しました。',
    responseTime: '48時間以内に返信いたします。',
    messageLabel: 'お使いのメッセージ',
    subjectLabel: '件名',
    messageLabelText: 'メッセージ',
    visit: 'その間、私のその他の仕事はこちらからご覧いただけます：'
  },
  'zh-CN': {
    preview: '我已收到您的消息 —— 将在 48 小时内回复。',
    title: (name) => `感谢您的联系，${name}！`,
    intro: '我已收到您的消息，它已进入我的审阅队列。',
    responseTime: '我会在 48 小时内回复。',
    messageLabel: '您的消息',
    subjectLabel: '主题',
    messageLabelText: '消息',
    visit: '在此期间，您可以通过以下方式了解更多我的工作：'
  },
  fr: {
    preview: "J'ai bien reçu votre message — je répondrai sous 48 heures.",
    title: (name) => `Merci de m'avoir contacté, ${name} !`,
    intro: "J'ai reçu votre message et il est dans ma file d'attente.",
    responseTime: 'Je répondrai sous 48 heures.',
    messageLabel: 'Votre message',
    subjectLabel: 'Objet',
    messageLabelText: 'Message',
    visit: 'En attendant, vous pouvez découvrir mon travail sur'
  },
  de: {
    preview: 'Ich habe deine Nachricht erhalten — ich antworte innerhalb von 48 Stunden.',
    title: (name) => `Danke für deine Nachricht, ${name}!`,
    intro: 'Ich habe deine Nachricht erhalten und sie liegt zur Prüfung in meiner Warteschlange.',
    responseTime: 'Ich antworte innerhalb von 48 Stunden.',
    messageLabel: 'Deine Nachricht',
    subjectLabel: 'Betreff',
    messageLabelText: 'Nachricht',
    visit: 'In der Zwischenzeit kannst du hier mehr über meine Arbeit erfahren:'
  }
}

const site_link_by_locale: Record<EmailLocale, string> = {
  en: 'yuricunha.com',
  pt: 'yuricunha.com',
  es: 'yuricunha.com',
  ja: 'yuricunha.com',
  'zh-CN': 'yuricunha.com',
  fr: 'yuricunha.com',
  de: 'yuricunha.com'
}

const ContactConfirmation = (props: ContactConfirmationProps) => {
  const { name = 'there', subject, message } = props
  const locale = resolve_email_locale(props.locale)
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
            <Heading className='m-0 text-[22px] leading-[30px] font-medium text-[color:var(--email-fg)]'>
              {copy.title(name)}
            </Heading>
            <Text className='mb-0 text-[14px] leading-[24px] text-[color:var(--email-fg)]'>
              {copy.intro}
            </Text>
            <Text className='mt-3 text-[14px] leading-[24px] text-[color:var(--email-fg)]'>
              {copy.responseTime}
            </Text>
            {subject || message ? (
              <Section className='mt-6 rounded-[8px] border-[0.5px] border-solid border-[color:var(--email-border)] bg-[color:var(--email-surface)] p-4'>
                <Text className='m-0 mb-3 text-[12px] font-medium tracking-wide text-[color:var(--email-muted)] uppercase'>
                  {copy.messageLabel}
                </Text>
                {subject ? (
                  <>
                    <Text className='m-0 text-[12px] leading-[18px] text-[color:var(--email-muted)]'>
                      {copy.subjectLabel}
                    </Text>
                    <Text className='m-0 mb-3 text-[14px] leading-[21px] font-medium text-[color:var(--email-fg)]'>
                      {subject}
                    </Text>
                  </>
                ) : null}
                {message ? (
                  <>
                    <Text className='m-0 text-[12px] leading-[18px] text-[color:var(--email-muted)]'>
                      {copy.messageLabelText}
                    </Text>
                    <Text className='m-0 text-[14px] leading-[21px] whitespace-pre-wrap text-[color:var(--email-fg)]'>
                      {message}
                    </Text>
                  </>
                ) : null}
              </Section>
            ) : null}
            <Text className='mb-0 text-[14px] leading-[24px] text-[color:var(--email-muted)]'>
              {copy.visit}{' '}
              <Link
                href='https://yuricunha.com'
                className='text-[color:var(--email-accent)] no-underline'
              >
                {site_link_by_locale[locale]}
              </Link>
              .
            </Text>
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

ContactConfirmation.PreviewProps = {
  name: 'John',
  subject: 'Project inquiry',
  message: 'I would like to discuss a project.',
  locale: 'en'
} satisfies ContactConfirmationProps

export default ContactConfirmation
