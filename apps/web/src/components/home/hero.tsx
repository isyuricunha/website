'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { BlurImage, buttonVariants } from '@isyuricunha/ui'
import { cn } from '@isyuricunha/utils'
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const t = useTranslations()
  const t_metadata = useTranslations('metadata')

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentIndex(0)
      return
    }

    const timer = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % TEXTS.length),
      SPEED * 1000
    )

    return () => clearInterval(timer)
  }, [prefersReducedMotion])

  const textItem = TEXTS[currentIndex]
  if (!textItem) return null

  return (
    <div className='my-6 space-y-3 sm:my-8 sm:space-y-4 lg:my-10'>
      <div className='flex flex-col gap-6 lg:flex-row lg:justify-between lg:gap-8'>
        <div className='flex flex-1 flex-col gap-4 text-center lg:text-left'>
          <h1 className='max-w-2xl text-lg font-medium leading-relaxed sm:text-xl lg:text-2xl xl:text-3xl'>
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
                {prefersReducedMotion ? (
                  <span className={textItem.className}>{t(`homepage.hero.${textItem.key}`)}</span>
                ) : (
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
                )}
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
              className={cn(
                buttonVariants({ size: 'sm' }),
                'rounded-full px-4 text-xs transition-transform hover:scale-[1.02] sm:text-sm'
              )}
            >
              {t('homepage.hero.view-projects')}
            </Link>
            <Link
              href='/blog'
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'rounded-full px-4 text-xs transition-transform hover:scale-[1.02] sm:text-sm'
              )}
            >
              {t('homepage.hero.read-blog')}
            </Link>
          </motion.div>
        </div>
        <motion.div
          className='relative mx-auto size-16 shrink-0 sm:size-20 lg:mx-0 lg:size-24 xl:size-28'
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
          <div className='bg-linear-to-tl absolute inset-0 -z-10 from-purple-700 to-orange-700 opacity-50 blur-2xl' />
        </motion.div>
      </div>
    </div>
  )
}

export default Hero
