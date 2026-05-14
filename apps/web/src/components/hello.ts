'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

const Hello = () => {
  useEffect(() => {
    logger.info(
      'Hey there, awesome developer! Check out my GitHub repo: https://github.com/isyuricunha/website and give it a star ⭐'
    )
  }, [])

  return null
}

export default Hello
