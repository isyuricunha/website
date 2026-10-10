import type { TOC } from '../types'
import type { Heading, Root } from 'mdast'
import type { Plugin } from 'unified'
import type { VFile } from 'vfile'

import Slugger from 'github-slugger'
import { visit } from 'unist-util-visit'

declare module 'mdast' {
  interface Data {
    hProperties?: {
      id?: string
    }
  }
}

const slugger = new Slugger()

export const remarkHeading: Plugin<[], Root> = () => {
  return (tree: Root, file: VFile) => {
    const toc: TOC[] = []
    slugger.reset()

    visit(tree, 'heading', (node: Heading) => {
      node.data ??= { hProperties: {} }
      node.data.hProperties ??= {}

      // Collect text from the whole heading (emphasis, strong, inline code,
      // links, …), not just a leading plain-text child: headings like
      // `## _Select Query_` otherwise get no id and vanish from the TOC.
      const text = node.children
        .map((child) => {
          if (child.type === 'text' || child.type === 'inlineCode') return child.value
          if (
            child.type === 'emphasis' ||
            child.type === 'strong' ||
            child.type === 'delete' ||
            child.type === 'link'
          ) {
            return child.children
              .map((grandchild) =>
                grandchild.type === 'text' || grandchild.type === 'inlineCode'
                  ? grandchild.value
                  : ''
              )
              .join('')
          }
          return ''
        })
        .join('')
        .trim()

      if (!text) return

      const id = slugger.slug(text)

      node.data.hProperties.id = id

      toc.push({
        title: text,
        url: id,
        depth: node.depth
      })

      return 'skip'
    })

    file.data.toc = toc
  }
}
