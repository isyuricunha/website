export const getIp = (headersList: Headers) => {
  return headersList.get('x-forwarded-for') ?? '0.0.0.0'
}
