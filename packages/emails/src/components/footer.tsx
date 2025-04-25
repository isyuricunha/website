import { Column, Hr, Img, Link, Row, Section, Text } from '@react-email/components'

const Footer = () => {
  return (
    <>
      <Hr className='border-t-border mb-3 mt-6' />
      <Section>
        <Row className='mt-4' align='left' width='auto'>
          <Column className='pr-6 align-middle'>
            <Link href='https://twitter.com/isyuricunha' className='text-xl text-black'>
              <Img src='https://yuricunha.com/images/email/x.png' alt='X' width={22} height={22} />
            </Link>
          </Column>
          <Column className='align-middle'>
            <Link href='https://github.com/isyuricunha/website' className='text-xl text-black'>
              <Img
                src='https://yuricunha.com/images/email/github.png'
                alt='GitHub'
                width={22}
                height={22}
              />
            </Link>
          </Column>
        </Row>
      </Section>
      <Text className='m-0 mt-6 p-0 text-xs font-normal text-gray-500'>
        © {new Date().getFullYear()} Yuri Cunha. All rights reserved.
      </Text>
    </>
  )
}

export default Footer
