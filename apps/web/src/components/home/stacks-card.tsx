'use client'

import {
  SiAnsible,
  SiApache,
  SiApachecassandra,
  SiCentos,
  SiCloudflare,
  SiDebian,
  SiDigitalocean,
  SiDocker,
  SiFirebase,
  SiGooglecloud,
  SiHeroui,
  SiJenkins,
  SiKubernetes,
  SiMariadb,
  SiMongodb,
  SiMysql,
  SiNginx,
  SiOpenstack,
  SiPostgresql,
  SiPrisma,
  SiPrometheus,
  SiPuppet,
  SiRedhat,
  SiRedis,
  SiTerraform,
  SiUbuntu,
  SiVmware
} from '@icons-pack/react-simple-icons'
import { useTranslations } from '@isyuricunha/i18n/client'
import { ZapIcon } from 'lucide-react'

const STACK_ICONS = [
  ['docker', SiDocker],
  ['kubernetes', SiKubernetes],
  ['nginx', SiNginx],
  ['apache', SiApache],
  ['google-cloud', SiGooglecloud],
  ['digitalocean', SiDigitalocean],
  ['ubuntu', SiUbuntu],
  ['debian', SiDebian],
  ['centos', SiCentos],
  ['redhat', SiRedhat],
  ['mongodb', SiMongodb],
  ['mysql', SiMysql],
  ['mariadb', SiMariadb],
  ['cassandra', SiApachecassandra],
  ['heroui', SiHeroui],
  ['openstack', SiOpenstack],
  ['terraform', SiTerraform],
  ['puppet', SiPuppet],
  ['ansible', SiAnsible],
  ['cloudflare', SiCloudflare],
  ['vmware', SiVmware],
  ['jenkins', SiJenkins],
  ['firebase', SiFirebase],
  ['postgresql', SiPostgresql],
  ['redis', SiRedis],
  ['prisma', SiPrisma],
  ['prometheus', SiPrometheus]
] as const

const StacksCard = () => {
  const t = useTranslations()

  return (
    <div className='shadow-feature-card bg-bg-surface flex min-h-60 flex-col gap-5 overflow-hidden rounded-lg p-4 lg:p-6'>
      <div className='flex items-center gap-2'>
        <ZapIcon className='text-accent-earth-text size-[18px]' />
        <h2 className='text-sm font-medium'>{t('homepage.about-me.stacks')}</h2>
      </div>
      <div className='text-muted-foreground grid grid-cols-7 gap-3'>
        {STACK_ICONS.map(([name, Icon]) => (
          <Icon key={name} className='size-5' />
        ))}
      </div>
    </div>
  )
}

export default StacksCard
