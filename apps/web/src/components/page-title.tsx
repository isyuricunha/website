'use client'

import { motion } from 'motion/react'

type PageTitleProps = {
  title: string
  description: string
  animate?: boolean
}

const animation = {
  hide: {
    y: 18,
    opacity: 0
  },
  show: {
    y: 0,
    opacity: 1
  }
}

const transition = {
  duration: 0.5,
  ease: [0.25, 0.46, 0.45, 0.94] as const
}

const PageTitle = (props: PageTitleProps) => {
  const { title, description, animate = true } = props

  return (
    <div className='mt-6 mb-16 border-b-[0.5px] border-[var(--border-faint)] pb-10 sm:mt-12 sm:mb-24 sm:pb-14'>
      <motion.h1
        className='my-4 text-[clamp(32px,4vw,52px)] font-normal tracking-tighter'
        {...(animate && {
          initial: animation.hide,
          animate: animation.show,
          transition
        })}
      >
        {title}
      </motion.h1>
      <motion.h2
        className='text-text-secondary mb-8 max-w-2xl text-sm leading-relaxed sm:text-[15px]'
        {...(animate && {
          initial: animation.hide,
          animate: animation.show,
          transition: {
            ...transition,
            delay: 0.08
          }
        })}
      >
        {description}
      </motion.h2>
    </div>
  )
}

export default PageTitle
