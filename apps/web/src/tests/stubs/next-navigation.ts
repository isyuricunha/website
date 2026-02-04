export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  prefetch: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {}
})

export const usePathname = () => '/'
export const useSearchParams = () => new URLSearchParams()
export const useParams = () => ({})

export const redirect = () => {
  return
}

export const permanentRedirect = () => {
  return
}

export const notFound = () => {
  return
}
