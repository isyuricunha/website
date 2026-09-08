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

type ContactConfirmationProps = {
  name?: string
  subject?: string
  message?: string
  locale?: 'en' | 'pt'
}

const ContactConfirmation = (props: ContactConfirmationProps) => {
  const { name = 'there', subject, message } = props
  const locale = props.locale ?? 'en'

  const copy =
    locale === 'pt'
      ? {
          preview: 'Recebi sua mensagem — vou responder em até 48 horas.',
          title: `Obrigado por entrar em contato, ${name}!`,
          intro: 'Recebi sua mensagem e ela já está na minha fila para análise.',
          responseTime: 'Vou responder em até 48 horas.',
          messageLabel: 'Sua mensagem',
          subjectLabel: 'Assunto',
          messageLabelText: 'Mensagem',
          visit: 'Enquanto isso, você pode conhecer mais do meu trabalho em',
          site: 'yuricunha.com'
        }
      : {
          preview: 'I received your message — I will reply within 48 hours.',
          title: `Thank you for reaching out, ${name}!`,
          intro: 'I received your message and it is now in my review queue.',
          responseTime: 'I will reply within 48 hours.',
          messageLabel: 'Your message',
          subjectLabel: 'Subject',
          messageLabelText: 'Message',
          visit: 'In the meantime, you can learn more about my work at',
          site: 'yuricunha.com'
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
            <Heading className='m-0 text-[22px] leading-[30px] font-medium text-[color:var(--email-fg)]'>
              {copy.title}
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
                {copy.site}
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
