'use client'

import { useLocale, useTranslations } from '@tszhong0411/i18n/client'
import { i18n } from '@tszhong0411/i18n/config'
import { linkVariants } from '@tszhong0411/ui'

import Link from '@/components/link'
import { usePostContext } from '@/contexts/post'
import { useFormattedDate } from '@/hooks/use-formatted-date'

const getLocaleFolder = (loc: string) => {
  return loc === i18n.defaultLocale ? 'en' : loc
}

// Mover a função editURL para fora
function getEditURL(postSlug: string, postLocale: string) {
  return `https://github.com/isyuricunha/website/blob/main/apps/web/src/content/blog/${getLocaleFolder(
    postLocale
  )}/${postSlug}.mdx?plain=1`
}

const Footer = () => {
  const { slug, modifiedTime } = usePostContext()
  const t = useTranslations()
  const locale = useLocale()
  const formattedDate = useFormattedDate(modifiedTime)

  return (
    <div className='my-8 flex w-full items-center justify-between py-4 text-sm'>
      <Link href={getEditURL(slug, locale)} className={linkVariants({ variant: 'muted' })}>
        {t('blog.footer.edit-on-github')}
      </Link>
      <div className='text-muted-foreground'>
        {t('blog.footer.last-updated', { date: formattedDate })}
      </div>
    </div>
  )
}

export default Footer
