import { Toggle } from '@tszhong0411/ui'
import { ItalicIcon } from 'lucide-react'

const ToggleSmallDemo = () => {
  return (
    <Toggle size='sm' aria-label='Toggle italic'>
      <ItalicIcon className='size-4' />
    </Toggle>
  )
}

export default ToggleSmallDemo
