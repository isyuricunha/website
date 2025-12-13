import { Table } from '@isyuricunha/ui'
import { cn } from '@isyuricunha/utils'

type CommentTableProps = React.ComponentProps<'table'>

const CommentTable = (props: CommentTableProps) => {
  const { className, ...rest } = props

  return <Table className={cn('not-prose my-2', className)} {...rest} />
}

export default CommentTable
