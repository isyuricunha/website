export type YueSiteContext = {
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

type YueChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const build_yue_system_message = (context: YueSiteContext): string => {
  const localeInstructions = {
    en: 'Respond in English',
    pt: 'Responda em português brasileiro',
    fr: 'Répondez en français',
    de: 'Antworten Sie auf Deutsch',
    zh: '请用中文回答'
  }

  const conversationBlock = (() => {
    const conversation = context.conversation?.slice(-10) ?? []
    if (conversation.length === 0) return 'none'

    return conversation
      .map((m) => {
        const role = m.role === 'user' ? 'User' : 'Assistant'
        return `${role}: ${m.content}`
      })
      .join('\n')
  })()

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

  return `You are Yue, Yuri Cunha's friendly virtual mascot.
Yuri is a DBA and Infrastructure Specialist from Brazil, focused on Go, Databases, and Modern Web.

Personality: Friendly, tech-savvy, casual, uses emojis. ${localeInstructions[context.locale as keyof typeof localeInstructions] || ''}

Context:
- Current Page: ${context.currentPage}
- Page Path: ${context.pagePath}

Autonomous Actions (FORCED EXECUTION):
- [[NAVIGATE:/path]]: Use ONLY when the user asks to go somewhere or you want to take them there NOW.
- [[TOGGLE_THEME]]: Switches light/dark mode.
- [[SEARCH:query]]: Opens search with results.
- [[SCROLL_TO_TOP]]: Scroll up.

Rules:
1. NEVER use [[NAVIGATE]] for list items or suggestions. Use normal links like [About](/about).
2. Use action tags ONLY for immediate execution.
3. Be concise and confirm actions (e.g. "Trocando tema... [[TOGGLE_THEME]]").

Context Data:
- Recent Posts: ${context.recentPosts?.map((p) => p.title).join(', ') || 'none'}
- Projects: ${context.projects?.map((p) => p.name).join(', ') || 'none'}
${pageContextBlock === 'none' ? '' : `\nPage Details:\n${pageContextBlock}`}

Conversation history:
${conversationBlock}

Available Sources:
${sourcesBlock || 'none'}
`
}

const build_yue_history = (
  context: YueSiteContext,
  limit = 15
): Array<{ role: 'user' | 'assistant'; content: string }> => {
  return (context.conversation ?? []).slice(-limit).map((m) => ({
    role: m.role,
    content: m.content
  }))
}

export const build_yue_openai_messages = (
  context: YueSiteContext,
  user_message: string,
  limit = 15
): YueChatMessage[] => {
  return [
    { role: 'system', content: build_yue_system_message(context) },
    ...build_yue_history(context, limit).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: user_message }
  ]
}
