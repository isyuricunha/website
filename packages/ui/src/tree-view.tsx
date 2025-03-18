import { type TreeCollection, TreeView as TreeViewPrimitive } from '@ark-ui/react'
import { cn } from '@tszhong0411/utils'
import { ChevronRightIcon, FileIcon, FolderIcon } from 'lucide-react'

type Node = {
  id: string
  name: string
  children?: Node[]
}

type TreeViewProps = {
  collection: TreeCollection<Node>
  label?: string
} & Omit<React.ComponentProps<typeof TreeViewPrimitive.Root>, 'collection'>

const TreeView = (props: TreeViewProps) => {
  const { collection, className, label = 'Tree View', ...rest } = props

  return (
    <TreeViewPrimitive.Root
      collection={collection}
      className={cn('bg-card rounded-lg border p-2', className)}
      {...rest}
    >
      <TreeViewPrimitive.Label className='sr-only'>{label}</TreeViewPrimitive.Label>
      <TreeViewPrimitive.Tree aria-label={label}>
        {collection.rootNode.children?.map((node, index) => (
          <TreeViewNode key={node.id} node={node} indexPath={[index]} />
        ))}
      </TreeViewPrimitive.Tree>
    </TreeViewPrimitive.Root>
  )
}

type TreeViewNodeProps = TreeViewPrimitive.NodeProviderProps<Node>

const TreeViewNode = (props: TreeViewNodeProps) => {
  const { node, indexPath } = props

  return (
    <TreeViewPrimitive.NodeProvider key={node.id} node={node} indexPath={indexPath}>
      {node.children ? (
        <TreeViewPrimitive.Branch>
          <TreeViewPrimitive.BranchControl className='hover:bg-accent hover:text-accent-foreground flex items-center justify-between rounded-md px-2 py-1.5 pl-[calc(var(--depth)*8px)] text-sm'>
            <TreeViewPrimitive.BranchText className='flex items-center gap-2'>
              <FolderIcon className='size-4' /> {node.name}
            </TreeViewPrimitive.BranchText>
            <TreeViewPrimitive.BranchIndicator className='[&[data-state=open]>svg]:rotate-90'>
              <ChevronRightIcon className='size-4 transition-transform duration-200' />
            </TreeViewPrimitive.BranchIndicator>
          </TreeViewPrimitive.BranchControl>
          <TreeViewPrimitive.BranchContent className='data-[state=open]:animate-tree-view-content-down data-[state=closed]:animate-tree-view-content-up overflow-hidden'>
            <TreeViewPrimitive.BranchIndentGuide />
            {node.children.map((child, index) => (
              <TreeViewNode key={child.id} node={child} indexPath={[...indexPath, index]} />
            ))}
          </TreeViewPrimitive.BranchContent>
        </TreeViewPrimitive.Branch>
      ) : (
        <TreeViewPrimitive.Item className='hover:bg-accent hover:text-accent-foreground data-selected:bg-accent relative rounded-md px-2 py-1.5 pl-[calc(var(--depth)*8px)] text-sm'>
          <TreeViewPrimitive.ItemText className='flex items-center gap-2'>
            <FileIcon className='size-4' />
            {node.name}
          </TreeViewPrimitive.ItemText>
        </TreeViewPrimitive.Item>
      )}
    </TreeViewPrimitive.NodeProvider>
  )
}

export { type Node, TreeView, TreeViewNode }
