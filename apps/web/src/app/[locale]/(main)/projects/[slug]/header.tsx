'use client'

import type { Project } from 'content-collections'

import { useTranslations } from '@isyuricunha/i18n/client'
import { ArrowUpRightIcon } from 'lucide-react'
import { motion } from 'motion/react'

import Link from '@/components/link'
import { GITHUB_USERNAME } from '@/lib/constants'

const animation = {
  hide: {
    x: -30,
    opacity: 0
  },
  show: {
    x: 0,
    opacity: 1
  }
}

type HeaderProps = Project

const Header = (props: HeaderProps) => {
  const { name, description, homepage, github } = props
  const t = useTranslations()

  const repo = github.split('/').pop()

  return (
    <div className='space-y-8 border-b border-[var(--border-faint)] pt-10 pb-12'>
      <motion.div
        className='flex items-center gap-3'
        initial={animation.hide}
        animate={animation.show}
      >
        <div className='flex flex-col gap-3'>
          <span className='label-mono'>Project</span>
          <h1 className='max-w-4xl text-[clamp(32px,4vw,52px)] font-normal tracking-tighter'>
            {name}
          </h1>
          <p className='text-muted-foreground max-w-2xl'>{description}</p>
        </div>
      </motion.div>
      <motion.div
        className='flex flex-col items-start gap-2 sm:flex-row sm:gap-4'
        initial={animation.hide}
        animate={animation.show}
        transition={{ delay: 0.1 }}
      >
        {homepage ? (
          <Link href={homepage} className='cta-link group'>
            {t('projects.visit-website')}
            <ArrowUpRightIcon className='ml-2 size-5 transition-transform group-hover:-rotate-12' />
          </Link>
        ) : null}
        <Link href={github} className='cta-link group'>
          {GITHUB_USERNAME}/{repo}
          <ArrowUpRightIcon className='ml-2 size-5 transition-transform group-hover:-rotate-12' />
        </Link>
      </motion.div>
    </div>
  )
}
export default Header
