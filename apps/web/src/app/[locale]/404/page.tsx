import { setRequestLocale } from '@isyuricunha/i18n/server'

import LocalizedNotFound from '@/components/localized-not-found'

export { generateMetadata } from '@/components/localized-not-found'

// The parent locale layout enumerates all supported languages at build time.
// Fail the build rather than accidentally make the error page request-dependent.
export const dynamic = 'error'
export const dynamicParams = false

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function StaticNotFound({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <LocalizedNotFound params={params} staticPathname='/404' />
}
