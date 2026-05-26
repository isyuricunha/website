import type { Metadata } from 'next'

import { redirect } from '@isyuricunha/i18n/routing'
import { SidebarProvider } from '@isyuricunha/ui'

import AdminBreadcrumb from '@/components/admin/admin-breadcrumb'
import AdminErrorBoundary from '@/components/admin/admin-error-boundary'
import AdminHeader from '@/components/admin/admin-header'
import AdminSidebar from '@/components/admin/admin-sidebar'
import { getSession } from '@/lib/auth'

type LayoutProps = {
  params: Promise<{
    locale: string
  }>
  children: React.ReactNode
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  }
}

const Layout = async (props: LayoutProps) => {
  const { children } = props
  const { locale } = await props.params
  const session = await getSession()

  if (!session || session.user.role !== 'admin') {
    redirect({
      href: '/',
      locale
    })
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <div className='bg-bg-base text-text-primary flex min-h-svh w-full flex-col overflow-x-hidden px-4 sm:px-6 lg:px-8'>
        <AdminHeader />
        <main className='mx-auto w-full max-w-7xl border-t-[0.5px] border-[var(--border-faint)] py-8'>
          <AdminBreadcrumb />
          <AdminErrorBoundary>{children}</AdminErrorBoundary>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Layout
