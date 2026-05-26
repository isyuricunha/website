import { Column, Hr, Img, Link, Row, Section, Text } from 'react-email'

const currentYear = new Date().getFullYear()

const Footer = () => {
  return (
    <>
      <Hr className='mt-6 mb-3 border-t-[0.5px] border-solid border-[color:var(--email-border)]' />
      <Section>
        <Row className='mt-4' align='left' width='auto'>
          <Column className='pr-6 align-middle'>
            <Link href='https://x.com/isyuricunha' className='text-xl text-[color:var(--email-fg)]'>
              <Img
                src='https://yuricunha.com/images/email/x.png'
                alt='X'
                width={22}
                height={22}
                style={{ display: 'block', border: 0, outline: 'none' }}
              />
            </Link>
          </Column>
          <Column className='align-middle'>
            <Link
              href='https://github.com/isyuricunha/website'
              className='text-xl text-[color:var(--email-fg)]'
            >
              <Img
                src='https://yuricunha.com/images/email/github.png'
                alt='GitHub'
                width={22}
                height={22}
                style={{ display: 'block', border: 0, outline: 'none' }}
              />
            </Link>
          </Column>
        </Row>
      </Section>
      <Text className='m-0 mt-6 p-0 text-xs font-normal text-[color:var(--email-muted)]'>
        © {currentYear} Yuri Cunha. All rights reserved.
      </Text>
    </>
  )
}

export default Footer
