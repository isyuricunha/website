import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'

type LayoutProps = {
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  const { children } = props
  return (
    <>
      <Header />
      <div className='mx-auto max-w-6xl px-5 sm:px-8 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12'>
        <Sidebar />
        <main className='cursor-reveal py-14 sm:py-20'>{children}</main>
      </div>
    </>
  )
}

export default Layout
