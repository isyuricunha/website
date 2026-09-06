import { CodeBlock } from '@isyuricunha/ui'
import { useEffect, useState } from 'react'
import { type BundledLanguage, bundledLanguages } from 'shiki'

import { YU_DARK_SHIKI_THEME } from '@/lib/yu-dark-shiki-theme'
import { useHighlighterStore } from '@/store/highlighter'

type CommentCodeBlockProps = {
  children: {
    props: {
      children: string
      className?: string
      title?: string
    }
  }
}

const CommentCodeBlock = (props: CommentCodeBlockProps) => {
  const { children: codeBlockChild } = props
  const { children: code, className, title } = codeBlockChild.props
  const lang = className?.replace('lang-', '') ?? 'plaintext'
  const { highlighter } = useHighlighterStore()
  const [highlightedHtml, setHighlightedHtml] = useState('')
  const [isHighlighted, setIsHighlighted] = useState(false)

  useEffect(() => {
    if (!highlighter) return

    const generateHighlightedHtml = async () => {
      const loadedLanguages = highlighter.getLoadedLanguages()
      const hasLoadedLanguage = loadedLanguages.includes(lang)
      const bundledLang = bundledLanguages[lang as BundledLanguage]

      if (!hasLoadedLanguage) {
        await highlighter.loadLanguage(bundledLang)
      }

      return highlighter.codeToHtml(code, {
        lang: Object.hasOwn(bundledLanguages, lang) ? lang : 'plaintext',
        themes: {
          light: 'github-light-default',
          dark: YU_DARK_SHIKI_THEME
        },
        defaultColor: false
      })
    }

    const runHighlighting = async () => {
      const newHtml = await generateHighlightedHtml()
      setHighlightedHtml(newHtml)
      setIsHighlighted(true)
    }

    void runHighlighting()
  }, [code, highlighter, lang])

  const codeHtml = /<code\b[^>]*>([\s\S]*?)<\/code>/.exec(highlightedHtml)?.[1]

  return (
    <CodeBlock data-lang={lang} title={title} className='shiki' figureClassName='my-2'>
      {isHighlighted && codeHtml ? (
        <code
          dangerouslySetInnerHTML={{
            __html: codeHtml
          }}
        />
      ) : (
        <code>{code}</code>
      )}
    </CodeBlock>
  )
}

export default CommentCodeBlock
