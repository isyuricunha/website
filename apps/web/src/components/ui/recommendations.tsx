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
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
                className="block p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 mt-0.5 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate group-hover:text-primary">
                        {rec.title}
                      </h4>
                      <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                        {rec.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {rec.description}
                    </p>
                    {showReason && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {rec.reason}
                        </span>
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
