declare module 'speakeasy' {
  type GenerateSecretResult = { otpauth_url?: string; base32: string; ascii?: string }
  type TotpOptions = {
    secret: string
    encoding?: 'ascii' | 'hex' | 'base32'
    token?: string
    window?: number
    step?: number
    digits?: 6 | 8
  }

  const speakeasy: {
    generateSecret(options?: {
      length?: number
      name?: string
      otpauth_url?: boolean
    }): GenerateSecretResult
    totp: {
      make(options: TotpOptions): { base32: string }
      verify(options: TotpOptions): { delta?: number | null; valid: boolean }
    }
  }

  export default speakeasy
}
