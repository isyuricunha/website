import type { Metadata, ResolvingMetadata } from 'next'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui/server'
import { Mail, User, Github, Twitter, Linkedin } from 'lucide-react'

import PageTitle from '@/components/page-title'
import Link from '@/components/link'
import ContactForm from '@/components/contact-form'
import { getLocalizedPath } from '@/utils/get-localized-path'

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
  const url = getLocalizedPath({ slug: '/contact', locale })

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      ...previousOpenGraph,
      url,
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
      icon: <Github className='h-5 w-5' />,
      description: t('contact.social.github.description')
    },
    {
      name: t('contact.social.twitter.name'),
      href: 'https://x.com/isyuricunha',
      icon: <Twitter className='h-5 w-5' />,
      description: t('contact.social.twitter.description')
    },
    {
      name: t('contact.social.linkedin.name'),
      href: 'https://linkedin.com/in/isyuricunha',
      icon: <Linkedin className='h-5 w-5' />,
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
                      className='text-primary text-xs hover:underline sm:text-sm'
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
                      <p className='group-hover:text-primary text-sm font-medium'>{social.name}</p>
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
