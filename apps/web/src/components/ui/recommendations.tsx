'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@tszhong0411/ui'
import { FileText, Code, TrendingUp, Lightbulb } from 'lucide-react'
import { motion } from 'motion/react'

import type { Recommendation } from '@/lib/recommendations'
import Link from '../link'

interface RecommendationsProps {
  recommendations: Recommendation[]
  title?: string
  showReason?: boolean
  className?: string
}

const typeIcons = {
  post: FileText,
  project: Code
}

const typeColors = {
  post: 'text-blue-600 dark:text-blue-400',
  project: 'text-green-600 dark:text-green-400'
}

export function Recommendations({
  recommendations,
  title = 'Recommended for you',
  showReason = true,
  className = ''
}: RecommendationsProps) {
  if (recommendations.length === 0) return null

  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Lightbulb className='h-5 w-5 text-yellow-500' />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {recommendations.map((rec, index) => {
          const Icon = typeIcons[rec.type]
          const colorClass = typeColors[rec.type]

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={rec.href}
                className='hover:bg-accent/50 group block rounded-lg border p-3 transition-colors'
              >
                <div className='flex items-start gap-3'>
                  <div className={`mt-0.5 flex-shrink-0 ${colorClass}`}>
                    <Icon className='h-4 w-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <h4 className='group-hover:text-primary truncate text-sm font-medium'>
                        {rec.title}
                      </h4>
                      <span className='text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs'>
                        {rec.type}
                      </span>
                    </div>
                    <p className='text-muted-foreground mb-1 line-clamp-2 text-xs'>
                      {rec.description}
                    </p>
                    {showReason && (
                      <div className='flex items-center gap-1'>
                        <TrendingUp className='text-muted-foreground h-3 w-3' />
                        <span className='text-muted-foreground text-xs'>{rec.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default Recommendations
