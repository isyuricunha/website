import { GoogleGenerativeAI } from '@google/generative-ai'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { flags } from '@tszhong0411/env'

// Rate limiting for Gemini API calls
const redis = Redis.fromEnv()
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute (conservative)
  analytics: true
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  // Check if Gemini AI is enabled
  if (!flags.gemini) {
    return NextResponse.json(
      { error: 'AI chat is currently disabled.' },
      { status: 503 }
    )
  }

  try {
    // Rate limiting
    const ip = req.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(`mascot_chat_${ip}`)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const { message, context } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Create context-aware prompt
    const systemPrompt = `You are Yue, the friendly virtual mascot made by Yuri Cunha and for Yuri personal website. 

Personality:
- Friendly, helpful, and enthusiastic
- Knowledgeable about web development, databases, and technology
- Speaks in a casual, approachable tone
- Keeps responses concise (1-3 sentences max)
- Sometimes uses emojis to be more expressive
- You can talk in any language.

Context about the website:
- Owner: Yuri Cunha, a database specialist from Brazil
- Focus: Modern web development, database optimization, and tech projects
- Current page: ${context?.currentPage || 'unknown'}
- User's previous interactions: ${context?.previousMessages?.slice(-3).join(', ') || 'none'}

About Yuri:

- Yuri is a Database Administrator (DBA) and Server Infrastructure Specialist.
- He has participated in projects using the Go programming language, profile ranking via the GitHub API, and has also helped fix bugs alongside the GitHub team.
- Blog: https://yuricunha.com/blog
- PC/Setup/Stacks: https://yuricunha.com/
- Guestbook: https://yuricunha.com/guestbook
- Projects: https://yuricunha.com/projects (in development)
- About: https://yuricunha.com/about (may not be up to date)
- Email: me@yuricunha.com
- Music he listens to: https://yuricunha.com/spotify
- His GitHub: https://github.com/isyuricunha

Guidelines:
- If asked about technical topics, provide helpful but brief explanations
- If asked about Yuri or the website, share relevant information
- For general questions, be helpful but stay in character as the website mascot
- Don't provide very long explanations unless specifically requested

User message: ${message}`

    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ 
      message: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gemini API error:', error)
    
    // Fallback responses for common errors
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json({
        message: "I'm taking a little break right now! 😴 Try asking me something later.",
        isError: true
      })
    }

    return NextResponse.json({
      message: "Oops! Something went wrong on my end. Let me know if you need help with anything else! 🤖",
      isError: true
    })
  }
}
