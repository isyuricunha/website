'use client'

import { Card, CardContent, CardHeader, Skeleton, Badge } from '@tszhong0411/ui'
import { Activity, RefreshCw } from 'lucide-react'

const AdminLoading = () => {
  return (
    <div className='animate-in fade-in-50 space-y-6 duration-500'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-9 w-48' />
          <Skeleton className='h-4 w-72' />
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant='outline' className='text-xs'>
            <Activity className='mr-1 h-3 w-3' />
            Loading...
          </Badge>
          <div className='flex items-center space-x-2 rounded-md border px-3 py-1.5'>
            <RefreshCw className='h-4 w-4 animate-spin' />
            <span className='text-sm'>Refresh</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <div className='bg-muted rounded-lg p-2'>
                <Skeleton className='h-4 w-4' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex items-baseline justify-between'>
                <Skeleton className='h-7 w-16' />
                <div className='flex items-center'>
                  <Skeleton className='mr-1 h-3 w-3' />
                  <Skeleton className='h-3 w-8' />
                </div>
              </div>
              <Skeleton className='mt-1 h-3 w-32' />
              <Skeleton className='mt-2 h-1 w-full' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <div className='flex items-center'>
                    <Skeleton className='mr-2 h-4 w-4' />
                    <Skeleton className='h-5 w-24' />
                  </div>
                  <Skeleton className='h-3 w-40' />
                </div>
                <Skeleton className='h-5 w-12' />
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-2'>
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-full' />
                {i === 2 && <Skeleton className='h-8 w-full' />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <Card className='animate-pulse'>
          <CardHeader>
            <div className='flex items-center'>
              <Skeleton className='mr-2 h-4 w-4' />
              <Skeleton className='h-5 w-32' />
            </div>
            <Skeleton className='h-3 w-48' />
          </CardHeader>
          <CardContent className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='bg-muted flex items-center justify-between rounded-lg p-2'>
                <div className='flex items-center space-x-2'>
                  <Skeleton className='h-4 w-4' />
                  <Skeleton className='h-4 w-24' />
                </div>
                <Skeleton className='h-4 w-16' />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className='animate-pulse'>
          <CardHeader>
            <div className='flex items-center'>
              <Skeleton className='mr-2 h-4 w-4' />
              <Skeleton className='h-5 w-28' />
            </div>
            <Skeleton className='h-3 w-52' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <div className='flex justify-between'>
                  <Skeleton className='h-3 w-32' />
                  <Skeleton className='h-3 w-16' />
                </div>
                <Skeleton className='h-2 w-full' />
              </div>
            ))}
            <div className='border-t pt-2'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-3 w-20' />
                <Skeleton className='h-3 w-16' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminLoading
