import fs from 'node:fs/promises'

import { CodeBlock } from '@isyuricunha/ui'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { codeToHast } from 'shiki/bundle/web'

import ComponentPreviewWrapper from './component-preview-wrapper'
import { YU_DARK_SHIKI_THEME } from '@/lib/yu-dark-shiki-theme'

type ComponentPreviewProps = {
  name: string
}

const ComponentPreview = async (props: ComponentPreviewProps) => {
  const { name } = props

  const Component = (await import(`@/components/demos/${name}`)).default
  const code = await fs.readFile(`src/components/demos/${name}.tsx`, 'utf8')

  const out = await codeToHast(code, {
    lang: 'tsx',
    themes: {
      light: 'github-light',
      dark: YU_DARK_SHIKI_THEME
    },
    defaultColor: false
  })

  return (
    <ComponentPreviewWrapper component={<Component />}>
      {toJsxRuntime(out, {
        Fragment,
        jsx,
        jsxs,
        components: {
          pre: (p) => <CodeBlock {...p} />
        }
      })}
    </ComponentPreviewWrapper>
  )
}

export default ComponentPreview
