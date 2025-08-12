'use client'

import { useState, useEffect } from 'react'
import { XIcon, UsersIcon, MessageSquareIcon, EyeIcon, TrendingUpIcon } from 'lucide-react'
import { useTranslations } from '@tszhong0411/i18n/client'

interface MascotStatsProps {
    isOpen: boolean
    onClose: () => void
    isAdminMode?: boolean
}

interface SiteStats {
    totalUsers: number
    totalComments: number
    totalViews: number
    pendingComments: number
    activeUsers: number
}

const MascotStats = ({ isOpen, onClose, isAdminMode = false }: MascotStatsProps) => {
    const t = useTranslations()
    const [stats, setStats] = useState<SiteStats>({
        totalUsers: 0,
        totalComments: 0,
        totalViews: 0,
        pendingComments: 0,
        activeUsers: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            // Simulate loading stats
            setLoading(true)
            setTimeout(() => {
                setStats({
                    totalUsers: Math.floor(Math.random() * 1000) + 100,
                    totalComments: Math.floor(Math.random() * 500) + 50,
                    totalViews: Math.floor(Math.random() * 10000) + 1000,
                    pendingComments: isAdminMode ? Math.floor(Math.random() * 10) : 0,
                    activeUsers: Math.floor(Math.random() * 100) + 10
                })
                setLoading(false)
            }, 1000)
        }
    }, [isOpen, isAdminMode])

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
            <div className='relative w-96 max-w-[90vw] rounded-lg border bg-popover p-6 text-popover-foreground shadow-lg'>
                <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-lg font-semibold'>
                        {isAdminMode ? t('mascot.stats.adminTitle') || 'Admin Statistics' : t('mascot.stats.title') || 'Site Statistics'}
                    </h2>
                    <button
                        type='button'
                        aria-label={t('mascot.stats.close') || 'Close stats'}
                        className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        onClick={onClose}
                    >
                        <XIcon className='h-4 w-4' />
                    </button>
                </div>

                {loading ? (
                    <div className='flex items-center justify-center py-8'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='rounded-lg border bg-card p-4'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <UsersIcon className='h-4 w-4 text-blue-500' />
                                    <span className='text-sm font-medium'>{t('mascot.stats.totalUsers') || 'Total Users'}</span>
                                </div>
                                <div className='text-2xl font-bold'>{stats.totalUsers.toLocaleString()}</div>
                            </div>

                            <div className='rounded-lg border bg-card p-4'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <MessageSquareIcon className='h-4 w-4 text-green-500' />
                                    <span className='text-sm font-medium'>{t('mascot.stats.totalComments') || 'Total Comments'}</span>
                                </div>
                                <div className='text-2xl font-bold'>{stats.totalComments.toLocaleString()}</div>
                            </div>

                            <div className='rounded-lg border bg-card p-4'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <EyeIcon className='h-4 w-4 text-purple-500' />
                                    <span className='text-sm font-medium'>{t('mascot.stats.totalViews') || 'Total Views'}</span>
                                </div>
                                <div className='text-2xl font-bold'>{stats.totalViews.toLocaleString()}</div>
                            </div>

                            <div className='rounded-lg border bg-card p-4'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <TrendingUpIcon className='h-4 w-4 text-orange-500' />
                                    <span className='text-sm font-medium'>{t('mascot.stats.activeUsers') || 'Active Users'}</span>
                                </div>
                                <div className='text-2xl font-bold'>{stats.activeUsers.toLocaleString()}</div>
                            </div>
                        </div>

                        {isAdminMode && (
                            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <MessageSquareIcon className='h-4 w-4 text-yellow-600' />
                                    <span className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
                                        {t('mascot.stats.pendingComments') || 'Pending Comments'}
                                    </span>
                                </div>
                                <div className='text-2xl font-bold text-yellow-800 dark:text-yellow-200'>
                                    {stats.pendingComments}
                                </div>
                                {stats.pendingComments > 0 && (
                                    <p className='text-sm text-yellow-700 dark:text-yellow-300 mt-2'>
                                        {t('mascot.stats.reviewNeeded') || 'Review needed'}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className='text-center text-sm text-muted-foreground'>
                            {t('mascot.stats.lastUpdated') || 'Last updated: Just now'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MascotStats
