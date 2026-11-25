// Content is compiled by Content Collections at build time. The in-process
// index is lazy, locale-scoped, and shared by subsequent searches.
const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' })
const stopWords = new Set(
  (
    'a an the and or of to in on for with from by at is are be it me my you your i this that these those can could please show suggest recommend recommendations more like post posts blog article articles snippet snippets page pages link links site website about where find give some few ' +
    'o os as um uma uns umas de da do das dos e em no na nos nas por para com sobre que qual quais como onde me meu minha voce sua seu isso isto esse essa este esta mais algum alguns quero pode recomenda recomendar recomendacao recomendacoes sugere sugerir postagem postagens artigo artigos conteudo pagina paginas encontre buscar busca ' +
    'el la los las un una unos unas del al y en con por para que como donde mi tu su este esta recomendar recomienda articulos enlaces ' +
    'le les la un une des du et en avec pour sur que qui dans de ce cette mon ma mes vous votre des articles recommander ' +
    'der die das ein eine und oder mit von zu im in fur auf ist sind ich du sie bitte artikel empfehlen ' +
    'の に は を が と で も へ から です ます こと これ それ 記事 おすすめ 的 了 和 是 在 有 我 你 请 推荐 文章 网站 链接'
  ).split(/\s+/)
)
export const tokenizeKnowledge = (value: string): string[] =>
  Array.from(
    segmenter.segment(
      value
        .normalize('NFKD')
        .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
        .normalize('NFC')
        .toLowerCase()
    )
  )
    .filter((part) => part.isWordLike)
    .map((part) => part.segment)
    .filter(
      (word) =>
        !stopWords.has(word) &&
        (word.length > 1 || /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(word))
    )

export type KnowledgeEntry = {
  title: string
  description: string
  slug: string
  href: string
  type: string
  content?: string
}

type IndexedEntry<T> = {
  entry: T
  fields: Array<Set<string>>
}

export const createKnowledgeIndex = <T extends KnowledgeEntry>(entries: T[]) => {
  const indexed: Array<IndexedEntry<T>> = entries.map((entry) => ({
    entry,
    fields: [
      entry.title,
      entry.description,
      entry.slug,
      (entry.content ?? '').slice(0, 48_000)
    ].map((field) => new Set(tokenizeKnowledge(field)))
  }))
  const frequency = new Map<string, number>()
  for (const item of indexed) {
    const terms = new Set(item.fields.flatMap((field) => [...field]))
    for (const term of terms) {
      frequency.set(term, (frequency.get(term) ?? 0) + 1)
    }
  }
  const weights = [5, 3, 2, 1]
  return (query: string) => {
    const tokens = [...new Set(tokenizeKnowledge(query))]
    return indexed
      .map(({ entry, fields }) => {
        let score = 0
        for (const token of tokens) {
          const idf = Math.log(1 + (indexed.length + 1) / ((frequency.get(token) ?? 0) + 1))
          const weight = fields.reduce(
            (sum, field, index) => sum + (field.has(token) ? (weights[index] ?? 0) : 0),
            0
          )
          score += weight * idf
        }
        return { entry, score }
      })
      .filter((item) => item.score > 0)
      .toSorted((a, b) => b.score - a.score)
  }
}
