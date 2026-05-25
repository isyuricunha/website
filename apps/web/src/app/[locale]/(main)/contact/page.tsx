import type { Metadata, ResolvingMetadata } from 'next'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui/server'
import { Mail, User } from 'lucide-react'
import { SiGithub, SiX } from '@icons-pack/react-simple-icons'

import PageTitle from '@/components/page-title'
import Link from '@/components/link'
import ContactForm from '@/components/contact-form'
import { SITE_URL } from '@/lib/constants'
import { build_alternates } from '@/lib/seo'

type PageProps = {
  params: Promise<{
    locale: string
  }>
}

export const generateStaticParams = (): Array<{ locale: string }> => {
  return i18n.locales.map((locale) => ({ locale }))
}

export const generateMetadata = async (
  props: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const { locale } = await props.params
  const t = await getTranslations({ locale })
  const previousOpenGraph = (await parent).openGraph ?? {}
  const previousTwitter = (await parent).twitter ?? {}
  const title = t('contact.title')
  const description = t('contact.description')
  const alternates = build_alternates({ slug: '/contact', locale })
  const fullUrl = `${SITE_URL}${alternates.canonical}`

  return {
    title,
    description,
    alternates,
    openGraph: {
      ...previousOpenGraph,
      url: fullUrl,
      type: 'website',
      title,
      description
    },
    twitter: {
      ...previousTwitter,
      title,
      description
    }
  }
}

const ContactPage = async (props: PageProps) => {
  const { locale } = await props.params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })

  const socialLinks = [
    {
      name: t('contact.social.github.name'),
      href: 'https://github.com/isyuricunha',
      icon: <SiGithub className='h-5 w-5' />,
      description: t('contact.social.github.description')
    },
    {
      name: t('contact.social.twitter.name'),
      href: 'https://x.com/isyuricunha',
      icon: <SiX className='h-5 w-5' />,
      description: t('contact.social.twitter.description')
    },
    {
      name: t('contact.social.linkedin.name'),
      href: 'https://linkedin.com/in/isyuricunha',
      icon: (
        <svg
          viewBox='0 0 24 24'
          className='h-5 w-5 fill-current'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
        </svg>
      ),
      description: t('contact.social.linkedin.description')
    }
  ]

  return (
    <>
      <PageTitle title={t('contact.page-title')} description={t('contact.page-description')} />

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Contact Form */}
        <ContactForm />

        {/* Contact Info & Social */}
        <div className='space-y-6'>
          {/* Direct Contact */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
                <Mail className='h-5 w-5' />
                {t('contact.direct.title')}
              </CardTitle>
              <CardDescription className='text-xs sm:text-sm'>
                {t('contact.direct.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='bg-muted/50 flex items-center gap-3 rounded-lg p-3'>
                  <Mail className='text-muted-foreground h-4 w-4' />
                  <div>
                    <p className='text-sm font-medium'>{t('contact.direct.email-label')}</p>
                    <Link
                      href='mailto:me@yuricunha.com'
                      className='text-accent-earth-text text-xs hover:underline sm:text-sm'
                    >
                      me@yuricunha.com
                    </Link>
                  </div>
                </div>

                <div className='text-muted-foreground text-xs sm:text-sm'>
                  <p className='mb-2'>{t('contact.direct.response-time')}</p>
                  <p>{t('contact.direct.urgent')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
                <User className='h-5 w-5' />
                {t('contact.social.title')}
              </CardTitle>
              <CardDescription className='text-xs sm:text-sm'>
                {t('contact.social.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className='hover:bg-muted/50 group flex items-center gap-3 rounded-lg p-3 transition-colors'
                  >
                    <div className='text-muted-foreground group-hover:text-foreground'>
                      {social.icon}
                    </div>
                    <div className='flex-1'>
                      <p className='group-hover:text-accent-earth-text text-sm font-medium'>
                        {social.name}
                      </p>
                      <p className='text-muted-foreground text-xs'>{social.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base sm:text-lg'>{t('contact.faq.title')}</CardTitle>
              <CardDescription className='text-xs sm:text-sm'>
                {t('contact.faq.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <h4 className='mb-1 text-sm font-medium'>
                    {t('contact.faq.freelance.question')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t('contact.faq.freelance.answer')}
                  </p>
                </div>
                <div>
                  <h4 className='mb-1 text-sm font-medium'>
                    {t('contact.faq.collaborations.question')}
                  </h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t('contact.faq.collaborations.answer')}
                  </p>
                </div>
                <div>
                  <h4 className='mb-1 text-sm font-medium'>{t('contact.faq.speaking.question')}</h4>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t('contact.faq.speaking.answer')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default ContactPage
