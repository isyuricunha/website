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
} from 'react-email'
import type { CSSProperties } from 'react'

import Footer from '../components/footer'
import Logo from '../components/logo'
import { emailThemeVars } from '../theme'
import { EMAIL_LANG, resolve_email_locale, type EmailLocale } from '../locales'

type CommentProps = {
  comment: string
  commenter: {
    name: string
    image: string
  }
  date: string
  id: string
  post: {
    title: string
    url: string
  }
  locale?: EmailLocale
}

const copy_by_locale: Record<
  EmailLocale,
  {
    title: string
    intro_before: string
    button: string
  }
> = {
  en: {
    title: 'New Comment on Your Blog Post',
    intro_before: 'Someone has commented on',
    button: 'View Comment'
  },
  pt: {
    title: 'Novo comentário no seu post',
    intro_before: 'Alguém comentou em',
    button: 'Ver comentário'
  },
  es: {
    title: 'Nuevo comentario en tu publicación',
    intro_before: 'Alguien ha comentado en',
    button: 'Ver comentario'
  },
  ja: {
    title: 'ブログ記事に新しいコメント',
    intro_before: '次の記事にコメントがありました：',
    button: 'コメントを見る'
  },
  'zh-CN': { title: '您的博客文章有新评论', intro_before: '有人评论了', button: '查看评论' },
  fr: {
    title: 'Nouveau commentaire sur votre article',
    intro_before: 'Quelqu’un a commenté',
    button: 'Voir le commentaire'
  },
  de: {
    title: 'Neuer Kommentar zu deinem Blogbeitrag',
    intro_before: 'Jemand hat kommentiert bei',
    button: 'Kommentar ansehen'
  }
}

const previews: Record<EmailLocale, (title: string) => string> = {
  en: (title) => `New comment on the post "${title}" on yuricunha.com`,
  pt: (title) => `Novo comentário no post "${title}" em yuricunha.com`,
  es: (title) => `Nuevo comentario en la publicación "${title}" en yuricunha.com`,
  ja: (title) => `記事「${title}」に新しいコメントがつきました（yuricunha.com）`,
  'zh-CN': (title) => `文章「${title}」在 yuricunha.com 上有新评论`,
  fr: (title) => `Nouveau commentaire sur l’article « ${title} » sur yuricunha.com`,
  de: (title) => `Neuer Kommentar zum Beitrag „${title}“ auf yuricunha.com`
}

const Comment = (props: CommentProps) => {
  const { comment, commenter, date, id, post } = props
  const locale = resolve_email_locale(props.locale)
  const copy = copy_by_locale[locale]
  const preview = previews[locale](post.title)

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
      <Preview>{preview}</Preview>
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
                {copy.intro_before}{' '}
                <Link href={post.url} className='font-medium text-[color:var(--email-fg)]'>
                  {post.title}
                </Link>
              </Text>
            </Section>
            <Section className='mt-6 rounded-lg border-[0.5px] border-solid border-[color:var(--email-border)] bg-[color:var(--email-surface)] p-6'>
              <Row>
                <Column className='w-10'>
                  <Img
                    src={commenter.image}
                    width={40}
                    height={40}
                    className='rounded-full'
                    alt={`${commenter.name}'s avatar`}
                  />
                </Column>
                <Column>
                  <Text className='m-0 p-0 pl-3 text-base font-medium text-[color:var(--email-fg)]'>
                    {commenter.name}
                  </Text>
                  <Text className='m-0 p-0 pl-3 text-sm font-normal text-[color:var(--email-muted)]'>
                    {date}
                  </Text>
                </Column>
              </Row>
              <Text className='m-0 mt-4 p-0 text-base font-normal text-[color:var(--email-fg)]'>
                {comment}
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

Comment.PreviewProps = {
  comment:
    'This is exactly what I needed! The explanations are clear and concise. Thanks for sharing! 👏',
  commenter: {
    name: 'John Doe',
    image: 'https://yuricunha.com/api/avatar/john-doe'
  },
  date: 'January 1, 2025',
  id: 'comment=1',
  post: {
    title: 'Understanding Modern Web Development',
    url: 'http://localhost:3000/blog/understanding-modern-web-development'
  }
} satisfies CommentProps

export default Comment
