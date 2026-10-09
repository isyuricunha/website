export const sharedProjectConfig = {
  test: {
    globals: true,
    testTimeout: 10_000,
    // @isyuricunha/yutheme imports optional peers (next/link, next/image) at
    // runtime; inlining it lets Vite resolve those through the consumer's
    // dependency graph instead of Node's package-internal resolution.
    server: {
      deps: {
        inline: ['@isyuricunha/yutheme']
      }
    },
    exclude: ['**/node_modules/**', '**/e2e/**']
  }
}
