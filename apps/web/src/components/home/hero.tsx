'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { BlurImage } from '@tszhong0411/ui'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import Link from '../link'

const TEXTS = [
  {
    key: 'amazing',
    className:
      'bg-clip-text text-center text-transparent bg-linear-to-r from-[#ff1835] to-[#ffc900]'
  },
  {
    key: 'stunning',
    className:
      'bg-clip-text text-center text-transparent bg-linear-to-r from-[#0077ff] to-[#00e7df]'
  },
  {
    key: 'fantastic',
    className:
      'bg-clip-text text-center text-transparent bg-linear-to-r from-[#7f00de] to-[#ff007f]'
  },
  {
    key: 'attractive',
    className:
      'bg-clip-text text-center text-transparent bg-linear-to-r from-[#2ecc70] to-[#1ca085]'
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
    <div className='my-6 sm:my-8 lg:my-10 space-y-3 sm:space-y-4'>
      <div className='flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-8'>
        <div className='flex flex-col gap-4 flex-1 text-center lg:text-left'>
          <h1 className='text-base font-medium sm:text-lg lg:text-xl xl:text-2xl leading-relaxed max-w-2xl'>
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
              <div className='inline-block relative overflow-hidden min-w-[60px] align-baseline'>
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
            className='text-muted-foreground text-sm sm:text-base max-w-md'
          >
            {t('homepage.hero.location-timezone')}
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ease: 'easeOut', delay: 0.4 }}
            className='flex flex-col gap-2 pt-3 sm:flex-row sm:gap-3 max-w-sm mx-auto lg:mx-0'
          >
            <Link
              href='/projects'
              className='inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[36px]'
            >
              {t('homepage.hero.view-projects')}
            </Link>
            <Link
              href='/blog'
              className='inline-flex items-center justify-center rounded-full border border-input bg-background px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[36px]'
            >
              {t('homepage.hero.read-blog')}
            </Link>
          </motion.div>
        </div>
        <motion.div
          className='relative size-16 sm:size-20 lg:size-24 xl:size-28 mx-auto lg:mx-0 flex-shrink-0'
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
            className='rounded-full w-full h-full object-cover'
            width={144}
            height={144}
            alt='Yuri Cunha'
            lazy={false}
          />
          <div className='bg-linear-to-tl absolute inset-0 -z-10 from-purple-700 to-orange-700 opacity-50 blur-2xl' />
        </motion.div>
      </div>
    </div>
  )
}

export default Hero
