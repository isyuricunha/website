import { notFound } from 'next/navigation'

// Any unmatched path reaches this catch-all. Rendering the not-found UI as a
// regular component served it with HTTP 200 (soft 404) for every locale, so
// crawlers and caching layers indexed error pages as valid content. Triggering
// notFound() renders the same localized not-found UI with a real 404 status.
const CatchAllPage = () => {
  notFound()
}

export default CatchAllPage
