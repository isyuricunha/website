import { appRouter } from '@isyuricunha/trpc-server/root'
import { createTRPCContext } from '@isyuricunha/trpc-server/trpc'
import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import { buildSeoHead } from '#lib/seo.ts'
import { getProjects } from '#lib/content.ts'
import type { PageServerLoad } from './$types'

// The GitHub repo widget comes from the tRPC router (upstream rate limits and
// cache), so the listing stays on-demand server rendered.
export const prerender = false

const LABEL_KEYS = [
  'title',
  'description',
  'all-repos',
  'featured',
  'all',
  'search.placeholder',
  'filters.show',
  'filters.hide',
  'filters.category',
  'filters.all-categories',
  'filters.status',
  'filters.all-statuses',
  'filters.technology',
  'filters.all-technologies',
  'filters.clear',
  'results.found',
  'results.showing',
  'empty.title',
  'empty.description',
  'empty.show-all',
  'card.open',
  'card.open-aria',
  'card.featured',
  'card.github.title',
  'card.github.aria',
  'card.live.title',
  'card.live.aria',
  'card.started-label',
  'status.active',
  'status.archived',
  'status.beta',
  'status.completed',
  'repos.empty'
] as const

const projectsCatalogKey = (key: string) => `projects.${key}`

export const load: PageServerLoad = async ({ parent, request }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)
  const labels = buildLabels(t, 'projects', LABEL_KEYS.map(projectsCatalogKey))

  labels['card.github.label'] = t('sitemap.labels.github')
  labels['card.live.label'] = t('sitemap.labels.live-demo')

  const trpcContext = await createTRPCContext({ headers: request.headers })
  const caller = appRouter.createCaller(trpcContext)
  const repos = (await caller.github.getRepos()).map((repo) => ({
    ...repo,
    stargazersCount: repo.stargazersCount ?? 0
  }))

  const projects = getProjects(locale).map(
    ({
      slug,
      name,
      description,
      techstack,
      status,
      category,
      featured,
      homepage,
      repository,
      github,
      startDate,
      endDate
    }) => ({
      slug,
      name,
      description,
      techstack,
      status,
      category,
      featured,
      homepage,
      repository,
      github,
      startDate,
      endDate
    })
  )

  return {
    ...buildSeoHead({
      slug: '/projects',
      locale,
      title: labels.title,
      description: labels.description
    }),
    locale,
    siteName: t('metadata.site-title'),
    projects,
    repos,
    labels
  }
}
