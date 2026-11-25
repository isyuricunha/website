import Footer from './layout/footer'
import Header from './layout/header'
import Breadcrumbs from './breadcrumbs'
import AnnouncementToast from './announcement-toast'

type MainLayoutProps = {
  children: React.ReactNode
  staticPathname?: string
}

const MainLayout = (props: MainLayoutProps) => {
  const { children, staticPathname } = props

  return (
    <>
      <Header />
      <main id='skip-nav' className='mx-auto w-full max-w-6xl flex-1 px-4 pt-28 pb-20 sm:px-8'>
        <Breadcrumbs staticPathname={staticPathname} />
        {children}
      </main>
      <Footer />
      <AnnouncementToast />
    </>
  )
}

export default MainLayout
