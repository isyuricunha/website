'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import ErrorBoundary from '../ui/error-boundary'

interface AdminErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Admin-specific error boundary with custom admin styling
const AdminErrorBoundary = ({ children, fallback }: AdminErrorBoundaryProps) => {
  const adminFallback = (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Admin Error</CardTitle>
          <CardDescription>
            An error occurred while loading this admin section. Please try refreshing the page or contact support if the problem persists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback || adminFallback}>
      {children}
    </ErrorBoundary>
  )
}

export default AdminErrorBoundary
