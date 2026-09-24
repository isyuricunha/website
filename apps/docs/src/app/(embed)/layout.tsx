import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// Embeds are rendered inside third-party contexts (iframe previews, external
// docs surfaces): they must never appear in search results or be followed by
// crawlers. Setting this on the route group keeps every /embed/* page out of
// the index even if the embed surface grows.
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

const Layout = ({ children }: { children: ReactNode }) => {
  return children
}

export default Layout
