import { createHash } from 'node:crypto'
import { allPosts, allSnippets } from 'content-collections'

type OgKind = 'post' | 'snippet'
type OgCard = {
  locale: string
  kind: OgKind
  slug: string
  title: string
  date: string
  summary: string
}
const cardVersion = 'v1'
const clamp = (value: string, limit: number) => value.trim().slice(0, limit)
const normalize = (card: OgCard) => ({
  ...card,
  title: clamp(card.title, 80),
  date: clamp(card.date.split('T')[0] ?? '', 20),
  summary: clamp(card.summary, 300)
})

const cards: OgCard[] = [
  ...allPosts.map((post) =>
    normalize({
      locale: post.locale,
      kind: 'post',
      slug: post.slug,
      title: post.title,
      date: post.date,
      summary: post.summary
    })
  ),
  ...allSnippets.map((snippet) =>
    normalize({
      locale: snippet.locale,
      kind: 'snippet',
      slug: snippet.slug,
      title: snippet.title,
      date: snippet.date,
      summary: snippet.description
    })
  )
]
const keyFor = (card: OgCard) =>
  card.slug +
  '-' +
  createHash('sha256')
    .update(JSON.stringify([cardVersion, card]))
    .digest('hex')
    .slice(0, 16)
const byIdentity = new Map(
  cards.map((card) => [JSON.stringify([card.locale, card.kind, card.slug]), card])
)
const byKey = new Map(
  cards.map((card) => [JSON.stringify([card.locale, card.kind, keyFor(card)]), card])
)

export const getContentOgPath = (locale: string, kind: OgKind, slug: string): string => {
  const card = byIdentity.get(JSON.stringify([locale, kind, slug]))
  return card
    ? '/og/content/' +
        encodeURIComponent(locale) +
        '/' +
        kind +
        '/' +
        encodeURIComponent(keyFor(card))
    : '/images/og.png'
}

export const getContentOgCard = (locale: string, kind: string, key: string) =>
  byKey.get(JSON.stringify([locale, kind, key]))

export const getContentOgParams = () =>
  cards.map((card) => ({ locale: card.locale, kind: card.kind, key: keyFor(card) }))

// The former endpoint accepted arbitrary text. Only known content identities
// can now select a renderer; legacy title/summary/date parameters are ignored.
export const getLegacyContentOgPath = (locale: string, kind: string | null, slug: string) => {
  if (kind === 'post' || kind === 'snippet') return getContentOgPath(locale, kind, slug)
  const post = getContentOgPath(locale, 'post', slug)
  return post === '/images/og.png' ? getContentOgPath(locale, 'snippet', slug) : post
}
