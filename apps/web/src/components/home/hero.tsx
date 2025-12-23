'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { BlurImage } from '@isyuricunha/ui'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import Link from '../link'

const TEXTS = [
  {
    key: 'amazing',
    className: 'bg-clip-text text-center text-transparent bg-linear-to-r from-primary to-primary/60'
  },
  {
    key: 'stunning',
    className: 'bg-clip-text text-center text-transparent bg-linear-to-r from-primary to-primary/60'
  },
  {
    key: 'fantastic',
    className: 'bg-clip-text text-center text-transparent bg-linear-to-r from-primary to-primary/60'
  },
  {
    key: 'attractive',
    className: 'bg-clip-text text-center text-transparent bg-linear-to-r from-primary to-primary/60'
  }
] as const

const SPEED = 2

const variants = {
  enter: {
    y: 100,
    opacity: 0
  },
  center: {
    y: 0,
    opacity: 1
  },
  exit: {
    y: -100,
    opacity: 0
  }
}

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const t = useTranslations()
  const t_metadata = useTranslations('metadata')

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % TEXTS.length),
      SPEED * 1000
    )

    return () => clearInterval(timer)
  }, [])

  const textItem = TEXTS[currentIndex]
  if (!textItem) return null

  return (
    <div className='my-6 space-y-3 sm:my-8 sm:space-y-4 lg:my-10'>
      <div className='flex flex-col gap-6 lg:flex-row lg:justify-between lg:gap-8'>
        <div className='flex flex-1 flex-col gap-4 text-center lg:text-left'>
          <h1 className='max-w-2xl text-base leading-relaxed font-medium sm:text-lg lg:text-xl xl:text-2xl'>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ ease: 'easeOut' }}
              className='mb-1'
            >
              {t('homepage.hero.title-top')}
            </motion.div>
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ ease: 'easeOut' }}
              className='mb-1'
            >
              <span>{t('homepage.hero.title-middle-left')} </span>
              <div className='relative inline-block min-w-[60px] align-baseline'>
                <AnimatePresence mode='popLayout'>
                  <motion.div
                    key={currentIndex}
                    variants={variants}
                    initial='enter'
                    animate='center'
                    exit='exit'
                    transition={{
                      type: 'tween',
                      duration: 0.3
                    }}
                    className='inline-block align-baseline'
                  >
                    <span className={textItem.className}>{t(`homepage.hero.${textItem.key}`)}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
              <span> {t('homepage.hero.title-middle-right')}</span>
            </motion.div>
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ ease: 'easeOut' }}
            >
              {t('homepage.hero.title-bottom')}
            </motion.div>
          </h1>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ease: 'easeOut' }}
            className='text-muted-foreground max-w-md text-sm sm:text-base'
          >
            {t('homepage.hero.location-timezone')}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ease: 'easeOut', delay: 0.4 }}
            className='mx-auto flex max-w-sm flex-col gap-2 pt-3 sm:flex-row sm:gap-3 lg:mx-0'
          >
            <Link
              href='/projects'
              className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-[36px] items-center justify-center rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm'
            >
              {t('homepage.hero.view-projects')}
            </Link>
            <Link
              href='/blog'
              className='border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex min-h-[36px] items-center justify-center rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm'
            >
              {t('homepage.hero.read-blog')}
            </Link>
          </motion.div>
        </div>
        <motion.div
          className='relative mx-auto size-16 flex-shrink-0 sm:size-20 lg:mx-0 lg:size-24 xl:size-28'
          initial={{
            scale: 0
          }}
          animate={{
            scale: 1
          }}
          transition={{
            duration: 0.3
          }}
        >
          <BlurImage
            src='/images/avatar.png'
            className='h-full w-full rounded-full object-cover'
            width={144}
            height={144}
            alt={t_metadata('site-title')}
            lazy={false}
          />
          <div className='absolute inset-0 -z-10 bg-linear-to-tl from-purple-700 to-orange-700 opacity-50 blur-2xl' />
        </motion.div>
      </div>
    </div>
  )
}

export default Hero
