'use client'

import * as React from 'react'
import { Component, type ReactNode } from 'react'
import { Button } from '@tszhong0411/ui'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
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

      return (
        <div className='flex min-h-[200px] flex-col items-center justify-center p-6 text-center'>
          <AlertTriangle className='text-destructive mb-4 size-12' />
          <h2 className='mb-2 text-lg font-semibold'>Something went wrong</h2>
          <p className='text-muted-foreground mb-4 max-w-md text-sm'>
            We encountered an unexpected error. Please try refreshing the page or contact support if
            the problem persists.
          </p>
          <div className='flex gap-2'>
            <Button
              onClick={() => globalThis.location.reload()}
              variant='outline'
              size='sm'
              className='gap-2'
            >
              <RefreshCw className='size-4' />
              Refresh Page
            </Button>
            <Button onClick={() => this.setState({ hasError: false, error: undefined })} size='sm'>
              Try Again
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className='mt-4 text-left'>
              <summary className='cursor-pointer text-sm font-medium'>Error Details</summary>
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

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary
