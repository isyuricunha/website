'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { BlurImage } from '@isyuricunha/ui'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

const me_image_src = '/images/me.png'

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

const GetInTouch = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const t = useTranslations()

  return (
    <motion.section
      className='editorial-section'
      initial='initial'
      animate={isInView ? 'animate' : 'initial'}
      variants={variants}
      ref={sectionRef}
      transition={{
        duration: 0.5
      }}
    >
      <div className='editorial-text'>
        <span className='label-mono'>Contact</span>
        <h2>{t('homepage.get-in-touch.title')}</h2>
        <p>{t('homepage.get-in-touch.description')}</p>
        <a href='mailto:me@yuricunha.com' className='cta-link'>
          me@yuricunha.com →
        </a>
      </div>

      <div className='app-window'>
        <div className='app-window-chrome'>
          <span className='window-dot' />
          <span className='window-dot' />
          <span className='window-dot' />
          <span className='label-mono ml-2 normal-case'>availability</span>
        </div>
        <div className='grid gap-6 p-6 sm:grid-cols-[180px_1fr] sm:p-8'>
          <div className='bg-bg-surface relative aspect-square overflow-hidden rounded-lg'>
            <BlurImage
              src={me_image_src}
              width={3975}
              height={3975}
              className='absolute inset-0 h-full w-full object-cover'
              imageClassName='object-cover brightness-[0.82] saturate-[0.85]'
              alt={t('homepage.get-in-touch.image-alt')}
            />
          </div>
          <div className='code-block self-center'>
            <div>status = "open"</div>
            <div>email = "me@yuricunha.com"</div>
            <div>timezone = "UTC/GMT -3"</div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default GetInTouch
