import { env, flags } from '@isyuricunha/env'
import { Resend } from 'resend'

export const resend = flags.comment ? new Resend(env.RESEND_API_KEY) : null
