import * as React from 'react'

export const createNavigation = () => {
  return {
    Link: (props: any) => {
      const { href, children, ...rest } = props ?? {}
      return React.createElement('a', { href, ...rest }, children)
    },
    useRouter: () => ({
      push: () => {},
      replace: () => {},
      prefetch: () => {},
      back: () => {},
      forward: () => {},
      refresh: () => {}
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: () => {
      return
    },
    permanentRedirect: () => {
      return
    },
    notFound: () => {
      return
    }
  }
}
