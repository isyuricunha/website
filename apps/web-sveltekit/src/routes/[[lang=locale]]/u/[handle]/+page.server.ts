import { error } from '@sveltejs/kit'
import { appRouter } from '@isyuricunha/trpc-server/root'
import { createTRPCContext } from '@isyuricunha/trpc-server/trpc'
import { getServerTranslator } from '#lib/i18n/server.ts'
import { buildSeoHead } from '#lib/seo.ts'
import type { PageServerLoad } from './$types'

export const prerender = false

export const load: PageServerLoad = async ({ params, request }) => {
  const { handle } = params
  const locale = params.lang ?? 'en'
  const t = await getServerTranslator(locale)

  const trpcContext = await createTRPCContext({ headers: request.headers })
  const caller = appRouter.createCaller(trpcContext)

  let profile: Awaited<ReturnType<typeof caller.users.getPublicProfile>>
  try {
    profile = await caller.users.getPublicProfile({ handle })
  } catch {
    error(404, t('profile.not-found.description'))
  }

  const title = profile.name
  const description = profile.bio ?? t('profile.description')
  const labels: Record<string, string> = {}
  for (const key of [
    'comments.title',
    'comments.description',
    'comments.empty',
    'comments.error',
    'comments.end',
    'comments.load-more',
    'comments.type.comment',
    'comments.type.reply'
  ]) {
    labels[key] = t(`profile.${key}`)
  }
  labels['comments.loading'] = labels['comments.title']

  return {
    ...buildSeoHead({ slug: `/u/${handle}`, locale, title, description }),
    locale,
    handle,
    profile,
    labels
  }
}
