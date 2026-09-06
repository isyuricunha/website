import * as React from 'react'

// API surface must match Next.js/next-intl navigation: hooks like useRouter,
// usePathname etc. must be exported as-is so the Vitest alias (vitest.config.ts)
// can replace the real module in unit tests. These are NOT React hooks — the
// actual Next.js runtime hooks perform routing; these are plain stubs.
/* eslint-disable @eslint-react/no-unnecessary-use-prefix -- test stub API surface must match Next.js/next-intl navigation hooks exactly */
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
/* eslint-enable @eslint-react/no-unnecessary-use-prefix -- re-enable after the stub navigation factory above */
