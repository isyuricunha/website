import { SiLinuxserver } from '@icons-pack/react-simple-icons'
import { useTranslations } from '@isyuricunha/i18n/client'
import { HeartIcon } from 'lucide-react'

const FavoriteFramework = () => {
  const t = useTranslations()

  return (
    <div className='shadow-feature-card bg-bg-surface flex flex-col gap-6 rounded-lg p-4 lg:p-6'>
      <div className='flex items-center gap-2'>
        <HeartIcon className='text-accent-earth-text size-[18px]' />
        <h2 className='text-sm font-medium'>{t('homepage.about-me.fav-framework')}</h2>
      </div>
      <div className='flex items-center justify-center'>
        <SiLinuxserver size={80} className='text-text-secondary' />
      </div>
    </div>
  )
}

export default FavoriteFramework
