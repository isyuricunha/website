'use client'

import { useLocale, useTranslations } from '@isyuricunha/i18n/client'
import { BlurImage } from '@isyuricunha/ui'
import { motion } from 'motion/react'

import Link from '../link'

const Hero = () => {
  const locale = useLocale()
  const t = useTranslations()
  const t_metadata = useTranslations('metadata')

  return (
    <section className='relative grid min-h-[calc(100vh-10rem)] items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_0.7fr] lg:py-24'>
      <motion.div
        className='flex flex-col items-start gap-6'
        initial={false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span className='label-mono'>{t('homepage.hero.location-timezone')}</span>
        <h1 className='max-w-4xl text-[clamp(32px,4vw,52px)] font-normal tracking-tighter text-balance'>
          <span>{t('homepage.hero.title-top')}</span>{' '}
          <span>{t('homepage.hero.title-middle-left')}</span>{' '}
          {locale === 'pt' ? (
            <>
              <span>{t('homepage.hero.title-middle-right')}</span>{' '}
              <span className='text-accent-earth-text'>{t('homepage.hero.amazing')}</span>
            </>
          ) : (
            <>
              <span className='text-accent-earth-text'>{t('homepage.hero.amazing')}</span>{' '}
              <span>{t('homepage.hero.title-middle-right')}</span>
            </>
          )}{' '}
          <span>{t('homepage.hero.title-bottom')}</span>
        </h1>
        <p className='text-muted-foreground max-w-xl text-[15px] leading-relaxed'>
          {t_metadata('site-description')}
        </p>

        <div className='flex flex-col gap-3 sm:flex-row'>
          <Link
            href='/projects'
            className='border-accent-earth-hover bg-accent-earth hover:bg-accent-earth-hover inline-flex min-h-9 items-center justify-center rounded-md border px-5 py-2 text-[13px] font-medium text-[var(--text-primary)] transition-colors'
          >
            {t('homepage.hero.view-projects')}
          </Link>
          <Link
            href='/blog'
            className='text-muted-foreground hover:bg-bg-hover hover:text-foreground inline-flex min-h-9 items-center justify-center rounded-md border border-[var(--border-default)] px-5 py-2 text-[13px] font-medium transition-colors hover:border-[var(--border-strong)]'
          >
            {t('homepage.hero.read-blog')}
          </Link>
        </div>
      </motion.div>

      <motion.div
        className='app-window mx-auto w-full max-w-sm'
        initial={false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className='app-window-chrome'>
          <span className='window-dot' />
          <span className='window-dot' />
          <span className='window-dot' />
        </div>
        <div className='flex flex-col items-center gap-6 p-8'>
          <div className='relative size-28'>
            <BlurImage
              src='/images/avatar.png'
              fill
              sizes='112px'
              className='rounded-lg'
              imageClassName='object-cover'
              alt={t_metadata('site-title')}
              lazy={false}
            />
          </div>
          <div className='code-block w-full'>
            <div className='text-text-tertiary'>{t('homepage.hero.code.database-specialist')}</div>
            <div>{t('homepage.hero.code.region')}</div>
            <div>{t('homepage.hero.code.focus')}</div>
          </div>
          <p className='text-muted-foreground text-center text-sm'>
            {t('homepage.hero.location-timezone')}
          </p>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
