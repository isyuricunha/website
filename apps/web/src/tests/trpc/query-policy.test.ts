import { TRPCClientError } from '@trpc/client'
import { describe, expect, it } from 'vitest'
import { shouldRetryQuery } from '@/trpc/query-policy'

const rpcError = (httpStatus: number) =>
  new TRPCClientError('request failed', {
    result: { error: { code: -32_603, message: 'request failed', data: { httpStatus } } }
  })

describe('tRPC query retry policy', () => {
  it('never retries 429 or other client rejections', () => {
    for (const status of [400, 401, 403, 404, 429]) {
      expect(shouldRetryQuery(0, rpcError(status))).toBe(false)
    }
  })

  it('retries transient unavailability at most once', () => {
    expect(shouldRetryQuery(0, rpcError(503))).toBe(true)
    expect(shouldRetryQuery(1, rpcError(503))).toBe(false)
  })

  it('retains the bounded default for unknown errors', () => {
    expect(shouldRetryQuery(2, new Error('network'))).toBe(true)
    expect(shouldRetryQuery(3, new Error('network'))).toBe(false)
  })
})
