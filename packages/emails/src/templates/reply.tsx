import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text
} from '@react-email/components'
import type { CSSProperties } from 'react'

import Footer from '../components/footer'
import Logo from '../components/logo'
import { emailThemeVars } from '../theme'

type ReplyProps = {
  reply: string
  replier: {
    name: string
    image: string
  }
  comment: string
  date: string
  id: string
  post: {
    title: string
    url: string
  }
  locale?: 'en' | 'pt'
}

const Reply = (props: ReplyProps) => {
  const { reply, replier, comment, date, id, post } = props
  const locale = props.locale ?? 'en'

  const copy =
    locale === 'pt'
      ? {
          preview: `Nova resposta no post "${post.title}" em yuricunha.com`,
          title: 'Resposta ao seu comentário',
          intro_after_name: 'respondeu ao seu comentário em',
          button: 'Ver resposta'
        }
      : {
          preview: `New reply on the post "${post.title}" on yuricunha.com`,
          title: 'Reply to Your Comment',
          intro_after_name: 'replied to your comment on',
          button: 'View Reply'
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
          className='m-auto bg-[color:var(--email-bg)] p-1'
          style={emailThemeVars as CSSProperties}
        >
          <Container className='mx-auto w-full max-w-[660px] rounded-lg border-[0.5px] border-solid border-[color:var(--email-border)] bg-[color:var(--email-bg)] p-8 shadow-sm'>
            <Logo />
            <Section>
              <Text className='m-0 p-0 text-xl font-medium text-[color:var(--email-fg)]'>
                {copy.title}
              </Text>
              <Text className='m-0 mt-2 p-0 text-base font-normal text-[color:var(--email-muted)]'>
                {replier.name} {copy.intro_after_name}{' '}
                <Link href={post.url} className='font-medium text-[color:var(--email-fg)]'>
                  {post.title}
                </Link>
              </Text>
            </Section>
            <Section className='mt-6 rounded-lg border-[0.5px] border-solid border-[color:var(--email-border)] bg-[color:var(--email-surface)] p-6'>
              <Row>
                <Column className='w-10'>
                  <Img
                    src={replier.image}
                    width={40}
                    height={40}
                    className='rounded-full'
                    alt={`${replier.name}'s avatar`}
                  />
                </Column>
                <Column>
                  <Text className='m-0 p-0 pl-3 text-base font-medium text-[color:var(--email-fg)]'>
                    {replier.name}
                  </Text>
                  <Text className='m-0 p-0 pl-3 text-sm font-normal text-[color:var(--email-muted)]'>
                    {date}
                  </Text>
                </Column>
              </Row>
              <Section className='mt-4 rounded-r-lg border-l-[2px] border-solid border-[color:var(--email-accent-border)] bg-[color:var(--email-elevated)] px-3 py-4'>
                <Text className='m-0 p-0 text-sm font-normal text-[color:var(--email-muted)]'>
                  {comment}
                </Text>
              </Section>
              <Text className='m-0 mt-4 p-0 text-base font-normal text-[color:var(--email-fg)]'>
                {reply}
              </Text>
            </Section>
            <Button
              className='mt-6 rounded-[8px] bg-[color:var(--email-accent-bg)] px-8 py-2.5 align-middle text-sm font-medium text-[color:var(--email-inverse)]'
              href={`${post.url}?${id}`}
            >
              {copy.button}
            </Button>
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

Reply.PreviewProps = {
  reply:
    "Thank you for your kind words! I'm glad you found the article helpful. Let me know if you have any questions!",
  replier: {
    name: 'John Smith',
    image: 'https://yuricunha.com/api/avatar/john-doe'
  },
  comment:
    'This is exactly what I needed! The explanations are clear and concise. Thanks for sharing! 👏',
  date: 'January 2, 2025',
  id: 'comment=1&reply=1',
  post: {
    title: 'Understanding Modern Web Development',
    url: 'http://localhost:3000/blog/understanding-modern-web-development'
  }
} satisfies ReplyProps

export default Reply
