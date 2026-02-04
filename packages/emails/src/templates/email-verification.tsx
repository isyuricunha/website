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
} from '@react-email/components'

import Footer from '../components/footer'
import Logo from '../components/logo'

type EmailVerificationProps = {
    name: string
    verifyUrl: string
    locale?: 'en' | 'pt'
}

const EmailVerification = (props: EmailVerificationProps) => {
    const { name, verifyUrl } = props
    const locale = props.locale ?? 'en'

    const copy =
        locale === 'pt'
            ? {
                preview: 'Verifique seu e-mail para yuricunha.com',
                greeting: `Olá ${name},`,
                intro:
                    'Você solicitou a verificação do seu e-mail para sua conta em yuricunha.com. Clique no botão abaixo para confirmar.',
                button: 'Verificar e-mail',
                alternative: 'Ou copie e cole este URL no seu navegador:',
                ignore: 'Se você não solicitou isso, pode ignorar este e-mail com segurança.'
            }
            : {
                preview: 'Verify your email for yuricunha.com',
                greeting: `Hi ${name},`,
                intro:
                    'You requested email verification for your yuricunha.com account. Click the button below to confirm.',
                button: 'Verify email',
                alternative: 'Or copy and paste this URL into your browser:',
                ignore: "If you didn't request this, you can safely ignore this email."
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
                <Body className='mx-auto my-auto bg-white px-2 font-sans'>
                    <Container className='mx-auto my-[40px] max-w-[465px] rounded border border-solid border-gray-200 p-[20px]'>
                        <Logo />
                        <Text className='text-[14px] leading-[24px] text-black'>{copy.greeting}</Text>
                        <Text className='text-[14px] leading-[24px] text-black'>{copy.intro}</Text>
                        <Section className='mt-[32px] mb-[32px] text-center'>
                            <Button
                                className='rounded bg-black px-5 py-3 text-center text-[12px] font-semibold text-white no-underline'
                                href={verifyUrl}
                            >
                                {copy.button}
                            </Button>
                        </Section>
                        <Text className='text-[14px] leading-[24px] text-black'>
                            {copy.alternative}{' '}
                            <a href={verifyUrl} className='text-blue-600 no-underline'>
                                {verifyUrl}
                            </a>
                        </Text>
                        <Text className='text-[14px] leading-[24px] text-black'>{copy.ignore}</Text>
                        <Footer />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}

EmailVerification.PreviewProps = {
    name: 'John Doe',
    verifyUrl: 'https://yuricunha.com/api/auth/verify-email?token=abc123',
    locale: 'en'
} as EmailVerificationProps

export default EmailVerification
