const noop = () => {
  /* no-op stub for tests */
}

const routerStub = () => ({
  push: noop,
  replace: noop,
  prefetch: noop,
  back: noop,
  forward: noop,
  refresh: noop
})

const pathnameStub = () => '/'
const searchParamsStub = () => new URLSearchParams()
const paramsStub = () => ({})

const redirect = () => {
  return
}

const permanentRedirect = () => {
  return
}

const notFound = () => {
  return
}

export {
  routerStub as useRouter,
  pathnameStub as usePathname,
  searchParamsStub as useSearchParams,
  paramsStub as useParams,
  redirect,
  permanentRedirect,
  notFound
}
