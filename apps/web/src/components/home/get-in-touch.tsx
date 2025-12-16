'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { BlurImage } from '@isyuricunha/ui'
import { motion, useAnimate, useInView } from 'motion/react'
import { useEffect, useRef } from 'react'

import me from '~/images/me.png'

const variants = {
  initial: {
    y: 40,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1
  }
}

const GetInTouch = () => {
  const [scope, animate] = useAnimate()
  const cardsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardsRef, { once: true, margin: '-100px' })
  const t = useTranslations()
  const tMetadata = useTranslations('metadata')

  useEffect(() => {
    animate(
      [
        ['#pointer', { left: 200, top: 60 }, { duration: 0 }],
        ['#javascript', { opacity: 1 }, { duration: 0.3 }],
        ['#pointer', { left: 50, top: 102 }, { at: '+0.5', duration: 0.5, ease: 'easeInOut' }],
        ['#javascript', { opacity: 0.4 }, { at: '-0.3', duration: 0.1 }],
        ['#react-js', { opacity: 1 }, { duration: 0.3 }],
        ['#pointer', { left: 224, top: 170 }, { at: '+0.5', duration: 0.5, ease: 'easeInOut' }],
        ['#react-js', { opacity: 0.4 }, { at: '-0.3', duration: 0.1 }],
        ['#typescript', { opacity: 1 }, { duration: 0.3 }],
        ['#pointer', { left: 88, top: 198 }, { at: '+0.5', duration: 0.5, ease: 'easeInOut' }],
        ['#typescript', { opacity: 0.4 }, { at: '-0.3', duration: 0.1 }],
        ['#next-js', { opacity: 1 }, { duration: 0.3 }],
        ['#pointer', { left: 200, top: 60 }, { at: '+0.5', duration: 0.5, ease: 'easeInOut' }],
        ['#next-js', { opacity: 0.4 }, { at: '-0.3', duration: 0.1 }]
      ],
      {
        repeat: Number.POSITIVE_INFINITY
      }
    )
  }, [animate])

  return (
    <div className='py-10 sm:py-12 lg:py-14'>
      <motion.div
        className='shadow-feature-card relative rounded-xl p-1 backdrop-blur-lg'
        initial='initial'
        animate={isInView ? 'animate' : 'initial'}
        variants={variants}
        ref={cardsRef}
        transition={{
          duration: 0.5
        }}
      >
        <div className='flex flex-col gap-4 rounded-[11px] p-4 sm:gap-6 sm:p-5 lg:p-6'>
          <div className='flex gap-8 max-md:flex-col sm:gap-12'>
            <div className='relative size-64 max-md:mx-auto' ref={scope}>
              <BlurImage
                src={me}
                width={3975}
                height={3975}
                className='absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-[20px]'
                alt={t('homepage.get-in-touch.image-alt')}
              />
              <div
                id='postgresql'
                className='bg-muted/30 border-border absolute bottom-12 left-14 rounded-3xl border px-2 py-1.5 text-xs opacity-40'
              >
                PostgreSQL
              </div>
              <div
                id='docker'
                className='bg-muted/30 border-border absolute left-2 top-20 rounded-3xl border px-2 py-1.5 text-xs opacity-40'
              >
                Docker
              </div>
              <div
                id='cloudflare-workers'
                className='bg-muted/30 border-border absolute bottom-20 right-1 rounded-3xl border px-2 py-1.5 text-xs opacity-40'
              >
                Cloudflare
              </div>
              <div
                id='terraform'
                className='bg-muted/30 border-border absolute right-8 top-10 rounded-3xl border px-2 py-1.5 text-xs opacity-40'
              >
                Terraform
              </div>

              <div id='pointer' className='absolute'>
                <svg
                  width='16.8'
                  height='18.2'
                  viewBox='0 0 12 13'
                  className='fill-primary'
                  stroke='hsl(var(--primary-foreground))'
                  strokeWidth='1'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M12 5.50676L0 0L2.83818 13L6.30623 7.86537L12 5.50676V5.50676Z'
                  />
                </svg>
                <span className='bg-primary text-primary-foreground relative left-4 rounded-3xl px-2 py-0.5 text-xs'>
                  {tMetadata('site-short-name')}
                </span>
              </div>
            </div>

            <div className='flex flex-col justify-center px-4'>
              <p className='text-foreground mb-2 text-2xl font-semibold sm:mb-3 sm:text-3xl'>
                {t('homepage.get-in-touch.title')}
              </p>
              <p className='text-muted-foreground text-sm leading-relaxed sm:text-base'>
                {t('homepage.get-in-touch.description')}
              </p>
              <div className='my-6 sm:my-8'>
                <a
                  href='mailto:me@yuricunha.com'
                  className='bg-email-button inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2 text-sm text-white sm:px-6 sm:py-3 sm:text-base'
                >
                  me@yuricunha.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default GetInTouch
