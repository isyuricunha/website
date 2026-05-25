'use client'

import * as React from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'
import ErrorBoundary from '../ui/error-boundary'

interface AdminErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Admin-specific error boundary with custom admin styling
const AdminErrorBoundary = ({ children, fallback }: AdminErrorBoundaryProps) => {
  const t = useTranslations('admin.error-boundary')

  const adminFallback = (
    <div className='flex min-h-[400px] items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
            <AlertTriangle className='text-destructive h-6 w-6' />
          </div>
          <CardTitle className='text-xl'>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex gap-2'>
            <Button
              onClick={() => globalThis.location.reload()}
              className='flex-1'
              variant='outline'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              {t('refresh-page')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return <ErrorBoundary fallback={fallback || adminFallback}>{children}</ErrorBoundary>
}

export default AdminErrorBoundary
