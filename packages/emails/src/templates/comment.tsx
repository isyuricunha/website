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

import Footer from '../components/footer'
import Logo from '../components/logo'

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
  locale?: 'en' | 'pt'
}

const Comment = (props: CommentProps) => {
  const { comment, commenter, date, id, post } = props
  const locale = props.locale ?? 'en'

  const copy =
    locale === 'pt'
      ? {
          preview: `Novo comentário no post "${post.title}" em yuricunha.com`,
          title: 'Novo comentário no seu post',
          intro_before: 'Alguém comentou em',
          button: 'Ver comentário'
        }
      : {
          preview: `New comment on the post "${post.title}" on yuricunha.com`,
          title: 'New Comment on Your Blog Post',
          intro_before: 'Someone has commented on',
          button: 'View Comment'
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
        <Body className='m-auto bg-white p-1'>
          <Container className='mx-auto w-full max-w-[660px] rounded-lg border border-solid border-gray-200 bg-white p-8 shadow-sm'>
            <Logo />
            <Section>
              <Text className='m-0 p-0 text-xl font-semibold text-gray-900'>{copy.title}</Text>
              <Text className='m-0 mt-2 p-0 text-base font-normal text-gray-600'>
                {copy.intro_before}{' '}
                <Link href={post.url} className='font-medium text-gray-900'>
                  {post.title}
                </Link>
              </Text>
            </Section>
            <Section className='mt-6 rounded-lg border border-solid border-gray-200 bg-gray-50 p-6'>
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
                  <Text className='m-0 p-0 pl-3 text-base font-medium text-gray-900'>
                    {commenter.name}
                  </Text>
                  <Text className='m-0 p-0 pl-3 text-sm font-normal text-gray-600'>{date}</Text>
                </Column>
              </Row>
              <Text className='m-0 mt-4 p-0 text-base font-normal text-gray-700'>{comment}</Text>
            </Section>
            <Button
              className='mt-6 rounded-full bg-gray-900 px-8 py-2.5 align-middle text-sm font-medium text-white'
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
