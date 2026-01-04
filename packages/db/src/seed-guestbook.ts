import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { nanoid } from 'nanoid'
import { env } from '@isyuricunha/env'

import { db } from './db'
import { guestbook, users } from './schema'

interface RandomUser {
  name: {
    first: string
    last: string
  }
  email: string
  picture: {
    large: string
  }
  gender: 'male' | 'female'
}

interface GeneratedComment {
  name: string
  email: string
  image: string
  comment: string
  language: string
}

type Language = 'en' | 'fr' | 'ja'

interface SitePost {
  title: string
  date?: string
  summary?: string
  locale: string
  excerpt: string
}

const GEMINI_API_KEY = env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, '../../..')
const BLOG_CONTENT_DIR = path.join(repoRoot, 'apps', 'web', 'src', 'content', 'blog')
const SUPPORTED_LOCALES = ['en', 'pt', 'fr', 'de', 'ja', 'zh']

const parseFrontmatter = (content: string): Record<string, string> => {
  const frontmatterMatch = /^---\n([\s\S]*?)\n---/.exec(content)
  if (!frontmatterMatch) return {}

  const lines = frontmatterMatch[1].split('\n')
  const data: Record<string, string> = {}

  for (const line of lines) {
    const [rawKey, ...rawValue] = line.split(':')
    if (!rawKey || rawValue.length === 0) continue

    const key = rawKey.trim()
    const value = rawValue
      .join(':')
      .trim()
      .replace(/^(?:["'])/g, '')
      .replace(/(?:["'])$/g, '')
    if (key) data[key] = value
  }

  return data
}

const getExcerpt = (content: string, limit = 220): string => {
  const withoutBreaks = content.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim()
  return withoutBreaks.slice(0, limit)
}

const loadSitePosts = async (maxPosts = 18): Promise<SitePost[]> => {
  const posts: SitePost[] = []

  for (const locale of SUPPORTED_LOCALES) {
    const localeDir = path.join(BLOG_CONTENT_DIR, locale)

    try {
      const files = await fs.readdir(localeDir)
      const mdxFiles = files.filter((file) => file.endsWith('.mdx'))

      for (const file of mdxFiles) {
        const filePath = path.join(localeDir, file)
        const fileContent = await fs.readFile(filePath, 'utf8')

        const frontmatter = parseFrontmatter(fileContent)
        const body = fileContent.replace(/^---[\s\S]*?---\n?/, '')

        posts.push({
          title: frontmatter.title ?? file.replace('.mdx', ''),
          date: frontmatter.date,
          summary: frontmatter.summary,
          locale,
          excerpt: getExcerpt(body)
        })
      }
    } catch {
      // Ignore missing locale folders
      continue
    }
  }

  const sorted = posts.toSorted((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })

  return sorted.slice(0, maxPosts)
}

const buildSiteContext = (posts: SitePost[]): string => {
  if (posts.length === 0) return 'No site posts found.'

  const sections = `Site sections you can reference naturally: blog (/blog), projects (/projects), about (/about), now (/now), snippets (/snippets), tools (/tools), music (/music), sitemap (/sitemap), rss (/rss).`

  const postLines = posts
    .map((post) => {
      const date = post.date ? ` (${post.date})` : ''
      const summary = post.summary ? ` — ${post.summary}` : ''
      return `• ${post.title}${date} [${post.locale}]: ${post.excerpt}${summary}`
    })
    .join('\n')

  return `${sections}\nRecent posts:\n${postLines}`
}

const getRandomUsers = async (count: number): Promise<RandomUser[]> => {
  const response = await fetch(`https://randomuser.me/api/?results=${count}&nat=us,gb,fr,jp`)
  const data = await response.json()
  return data.results
}

const generateComment = async (
  gender: 'male' | 'female',
  language: Language,
  siteContext: string
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

  const commentType = Math.random()
  let type: 'ultra-short' | 'short' | 'medium' = 'short'
  if (commentType < 0.6) type = 'ultra-short'
  else if (commentType < 0.9) type = 'short'
  else type = 'medium'

  const blogTopics = [
    'meditation and mindfulness',
    'productivity techniques like Pomodoro',
    'impostor syndrome and self-doubt',
    'leaving social media',
    'privacy and digital minimalism',
    'AI trends and technology',
    'front-end development',
    'SQL Server and databases',
    'mental health and personal growth',
    'starting over and new beginnings',
    'solitude and superficiality',
    'fear of failure',
    'work-life balance'
  ]

  const randomTopic = blogTopics[Math.floor(Math.random() * blogTopics.length)]

  const baseExamples = `Examples of real guestbook comments:
- “i'm glad you're here. leave a memory.”
- “I love your site. Just read your 'never stop tinkering with AI', and you've inspired me to go on my own AI pathway.”
- “Thanks for the script to mass unfollow people on LinkedIn!”
- “Love the Kirby eating the blog post animation!”
- “Could you share more details on how you put these Cloudflare services together to come up with this? really cool”

Real site context (recent posts and topics):
${siteContext}

Rules:
- Write only ONE comment (no lists or options).
- Feel natural and specific, as if you actually read one or two of the posts above.
- If mentioning a post, use its real title or topic; keep it short and genuine.
- Do not include a signature or the visitor name.
- Avoid repeating the same comment style; vary tone slightly.
- Do NOT start with dashes, bullets, or quotes. Just a natural sentence or fragment.`

  const prompts: Record<
    Language,
    Record<'ultra-short' | 'short' | 'medium', Record<'male' | 'female', string>>
  > = {
    en: {
      'ultra-short': {
        male: `You are a real person who just read this blog (topics: ${randomTopic}). ${baseExamples}

Write ONE super brief comment (1-5 words), lowercase preferred. No lists, no bullets, no signature:`,
        female: `You are a real person who just read this blog (topics: ${randomTopic}). ${baseExamples}

Write ONE super brief comment (1-5 words), lowercase preferred. No lists, no bullets, no signature:`
      },
      short: {
        male: `You are a real person visiting a personal developer blog with posts about ${randomTopic}. ${baseExamples}

Write ONE short sentence (5-15 words), casual and natural. Mention a real topic or post if relevant. No signature:`,
        female: `You are a real person visiting a personal developer blog with posts about ${randomTopic}. ${baseExamples}

Write ONE short sentence (5-15 words), casual and natural. Mention a real topic or post if relevant. No signature:`
      },
      medium: {
        male: `You are a real person visiting a personal developer blog with posts about ${randomTopic}, tech, databases, productivity, and personal growth. ${baseExamples}

Write ONE or TWO short sentences, casual and genuine. You can nod to a specific post or detail. 1 emoji max if it feels natural. No signature:`,
        female: `You are a real person visiting a personal developer blog with posts about ${randomTopic}, tech, databases, productivity, and personal growth. ${baseExamples}

Write ONE or TWO short sentences, casual and genuine. You can nod to a specific post or detail. 1 emoji max if it feels natural. No signature:`
      }
    },
    fr: {
      'ultra-short': {
        male: `Tu es une vraie personne qui vient de lire le blog (sujets: ${randomTopic}). ${baseExamples}

Écris UN commentaire très bref (1-5 mots), sans liste ni signature:`,
        female: `Tu es une vraie personne qui vient de lire le blog (sujets: ${randomTopic}). ${baseExamples}

Écris UN commentaire très bref (1-5 mots), sans liste ni signature:`
      },
      short: {
        male: `Tu es un vrai visiteur d'un blog perso (sujets: ${randomTopic}). ${baseExamples}

Écris UNE phrase courte (5-15 mots), naturelle, en mentionnant un sujet réel si possible. Pas de signature:`,
        female: `Tu es une vraie visiteuse d'un blog perso (sujets: ${randomTopic}). ${baseExamples}

Écris UNE phrase courte (5-15 mots), naturelle, en mentionnant un sujet réel si possible. Pas de signature:`
      },
      medium: {
        male: `Tu es un vrai lecteur du blog (sujets: ${randomTopic}). ${baseExamples}

Écris 1 à 2 phrases courtes, sincères et spécifiques si possible à un article. 1 emoji max. Pas de signature:`,
        female: `Tu es une vraie lectrice du blog (sujets: ${randomTopic}). ${baseExamples}

Écris 1 à 2 phrases courtes, sincères et spécifiques si possible à un article. 1 emoji max. Pas de signature:`
      }
    },
    ja: {
      'ultra-short': {
        male: `あなたはこのブログを読んだ訪問者です（テーマ: ${randomTopic}）。${baseExamples}

とても短いコメントを1つ（1-5文字）だけ書いてください。箇条書きや署名は禁止:`,
        female: `あなたはこのブログを読んだ訪問者です（テーマ: ${randomTopic}）。${baseExamples}

とても短いコメントを1つ（1-5文字）だけ書いてください。箇条書きや署名は禁止:`
      },
      short: {
        male: `あなたはこのブログを訪れています（テーマ: ${randomTopic}）。${baseExamples}

短い文を1つ（5-15文字）。実際の投稿やテーマに軽く触れてもOK。署名なしで:`,
        female: `あなたはこのブログを訪れています（テーマ: ${randomTopic}）。${baseExamples}

短い文を1つ（5-15文字）。実際の投稿やテーマに軽く触れてもOK。署名なしで:`
      },
      medium: {
        male: `あなたはこのブログの読者です（テーマ: ${randomTopic}）。${baseExamples}

1-2文で、具体的で自然なコメントを書いてください。必要なら1つだけ絵文字可。署名不要:`,
        female: `あなたはこのブログの読者です（テーマ: ${randomTopic}）。${baseExamples}

1-2文で、具体的で自然なコメントを書いてください。必要なら1つだけ絵文字可。署名不要:`
      }
    }
  }

  const result = await model.generateContent(prompts[language][type][gender])
  const comment = result.response.text().trim()

  let cleaned = comment

  cleaned = cleaned.replace(/^\s*[-*•]\s*/gm, '')
  cleaned = cleaned.replace(/^\s*\*+\s*/gm, '')
  cleaned = cleaned.replace(/^(?:")/gm, '')
  cleaned = cleaned.replace(/(?:")$/gm, '')
  cleaned = cleaned.replace(/^(?:"|- )/gm, '')
  cleaned = cleaned.replace(/(?:")$/gm, '')
  cleaned = cleaned.replace(/\n\s*\n/g, '\n')
  cleaned = cleaned.replace(/\n/g, ' ')
  cleaned = cleaned.replace(/\s+/g, ' ')

  return cleaned.trim()
}

const generateComments = async (count: number): Promise<GeneratedComment[]> => {
  const sitePosts = await loadSitePosts()
  const siteContext = buildSiteContext(sitePosts)
  const languages: Language[] = ['en', 'fr', 'ja']
  const users = await getRandomUsers(count)
  const comments: GeneratedComment[] = []

  for (const user of users) {
    const language = languages[Math.floor(Math.random() * languages.length)] ?? 'en'
    const fullName = `${user.name.first} ${user.name.last}`

    const comment = await generateComment(user.gender, language, siteContext)

    comments.push({
      name: fullName,
      email: user.email,
      image: user.picture.large,
      comment,
      language
    })
  }

  return comments
}

const getRandomDateInRange = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

const main = async () => {
  console.log('🌱 Seeding guestbook with realistic comments...')

  const commentCount = 30
  const startDate = new Date('2024-01-01')
  const endDate = new Date()

  console.log(`📝 Generating ${commentCount} comments...`)
  const comments = await generateComments(commentCount)

  console.log(`💾 Inserting users and comments into database...`)

  for (const commentData of comments) {
    const userId = nanoid()
    const commentId = nanoid()
    const createdAt = getRandomDateInRange(startDate, endDate)

    await db.insert(users).values({
      id: userId,
      name: commentData.name,
      email: commentData.email,
      image: commentData.image,
      emailVerified: true,
      isAnonymous: false,
      isPublic: true,
      role: 'user',
      createdAt: createdAt,
      updatedAt: createdAt
    })

    await db.insert(guestbook).values({
      id: commentId,
      body: commentData.comment,
      userId: userId,
      createdAt: createdAt,
      updatedAt: createdAt
    })

    console.log(`✅ Added comment by ${commentData.name} (${commentData.language})`)
  }

  console.log(`🎉 Successfully seeded ${commentCount} guestbook comments!`)
}

try {
  await main()
} catch (error) {
  console.error('❌ Error seeding guestbook:\n', error)
  process.exitCode = 1
}

