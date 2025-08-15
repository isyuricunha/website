import type { Metadata, ResolvingMetadata } from 'next'

import { i18n } from '@tszhong0411/i18n/config'
import { setRequestLocale } from '@tszhong0411/i18n/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
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
  const previousOpenGraph = (await parent).openGraph ?? {}
  const previousTwitter = (await parent).twitter ?? {}
  const title = 'Contact'
  const description = 'Get in touch for collaborations, questions, or just to say hello'
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

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/isyuricunha',
      icon: <Github className='h-5 w-5' />,
      description: 'Follow my code and open source projects'
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/isyuricunha',
      icon: <Twitter className='h-5 w-5' />,
      description: 'Connect with me on Twitter'
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/isyuricunha',
      icon: <Linkedin className='h-5 w-5' />,
      description: 'Professional networking and career updates'
    }
  ]

  return (
    <>
      <PageTitle
        title="Contact"
        description="Let's connect! Reach out for collaborations, questions, or just to say hello"
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Contact Form */}
        <ContactForm />

        {/* Contact Info & Social */}
        <div className='space-y-6'>
          {/* Direct Contact */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
                <Mail className='h-5 w-5' />
                Direct Contact
              </CardTitle>
              <CardDescription className='text-xs sm:text-sm'>
                Prefer email? Reach out directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>Email</p>
                    <Link
                      href='mailto:me@yuricunha.com'
                      className='text-xs sm:text-sm text-primary hover:underline'
                    >
                      me@yuricunha.com
                    </Link>
                  </div>
                </div>

                <div className='text-xs sm:text-sm text-muted-foreground'>
                  <p className='mb-2'>I typically respond within 24-48 hours.</p>
                  <p>For urgent matters, please mention it in the subject line.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
                <User className='h-5 w-5' />
                Connect on Social
              </CardTitle>
              <CardDescription className='text-xs sm:text-sm'>
                Follow me on various platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className='group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors'
                  >
                    <div className='text-muted-foreground group-hover:text-foreground'>
                      {social.icon}
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium group-hover:text-primary'>
                        {social.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {social.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base sm:text-lg'>
                Quick Questions
              </CardTitle>
              <CardDescription className='text-xs sm:text-sm'>
                Common inquiries and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-sm font-medium mb-1'>Available for freelance work?</h4>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    Currently open to interesting projects. Let's discuss your needs!
                  </p>
                </div>
                <div>
                  <h4 className='text-sm font-medium mb-1'>Open to collaborations?</h4>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    Always interested in working with other developers on cool projects.
                  </p>
                </div>
                <div>
                  <h4 className='text-sm font-medium mb-1'>Speaking opportunities?</h4>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    Happy to speak at events about web development and open source.
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
