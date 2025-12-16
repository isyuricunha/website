'use client'

import * as React from 'react'
import { Component, type ReactNode } from 'react'
import { env } from '@isyuricunha/env'
import { useTranslations } from '@isyuricunha/i18n/client'
import { Button } from '@isyuricunha/ui'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  t_error?(key: any, values?: any): string
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const t = this.props.t_error

      return (
        <div className='flex min-h-[200px] flex-col items-center justify-center p-6 text-center'>
          <AlertTriangle className='text-destructive mb-4 size-12' />
          <h2 className='mb-2 text-lg font-semibold'>
            {t ? t('something-went-wrong') : 'Something went wrong'}
          </h2>
          <p className='text-muted-foreground mb-4 max-w-md text-sm'>
            {t
              ? t('unexpected-description')
              : 'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.'}
          </p>
          <div className='flex gap-2'>
            <Button
              onClick={() => globalThis.location.reload()}
              variant='outline'
              size='sm'
              className='gap-2'
            >
              <RefreshCw className='size-4' />
              {t ? t('refresh-page') : 'Refresh Page'}
            </Button>
            <Button onClick={() => this.setState({ hasError: false, error: undefined })} size='sm'>
              {t ? t('try-again') : 'Try Again'}
            </Button>
          </div>
          {env.NODE_ENV === 'development' && this.state.error && (
            <details className='mt-4 text-left'>
              <summary className='cursor-pointer text-sm font-medium'>
                {t ? t('details') : 'Error Details'}
              </summary>
              <pre className='bg-muted mt-2 max-w-full overflow-auto rounded p-2 text-xs'>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

const ErrorBoundaryWithTranslations = (props: Omit<Props, 't_error'>) => {
  const t_error = useTranslations('error')
  return <ErrorBoundary {...props} t_error={t_error} />
}

export default ErrorBoundaryWithTranslations
