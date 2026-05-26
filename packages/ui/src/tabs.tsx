import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@isyuricunha/utils'

const Tabs = TabsPrimitive.Root

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>

const TabsList = (props: TabsListProps) => {
  const { className, ...rest } = props

  return (
    <TabsPrimitive.List
      className={cn(
        'tab-group text-text-tertiary inline-flex h-10 items-center justify-center rounded-sm bg-transparent p-0',
        className
      )}
      {...rest}
    />
  )
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>

const TabsTrigger = (props: TabsTriggerProps) => {
  const { className, ...rest } = props

  return (
    <TabsPrimitive.Trigger
      className={cn(
        'ring-offset-background inline-flex items-center justify-center rounded-sm border border-[var(--border-subtle)] px-3 py-1.5 font-mono text-xs font-medium whitespace-nowrap transition-colors',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        'disabled:pointer-events-none disabled:opacity-50',
        'hover:bg-bg-surface hover:text-text-primary data-[state=active]:bg-bg-surface data-[state=active]:text-text-primary data-[state=active]:border-[var(--border-default)]',
        className
      )}
      {...rest}
    />
  )
}

type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>

const TabsContent = (props: TabsContentProps) => {
  const { className, ...rest } = props

  return (
    <TabsPrimitive.Content
      className={cn(
        'ring-offset-background mt-2',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        className
      )}
      {...rest}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
