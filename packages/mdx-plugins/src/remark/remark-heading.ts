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

      const childNode = node.children[0]

      if (childNode?.type !== 'text') return

      const text = childNode.value
      const id = slugger.slug(childNode.value)

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
