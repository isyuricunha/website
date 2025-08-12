'use client'

import { useState, useEffect } from 'react'
import { XIcon, TrophyIcon, RefreshCwIcon } from 'lucide-react'
import { useTranslations } from '@tszhong0411/i18n/client'

interface MascotGameProps {
  isOpen: boolean
  onClose: () => void
}

const MascotGame = ({ isOpen, onClose }: MascotGameProps) => {
  const t = useTranslations()
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 })
  const [highScore, setHighScore] = useState(0)

  // Load high score from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vc_mascot_game_high_score')
      if (saved) setHighScore(parseInt(saved))
    } catch {}
  }, [])

  // Game timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false)
          // Save high score
          if (score > highScore) {
            setHighScore(score)
            try {
              localStorage.setItem('vc_mascot_game_high_score', score.toString())
            } catch {}
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, timeLeft, score, highScore])

  const startGame = () => {
    setScore(0)
    setTimeLeft(30)
    setIsPlaying(true)
    moveTarget()
  }

  const moveTarget = () => {
    const x = Math.random() * 80 + 10 // 10% to 90%
    const y = Math.random() * 80 + 10 // 10% to 90%
    setTargetPosition({ x, y })
  }

  const handleTargetClick = () => {
    if (!isPlaying) return
    setScore(prev => prev + 1)
    moveTarget()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='relative w-96 max-w-[90vw] rounded-lg border bg-popover p-6 text-popover-foreground shadow-lg'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold'>{t('mascot.game.title')}</h2>
          <button
            type='button'
            aria-label={t('mascot.game.close')}
            className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            onClick={onClose}
          >
            <XIcon className='h-4 w-4' />
          </button>
        </div>

        <div className='mb-4 flex items-center justify-between text-sm'>
          <div className='flex items-center gap-4'>
            <span>{t('mascot.game.score')}: {score}</span>
            <span>{t('mascot.game.time')}: {timeLeft}s</span>
          </div>
          <div className='flex items-center gap-1'>
            <TrophyIcon className='h-4 w-4 text-yellow-500' />
            <span className='text-sm'>{highScore}</span>
          </div>
        </div>

        {!isPlaying ? (
          <div className='text-center'>
            <p className='mb-4 text-sm text-muted-foreground'>
              {timeLeft === 0
                ? t('mascot.game.gameOver', { score })
                : t('mascot.game.instructions')
              }
            </p>
            <button
              type='button'
              className='rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              onClick={startGame}
            >
              {timeLeft === 0 ? t('mascot.game.playAgain') : t('mascot.game.start')}
            </button>
          </div>
        ) : (
          <div className='relative h-64 w-full rounded border bg-muted'>
            <button
              type='button'
              className='absolute h-8 w-8 rounded-full bg-primary transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              style={{
                left: `${targetPosition.x}%`,
                top: `${targetPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={handleTargetClick}
              aria-label={t('mascot.game.clickTarget')}
            />
          </div>
        )}

        <div className='mt-4 text-center'>
          <p className='text-xs text-muted-foreground'>
            {t('mascot.game.highScore')}: {highScore}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MascotGame
