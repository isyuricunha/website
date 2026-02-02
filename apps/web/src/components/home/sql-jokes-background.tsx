'use client'

import { cn } from '@isyuricunha/utils'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

type SqlJokesBackgroundProps = {
  className?: string
}

const sql_jokes = [
  "SELECT 'hello world' AS greeting;",
  'SELECT now() AS "it\u0027s query o\u0027clock";',
  'SELECT 1 AS one, 2 AS two, 3 AS three, 5 AS fibonacci_skips_four;',
  "SELECT 'i''m in a relationship' AS status WHERE EXISTS (SELECT 1 FROM commits WHERE message LIKE 'fix(%'));",
  "SELECT * FROM bugs WHERE status = 'fixed' ORDER BY introduced_at DESC LIMIT 1;",
  "SELECT 'infinite loop?' AS question WHERE 1 = 1;",
  "SELECT 'LEFT JOIN' AS my_love_language;",
  'SELECT COUNT(*) AS hype FROM features WHERE shipped = true;',
  "SELECT COALESCE(NULL, 'still null') AS optimism;",
  "SELECT '\u00AF\\\\_(\u30C4)_/\u00AF' AS explain;",
  'SELECT * FROM coffee ORDER BY refills DESC LIMIT 1;',
  "SELECT 'DROP TABLE' AS intrusive_thoughts WHERE false;",
  'SELECT * FROM production WHERE tested = true AND reviewed = true;',
  "SELECT 'it works on my machine' AS root_cause;"
] as const

const build_rows = () => {
  return [
    {
      items: [sql_jokes[0], sql_jokes[6], sql_jokes[11], sql_jokes[13]].filter(Boolean),
      direction: 'ltr' as const,
      duration_seconds: 26
    },
    {
      items: [sql_jokes[2], sql_jokes[4], sql_jokes[7], sql_jokes[9]].filter(Boolean),
      direction: 'rtl' as const,
      duration_seconds: 32
    },
    {
      items: [sql_jokes[1], sql_jokes[5], sql_jokes[10], sql_jokes[12]].filter(Boolean),
      direction: 'ltr' as const,
      duration_seconds: 38
    }
  ]
}

const SqlJokesBackground = ({ className }: SqlJokesBackgroundProps) => {
  const [prefers_reduced_motion, set_prefers_reduced_motion] = useState(false)

  useEffect(() => {
    if (typeof globalThis.matchMedia !== 'function') return

    const media_query = globalThis.matchMedia('(prefers-reduced-motion: reduce)')

    set_prefers_reduced_motion(media_query.matches)

    const handle_change = () => set_prefers_reduced_motion(media_query.matches)
    media_query.addEventListener('change', handle_change)

    return () => media_query.removeEventListener('change', handle_change)
  }, [])

  const rows = build_rows()

  return (
    <div
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
        '[mask-image:radial-gradient(circle_at_50%_30%,black,transparent_70%)] opacity-60',
        className
      )}
    >
      <div className='from-background/70 via-background/10 to-background/70 absolute inset-0 bg-linear-to-b' />

      <div className='absolute inset-0 grid grid-rows-3 gap-6 px-2 py-6 sm:px-6'>
        {rows.map((row, row_index) => {
          const base = row.items.join('   ')
          const content = `${base}   ${base}   ${base}`

          if (prefers_reduced_motion) {
            return (
              <div
                key={row_index}
                className={cn(
                  'flex items-center overflow-hidden font-mono text-[10px] leading-none whitespace-nowrap sm:text-xs',
                  'text-muted-foreground/40'
                )}
              >
                <span className='px-2'>{content}</span>
              </div>
            )
          }

          const x = row.direction === 'ltr' ? ['-25%', '25%'] : ['25%', '-25%']

          return (
            <div
              key={row_index}
              className='relative flex items-center overflow-hidden whitespace-nowrap'
            >
              <motion.div
                className={cn(
                  'font-mono text-[10px] leading-none sm:text-xs',
                  'text-muted-foreground/45'
                )}
                initial={{ opacity: 0 }}
                animate={{ x, opacity: 1 }}
                transition={{
                  duration: row.duration_seconds,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                  delay: row_index * 0.6
                }}
              >
                <span className='px-2'>{content}</span>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SqlJokesBackground
