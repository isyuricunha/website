export type MascotSiteContext = {
  currentPage: string
  pagePath?: string
  pageContext?: {
    type: 'post' | 'project' | 'page' | 'snippet'
    title: string
    description: string
    href: string
    contentExcerpt: string
  } | null
  citations?: Array<{
    id: string
    title: string
    href: string
    excerpt?: string
    type: 'post' | 'project' | 'page' | 'snippet'
  }>
  conversation?: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
  }>
  recentPosts?: Array<{
    title: string
    slug: string
    excerpt: string
  }>
  projects?: Array<{
    name: string
    description: string
    tech: string[]
  }>
  locale: string
}

type MascotChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const build_mascot_system_message = (context: MascotSiteContext): string => {
  const localeInstructions: Record<string, string> = {
    en: 'Respond in English',
    pt: 'Responda em português brasileiro',
    es: 'Responde en español',
    ja: '日本語で回答してください',
    'zh-CN': '请用中文回答',
    fr: 'Répondez en français',
    de: 'Antworten Sie auf Deutsch'
  }

  const pageContextBlock = context.pageContext
    ? [
        `type: ${context.pageContext.type}`,
        `title: ${context.pageContext.title}`,
        `description: ${context.pageContext.description}`,
        `href: ${context.pageContext.href}`,
        `content_excerpt: ${context.pageContext.contentExcerpt}`
      ].join('\n')
    : 'none'

  const sourcesBlock = (context.citations ?? [])
    .map((c) => `- ${c.title} (${c.type}): ${c.href}${c.excerpt ? ` — ${c.excerpt}` : ''}`)
    .join('\n')

  return `You are Yuri Cunha's website assistant, presented through Nery Mizuki, the friendly mascot of his web properties. Help visitors explore the website; do not claim to be Yuri, his personal assistant, or a separate Mnerys agent.
Yuri is an Infrastructure & Platform Engineer from Brazil who works across Linux, servers, containers, networking, automation, self-hosting, databases, and software development.

Tone: Warm, curious, concise and technically accurate. Use emojis sparingly; distinguish site content from general knowledge. ${localeInstructions[context.locale] ?? ''}

Context:
- Current Page: ${context.currentPage}
- Page Path: ${context.pagePath}

Autonomous Actions (FORCED EXECUTION):
- [[NAVIGATE:/path]]: Use ONLY when the user asks to go somewhere or you want to take them there NOW.
- [[SEARCH:query]]: Opens search with results.
- [[SCROLL_TO_TOP]]: Scroll up.

Rules:
1. NEVER use [[NAVIGATE]] for list items or suggestions. Use normal links like [About](/about).
2. Use action tags ONLY for immediate execution.
3. Be concise and confirm actions (e.g. "Abrindo busca... [[SEARCH:database]]").
4. For site recommendations and references, use the exact source title as a Markdown link to its supplied href. Never display a raw relative URL or slug as a separate list item. Do not invent paths.

Context Data:
- Recent Posts: ${context.recentPosts?.map((p) => p.title).join(', ') || 'none'}
- Projects: ${context.projects?.map((p) => p.name).join(', ') || 'none'}
${pageContextBlock === 'none' ? '' : `\nPage Details:\n${pageContextBlock}`}

Available Sources:
${sourcesBlock || 'none'}
`
}

const build_mascot_history = (
  context: MascotSiteContext,
  limit = 15
): Array<{ role: 'user' | 'assistant'; content: string }> => {
  return (context.conversation ?? []).slice(-limit).map((m) => ({
    role: m.role,
    content: m.content
  }))
}

export const build_mascot_openai_messages = (
  context: MascotSiteContext,
  user_message: string,
  limit = 15
): MascotChatMessage[] => {
  return [
    { role: 'system', content: build_mascot_system_message(context) },
    ...build_mascot_history(context, limit).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: user_message }
  ]
}
