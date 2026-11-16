import { z } from 'zod'
import { render } from '@react-email/render'
import { Resend } from 'resend'

import { env, flags } from '@isyuricunha/env'
import { NewsletterConfirmation, resolve_email_locale } from '@isyuricunha/emails'
import { newsletterRatelimit } from '../../lib/ratelimit'
import { rate_limit_keys } from '../../lib/rate-limit-keys'
import { getClientIp, verifyTurnstileToken } from '../../lib/spam-detection'
import { logger } from '../../lib/logger'
import { redis, redisKeys } from '@isyuricunha/kv'

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  locale: z.string().optional(),
  turnstileToken: z.string().optional()
})

const resend = new Resend(env.RESEND_API_KEY)

const CONFIRM_TTL_SECONDS = 60 * 60 * 24

export async function newsletterSubscribePost(
  request: Request,
  deps?: {
    kv?: {
      redis: Pick<typeof redis, 'set' | 'get' | 'del'>
      redisKeys: Pick<typeof redisKeys, 'newsletterConfirm'>
    }
    resend?: {
      emails: { send: (payload: unknown) => Promise<{ error?: unknown; data?: unknown }> }
    }
  }
): Promise<Response> {
  const activeRedis = deps?.kv?.redis ?? redis
  const activeRedisKeys = deps?.kv?.redisKeys ?? redisKeys
  const activeResend = deps?.resend ?? resend
  try {
    const ip = getClientIp(request.headers)
    const { success } = await newsletterRatelimit.limit(rate_limit_keys.newsletter_subscribe(ip))

    if (!success) {
      return Response.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, locale: rawLocale, turnstileToken } = subscribeSchema.parse(body)

    if (flags.turnstile) {
      if (!turnstileToken) {
        return Response.json({ error: 'Turnstile verification required.' }, { status: 400 })
      }

      const turnstile_result = await verifyTurnstileToken(
        turnstileToken,
        env.TURNSTILE_SECRET_KEY,
        ip
      )

      if (!turnstile_result.success) {
        return Response.json(
          { error: turnstile_result.error ?? 'Turnstile verification failed.' },
          { status: 403 }
        )
      }
    }

    const locale = resolve_email_locale(rawLocale)

    // Double opt-in: store a one-time confirmation token instead of adding the
    // contact directly. The contact only enters the audience after the token
    // is confirmed, so nobody can subscribe a third-party address on their
    // behalf and the list stays clean.
    const token = crypto.randomUUID()
    await activeRedis.set(activeRedisKeys.newsletterConfirm(token), email.toLowerCase(), {
      ex: CONFIRM_TTL_SECONDS
    })

    const siteUrl = env.NEXT_PUBLIC_WEBSITE_URL ?? 'https://yuricunha.com'
    const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${token}`

    const html = await render(NewsletterConfirmation({ confirmUrl, locale }))

    const subject_by_locale: Partial<Record<string, string>> = {
      en: 'Confirm your newsletter subscription',
      pt: 'Confirme sua assinatura da newsletter',
      es: 'Confirma tu suscripción al boletín',
      ja: 'ニュースレター登録の確認',
      'zh-CN': '确认您的新闻邮件订阅',
      fr: 'Confirmez votre abonnement à la newsletter',
      de: 'Bestätigen Sie Ihre Newsletter-Anmeldung'
    }
    const subject = subject_by_locale[locale] ?? 'Confirm your newsletter subscription'

    const { data, error } = await activeResend.emails.send({
      from: 'yuricunha.com <noreply@yuricunha.com>',
      to: email,
      subject,
      html
    })

    if (error) {
      logger.error('Failed to send newsletter confirmation email', error)
      return Response.json({ error: 'Failed to subscribe to newsletter' }, { status: 500 })
    }

    logger.info('Newsletter confirmation email sent', {
      messageId: (data as { id?: string } | undefined)?.id
    })

    return Response.json({
      success: true,
      message: 'Check your inbox to confirm your subscription'
    })
  } catch (error) {
    logger.error('Newsletter subscription error', error)

    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 })
    }

    return Response.json({ error: 'Failed to subscribe to newsletter' }, { status: 500 })
  }
}
