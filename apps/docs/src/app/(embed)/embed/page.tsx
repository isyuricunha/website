import * as React from 'react'

import { getErrorMessage } from '@isyuricunha/utils'

type PageProps = {
  params: Promise<Record<string, string | string[] | undefined>>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Page = async (props: PageProps) => {
  const { component } = await props.searchParams

  if (!component || typeof component !== 'string') {
    return <div>Error: Invalid component name</div>
  }

  // Separate the dynamic import from JSX rendering — JSX inside try/catch
  // cannot be caught by React's error boundaries and is flagged by the linter.
  let Component: React.ComponentType | null = null
  let importError: string | null = null

  try {
    Component = (await import(`@/components/demos/${component}`)).default
  } catch (error) {
    importError = getErrorMessage(error)
  }

  if (importError !== null || Component === null) {
    return <div>Error: {importError}</div>
  }

  return <Component />
}

export default Page
