import { Img, Section } from 'react-email'

export default function Logo() {
  return (
    <Section className='mb-6'>
      <Img
        src='https://yuricunha.com/images/avatar.png'
        alt="Yuri Cunha's logo"
        width={48}
        height={48}
        style={{ display: 'block' }}
        className='rounded-full'
      />
    </Section>
  )
}
