'use client'

import { useTranslations } from '@isyuricunha/i18n/client'

import Link from '../link'

import CodingHours from './coding-hours'
import Connect from './connect'
import FavoriteFramework from './favorite-framework'
import LocationCard from './location-card'
import StacksCard from './stacks-card'

const AboutMe = () => {
  const t = useTranslations()

  return (
    <div className='border-t border-[var(--border-faint)] py-24'>
      <div className='mb-12 flex max-w-2xl flex-col gap-4'>
        <span className='label-mono'>{t('homepage.about-me.title')}</span>
        <h2 className='text-[clamp(28px,3vw,40px)] font-medium tracking-tighter'>
          {t('homepage.get-in-touch.title')}
        </h2>
      </div>
      <div className='grid gap-4 md:grid-cols-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-10 motion-safe:duration-300'>
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
      </div>
      <div className='mt-8'>
        <Link href='/about' className='cta-link'>
          {t('homepage.about-me.more')}{' '}
          <span className='yu-arrow' aria-hidden='true'>
            →
          </span>
        </Link>
      </div>
    </div>
  )
}

export default AboutMe
