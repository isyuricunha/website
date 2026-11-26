import { z } from 'zod'

import { type AssistantAction } from './assistant-protocol'

import {
  find_citations,
  get_site_overview,
  list_site_content,
  read_site_content,
  type Citation
} from './site-index'

const query = z.object({ query: z.string().trim().min(1).max(300) }).strict()
const read = z
  .object({
    href: z.string().min(1).max(500),
    offset: z.number().int().min(0).max(100_000).optional()
  })
  .strict()
const empty = z.object({}).strict()
const chronological = z
  .object({
    type: z.enum(['post', 'snippet']),
    order: z.enum(['newest', 'oldest', 'updated']),
    query: z.string().trim().min(1).max(300).optional()
  })
  .strict()

const queryParameters = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Specific search terms or content title, in the visitor language.'
    }
  },
  required: ['query'],
  additionalProperties: false
}
const readParameters = {
  type: 'object',
  properties: {
    href: { type: 'string', description: 'Exact href from a search or overview result.' },
    offset: { type: 'integer', description: 'Optional nextOffset from the previous read.' }
  },
  required: ['href'],
  additionalProperties: false
}
const emptyParameters = { type: 'object', properties: {}, additionalProperties: false }

export const siteTools = [
  {
    type: 'function',
    function: {
      name: 'list_site_content',
      description:
        'List published posts or snippets by actual publication or modification date. Required for latest, newest, oldest or recently updated content. Omit query for the whole collection; use a specific topic only if requested. Snippets have publication dates only.',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['post', 'snippet'] },
          order: { type: 'string', enum: ['newest', 'oldest', 'updated'] },
          query: {
            type: 'string',
            description: 'Optional topic filter, not words such as latest or article.'
          }
        },
        required: ['type', 'order'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_site',
      description:
        'Search published articles, snippets, projects and public pages. Returns relevant titles, excerpts, available dates and public metadata, and exact links. Use precise topic terms, not the entire conversation.',
      parameters: queryParameters
    }
  },
  {
    type: 'function',
    function: {
      name: 'read_site_content',
      description:
        'Read the actual published content behind an exact site result. Returns up to 6000 characters and nextOffset for continuation. Use for summaries, technical explanations and factual questions.',
      parameters: readParameters
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_site_overview',
      description:
        'List the main public sections of the site and their purposes. Use to orient new visitors.',
      parameters: emptyParameters
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_current_page',
      description:
        'Read the public page the visitor is currently viewing. Does not access account, administrative or private data.',
      parameters: emptyParameters
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_related_content',
      description:
        'Find other relevant published items for a topic, excluding the current page and already recommended links when possible. Do not invent a match.',
      parameters: queryParameters
    }
  },
  {
    type: 'function',
    function: {
      name: 'navigate',
      description:
        'Offer an explicit navigation button ONLY when the visitor asks to go to a public page. The visitor must click the button; no automatic navigation. Use an exact href returned by search or overview.',
      parameters: readParameters
    }
  },
  {
    type: 'function',
    function: {
      name: 'open_search',
      description:
        'Offer a button to open the site search ONLY when the visitor explicitly asks to open search. The visitor must click to confirm.',
      parameters: queryParameters
    }
  }
] as const

type ToolContext = {
  locale: string
  pagePath?: string
  history?: Array<{ role: string; content: string }>
}
export type SiteToolResult = { result: unknown; citations: Citation[]; action?: AssistantAction }

export const executeSiteTool = (
  name: string,
  raw: string,
  context: ToolContext
): SiteToolResult => {
  try {
    if (raw.length > 4000) throw new Error('Arguments too large')
    const args: unknown = JSON.parse(raw)
    if (name === 'search_site' || name === 'get_related_content') {
      const input = query.parse(args)
      const results = find_citations({ message: input.query, locale: context.locale, limit: 5 })
      const seen =
        context.history
          ?.filter((turn) => turn.role === 'assistant')
          .map((turn) => turn.content)
          .join('\n') ?? ''
      const citations =
        name === 'get_related_content'
          ? results.filter((item) => item.href !== context.pagePath && !seen.includes(item.href))
          : results
      return { result: citations, citations }
    }
    if (name === 'list_site_content') {
      const input = chronological.parse(args)
      const citations = list_site_content({ ...input, locale: context.locale })
      return { result: citations, citations }
    }
    if (name === 'get_site_overview') {
      empty.parse(args)
      const citations = get_site_overview(context.locale)
      return { result: citations, citations }
    }
    if (name === 'get_current_page' || name === 'read_site_content') {
      const input =
        name === 'get_current_page'
          ? (empty.parse(args), { href: context.pagePath ?? '/', offset: 0 })
          : read.parse(args)
      const content = read_site_content(input.href, context.locale, input.offset)
      return {
        result: content ?? { error: 'No public content found for this exact page.' },
        citations: content ? [content.citation] : []
      }
    }
    if (name === 'navigate') {
      const input = read.parse(args)
      const target = read_site_content(input.href, context.locale)
      if (!target) return { result: { error: 'Unknown public page.' }, citations: [] }
      const action: AssistantAction = {
        type: 'navigate',
        href: target.citation.href,
        title: target.citation.title
      }
      return {
        result: { suggestedAction: action, confirmationRequired: true },
        citations: [target.citation],
        action
      }
    }
    if (name === 'open_search') {
      const input = query.parse(args)
      const action: AssistantAction = { type: 'search', query: input.query }
      return {
        result: { suggestedAction: action, confirmationRequired: true },
        citations: [],
        action
      }
    }
    return { result: { error: 'Unknown tool.' }, citations: [] }
  } catch {
    return {
      result: { error: 'Invalid tool arguments. Use the documented schema.' },
      citations: []
    }
  }
}
