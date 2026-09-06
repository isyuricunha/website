import * as React from 'react'

export const createNavigation = () => {
  return {
    Link: (props: any) => {
      const { href, children, ...rest } = props ?? {}
      return React.createElement('a', { href, ...rest }, children)
    },
    useRouter: () => ({
      push: () => {
        return
      },
      replace: () => {
        return
      },
      prefetch: () => {
        return
      },
      back: () => {
        return
      },
      forward: () => {
        return
      },
      refresh: () => {
        return
      }
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
