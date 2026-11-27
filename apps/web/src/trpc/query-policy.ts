import { TRPCClientError } from '@trpc/client'

// Retry transient unavailability once, never repeat a real rate-limit or other
// client rejection. Keep the default three retries for network/unknown errors.
export const shouldRetryQuery = (failureCount: number, error: unknown) => {
  const status = error instanceof TRPCClientError ? error.data?.httpStatus : undefined
  if (status === 503) return failureCount < 1
  if (typeof status === 'number' && status >= 400 && status < 500) return false
  return failureCount < 3
}
