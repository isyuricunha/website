declare module 'markdown-to-jsx' {
  import type { ComponentType, ReactNode } from 'react'

  export interface MarkdownToJSXOptions {
    [key: string]: unknown
  }

  export interface MarkdownProps {
    children?: ReactNode
    options?: MarkdownToJSXOptions
  }

  const Markdown: ComponentType<MarkdownProps>
  export default Markdown
}
