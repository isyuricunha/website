'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

import Link from '../link'

import CodingHours from './coding-hours'
import Connect from './connect'
import FavoriteFramework from './favorite-framework'
import LocationCard from './location-card'
import StacksCard from './stacks-card'

const variants = {
  initial: {
    y: 0,
    opacity: 1
  },
  animate: {
    y: 0,
    opacity: 1
  }
}

const AboutMe = () => {
  const cardsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardsRef, { once: true, margin: '-100px' })
  const t = useTranslations()

  return (
    <motion.div
      initial='initial'
      animate={isInView ? 'animate' : 'initial'}
      variants={variants}
      ref={cardsRef}
      transition={{
        duration: 0.5
      }}
      className='border-t border-[var(--border-faint)] py-24'
    >
      <div className='mb-12 flex max-w-2xl flex-col gap-4'>
        <span className='label-mono'>{t('homepage.about-me.title')}</span>
        <h2 className='text-[clamp(28px,3vw,40px)] font-medium tracking-tighter'>
          {t('homepage.get-in-touch.title')}
        </h2>
      </div>
      <motion.div
        className='grid gap-4 md:grid-cols-2'
        initial={{
          y: 40,
          opacity: 0
        }}
        animate={{
          y: 0,
          opacity: 1
        }}
        transition={{
          duration: 0.3
        }}
      >
        <div className='grid gap-4'>
          <LocationCard />
          <StacksCard />
        </div>
        <div className='grid gap-4'>
          <Connect />
          <div className='grid gap-4 [@media(min-width:450px)]:grid-cols-2'>
            <CodingHours />
            <FavoriteFramework />
          </div>
        </div>
      </motion.div>
      <div className='mt-8'>
        <Link href='/about' className='cta-link'>
          {t('homepage.about-me.more')} →
        </Link>
      </div>
    </motion.div>
  )
}

export default AboutMe
