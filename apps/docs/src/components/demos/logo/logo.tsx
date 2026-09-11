import { Logo } from '@isyuricunha/ui'

const LogoDemo = () => {
  return (
    <div className='flex items-center gap-4'>
      <Logo className='h-8 w-8' />
      <Logo className='h-12 w-12' />
      <Logo className='h-16 w-16 text-accent' />
    </div>
  )
}

export default LogoDemo
