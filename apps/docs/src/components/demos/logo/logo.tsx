import { Logo } from '@isyuricunha/ui'

const LogoDemo = () => {
  return (
    <div className='flex items-center gap-4'>
      <Logo className='h-8 w-8' />
      <Logo className='h-12 w-12' />
      <Logo className='text-accent h-16 w-16' />
    </div>
  )
}

export default LogoDemo
