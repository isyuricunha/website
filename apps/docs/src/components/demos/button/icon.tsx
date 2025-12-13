import { Button } from '@isyuricunha/ui'
import { CopyIcon } from 'lucide-react'

const ButtonIconDemo = () => {
  return (
    <Button variant='outline' size='icon' aria-label='Copy'>
      <CopyIcon className='size-4' />
    </Button>
  )
}

export default ButtonIconDemo
