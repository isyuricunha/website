'use client'

import { Fragment, memo, type ReactNode } from 'react'
import MarkdownToJSX from 'markdown-to-jsx'
import { CodeBlock } from '@isyuricunha/yutheme'

import { is_safe_internal_path } from '../chat-link-policy'
import { isPublicRepositoryHref, publicContactHrefs } from '@/lib/public-contact'

type MarkdownLinkProps = { href?: string; children?: ReactNode }
type MarkdownImageProps = { alt?: string }

const MarkdownLink = ({
  href,
  children,
  allowedHrefs
}: MarkdownLinkProps & { allowedHrefs?: string[] }) =>
  href &&
  ((is_safe_internal_path(href) && (!allowedHrefs || allowedHrefs.includes(href))) ||
    publicContactHrefs.has(href) ||
    (isPublicRepositoryHref(href) && allowedHrefs?.includes(href))) ? (
    <a href={href} className='break-words underline underline-offset-2'>
      {children}
    </a>
  ) : (
    <span>{children}</span>
  )

const MarkdownImage = ({ alt }: MarkdownImageProps) => <span>{alt ?? ''}</span>

export const ChatMarkdown = memo(
  ({ children, allowedHrefs }: { children: string; allowedHrefs?: string[] }) => (
    <div className='prose prose-sm dark:prose-invert max-w-none min-w-0 [overflow-wrap:anywhere] break-words whitespace-normal [&_li]:my-0.5 [&_ol]:my-2 [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_pre]:my-2 [&_td]:px-2 [&_th]:px-2 [&_ul]:my-2'>
      <MarkdownToJSX
        options={{
          overrides: {
            a: (props: MarkdownLinkProps) => (
              <MarkdownLink {...props} allowedHrefs={allowedHrefs} />
            ),
            img: MarkdownImage,
            table: {
              component: ({ children }: { children?: ReactNode }) => (
                <div className='my-2 max-w-full overflow-x-auto rounded-md border border-[var(--border-subtle)]'>
                  <table className='m-0 w-full min-w-max text-left text-xs'>{children}</table>
                </div>
              )
            },
            pre: (preProps: any) => {
              const codeProps = preProps?.children?.props
              const raw = codeProps?.children
              const code = typeof raw === 'string' ? raw : String(raw ?? '')
              const className = typeof codeProps?.className === 'string' ? codeProps.className : ''
              const lang = className.startsWith('lang-') ? className.slice(5) : undefined
              return (
                <CodeBlock
                  data-lang={lang}
                  className='break-words whitespace-pre-wrap'
                  figureClassName='my-2 max-w-full overflow-x-auto'
                >
                  <code>{code}</code>
                </CodeBlock>
              )
            }
          },
          disableParsingRawHTML: true,
          wrapper: Fragment
        }}
      >
        {children}
      </MarkdownToJSX>
    </div>
  )
)
ChatMarkdown.displayName = 'ChatMarkdown'
