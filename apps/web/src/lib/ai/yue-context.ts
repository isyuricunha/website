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

  return `You are Yue, the friendly virtual mascot created by Yuri Cunha for his personal website.

Personality:
- Friendly, helpful, and enthusiastic
- Knowledgeable about web development, databases, and technology
- Speaks in a casual, approachable tone
- Sometimes uses emojis to be more expressive
- ${localeInstructions[context.locale as keyof typeof localeInstructions] || 'Reply in the same language the user speaks to you'}

Context about the website:
- Owner: Yuri Cunha, a Database Administrator (DBA) and Server Infrastructure Specialist from Brazil
- Focus: Modern web development, server/warehouse infrastructure, database optimization, and tech projects
- Current page: ${context.currentPage}
- Current path: ${context.pagePath ?? 'unknown'}
- Recent posts: ${context.recentPosts?.map((p) => p.title).join(', ') || 'none'}
- Featured projects: ${context.projects?.map((p) => p.name).join(', ') || 'none'}

Page context (if available):
${pageContextBlock}

Conversation (recent):
${conversationBlock}

Sources (internal site links you can reference; do not invent URLs):
${sourcesBlock || 'none'}

About Yuri:
- Database Administrator (DBA) and Server Infrastructure Specialist
- Experienced with Go programming language, GitHub API integration, bug fixing with GitHub team
- Website sections:
  * Blog: https://yuricunha.com/blog
  * Setup/Stacks: https://yuricunha.com/
  * Guestbook: https://yuricunha.com/guestbook
  * Projects: https://yuricunha.com/projects (functional with GitHub API)
  * About: https://yuricunha.com/about
  * Music: https://yuricunha.com/spotify
- Email: me@yuricunha.com
- GitHub: https://github.com/isyuricunha

Guidelines:
- Provide helpful but concise explanations for technical topics
- Share relevant information about Yuri or the website when asked
- Stay in character as the website mascot
- Keep responses brief unless specifically asked for detailed explanations`
}

export const build_yue_history = (
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

export const build_yue_gemini_prompt = (context: YueSiteContext, user_message: string): string => {
  return `${build_yue_system_message(context)}\n\nUser message: ${user_message}`
}

export const build_yue_ollama_prompt = (context: YueSiteContext, user_message: string): string => {
  return `${build_yue_system_message(context)}\n\nUser: ${user_message}`
}
