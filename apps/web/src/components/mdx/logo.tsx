import { Logo as HongLogo } from '@isyuricunha/ui'

const Logo = () => {
  return (
    <div className='flex flex-col gap-4 md:flex-row'>
      <div className='bg-bg-surface flex h-52 w-full items-center justify-center rounded-lg border border-[var(--border-subtle)]'>
        <HongLogo className='text-text-primary' width={48} height={48} />
      </div>
      <div className='bg-bg-mockup flex h-52 w-full items-center justify-center rounded-lg border border-[var(--border-subtle)]'>
        <HongLogo className='text-accent-earth-text' width={48} height={48} />
      </div>
    </div>
  )
}

export default Logo
