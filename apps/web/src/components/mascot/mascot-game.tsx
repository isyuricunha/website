'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { TrophyIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

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
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [gameMode, setGameMode] = useState<'classic' | 'survival' | 'challenge'>('classic')
  const [multiplier, setMultiplier] = useState(1)
  const [achievements, setAchievements] = useState<string[]>([])

  // Load high score from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vc_mascot_game_high_score')
      if (saved) setHighScore(Number.parseInt(saved))
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Game timer - Runs continuously without restarting on score changes
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying]) // Only depend on isPlaying to prevent timer restarts

  // Handle game end and high score saving separately
  useEffect(() => {
    if (
      !isPlaying &&
      timeLeft === 0 && // Game ended, check and save high score
      score > highScore
    ) {
      setHighScore(score)
      try {
        localStorage.setItem('vc_mascot_game_high_score', score.toString())
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [isPlaying, timeLeft, score, highScore])

  // Get difficulty settings
  const getDifficultySettings = useCallback(() => {
    switch (difficulty) {
      case 'easy': {
        return { size: 48, speed: 1000, scoreMultiplier: 1 }
      }
      case 'medium': {
        return { size: 32, speed: 800, scoreMultiplier: 2 }
      }
      case 'hard': {
        return { size: 24, speed: 600, scoreMultiplier: 3 }
      }
      default: {
        return { size: 48, speed: 1000, scoreMultiplier: 1 }
      }
    }
  }, [difficulty])

  const moveTarget = useCallback(() => {
    const x = Math.random() * 80 + 10 // 10% to 90%
    const y = Math.random() * 80 + 10 // 10% to 90%
    setTargetPosition({ x, y })

    // Challenge mode: occasional multiplier boost
    if (Math.random() < 0.05 && gameMode === 'challenge') {
      setMultiplier(2)
      setTimeout(() => setMultiplier(1), 3000)
    }
  }, [gameMode])

  const startGame = useCallback(() => {
    setScore(0)
    setTimeLeft(gameMode === 'survival' ? 60 : 30)
    setIsPlaying(true)
    setMultiplier(1)
    moveTarget()
  }, [gameMode, moveTarget])

  const handleTargetClick = useCallback(() => {
    if (!isPlaying) return

    const settings = getDifficultySettings()
    const basePoints = settings.scoreMultiplier * multiplier
    setScore((prev) => prev + basePoints)
    moveTarget()

    // Survival mode: time decreases faster as score increases
    if (gameMode === 'survival') {
      setTimeLeft((prev) => Math.max(1, prev - Math.floor(score / 10)))
    }

    // Check for achievements
    if (score === 10 && !achievements.includes('first_10')) {
      setAchievements((prev) => [...prev, 'first_10'])
    }
    if (score === 50 && !achievements.includes('speed_demon')) {
      setAchievements((prev) => [...prev, 'speed_demon'])
    }
  }, [isPlaying, moveTarget, getDifficultySettings, multiplier, score, gameMode, achievements])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-popover text-popover-foreground relative w-96 max-w-[90vw] rounded-lg border p-6 shadow-lg'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>{t('mascot.game.title')}</h2>
          <button
            type='button'
            aria-label={t('mascot.game.close')}
            className='text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2'
            onClick={onClose}
          >
            <XIcon className='h-4 w-4' />
          </button>
        </div>

        <div className='mb-4 flex items-center justify-between text-sm'>
          <div className='flex items-center gap-4'>
            <span>
              {t('mascot.game.score')}: {score}
            </span>
            <span>
              {t('mascot.game.time')}: {timeLeft}s
            </span>
          </div>
          <div className='flex items-center gap-1'>
            <TrophyIcon className='h-4 w-4 text-yellow-500' />
            <span className='text-sm'>{highScore}</span>
          </div>
        </div>

        {/* Game Settings */}
        <div className='mb-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <label htmlFor='difficulty-select' className='text-sm font-medium'>
              Difficulty:
            </label>
            <select
              id='difficulty-select'
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className='bg-background rounded border px-2 py-1 text-xs'
            >
              <option value='easy'>Easy</option>
              <option value='medium'>Medium</option>
              <option value='hard'>Hard</option>
            </select>
          </div>
          <div className='flex items-center justify-between'>
            <label htmlFor='mode-select' className='text-sm font-medium'>
              Mode:
            </label>
            <select
              id='mode-select'
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value as 'classic' | 'survival' | 'challenge')}
              className='bg-background rounded border px-2 py-1 text-xs'
            >
              <option value='classic'>Classic</option>
              <option value='survival'>Survival</option>
              <option value='challenge'>Challenge</option>
            </select>
          </div>
        </div>

        {isPlaying ? (
          <div className='bg-muted relative h-64 w-full rounded border'>
            <button
              type='button'
              className={`bg-primary focus-visible:ring-ring absolute rounded-full transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 ${multiplier > 1 ? 'animate-pulse bg-yellow-500' : ''}`}
              style={{
                left: `${targetPosition.x}%`,
                top: `${targetPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${getDifficultySettings().size}px`,
                height: `${getDifficultySettings().size}px`
              }}
              onClick={handleTargetClick}
              aria-label={t('mascot.game.clickTarget')}
            />
            {multiplier > 1 && (
              <div className='absolute left-2 top-2 rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-white'>
                {multiplier}x
              </div>
            )}
          </div>
        ) : (
          <div className='text-center'>
            <p className='text-muted-foreground mb-4 text-sm'>
              {timeLeft === 0
                ? t('mascot.game.gameOver', { score })
                : t('mascot.game.instructions')}
            </p>
            <button
              type='button'
              className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2'
              onClick={startGame}
            >
              {timeLeft === 0 ? t('mascot.game.playAgain') : t('mascot.game.start')}
            </button>
          </div>
        )}

        <div className='mt-4 text-center'>
          <p className='text-muted-foreground text-xs'>
            {t('mascot.game.highScore')}: {highScore}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MascotGame
