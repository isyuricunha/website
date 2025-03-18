'use client'

import {
  SiAmazon,
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
  SiHeroku,
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
import { useTranslations } from '@tszhong0411/i18n/client'
import { Marquee } from '@tszhong0411/ui'
import { ZapIcon } from 'lucide-react'

const StacksCard = () => {
  const t = useTranslations()

  return (
    <div className='shadow-feature-card flex h-60 flex-col gap-2 overflow-hidden rounded-xl p-4 lg:p-6'>
      <div className='flex items-center gap-2'>
        <ZapIcon className='size-[18px]' />
        <h2 className='text-sm'>{t('homepage.about-me.stacks')}</h2>
      </div>
      <Marquee gap='20px' className='py-4' fade pauseOnHover>
        <SiDocker className='size-10' />
        <SiKubernetes className='size-10' />
        <SiNginx className='size-10' />
        <SiApache className='size-10' />
        <SiAmazon className='size-10' />
        <SiGooglecloud className='size-10' />
        <SiDigitalocean className='size-10' />
        <SiUbuntu className='size-10' />
        <SiDebian className='size-10' />
        <SiCentos className='size-10' />
        <SiRedhat className='size-10' />
        <SiMongodb className='size-10' />
        <SiMysql className='size-10' />
        <SiMariadb className='size-10' />
      </Marquee>
      <Marquee gap='20px' className='py-4' reverse fade pauseOnHover>
        <SiApachecassandra className='size-10' />
        <SiHeroku className='size-10' />
        <SiOpenstack className='size-10' />
        <SiTerraform className='size-10' />
        <SiPuppet className='size-10' />
        <SiAnsible className='size-10' />
        <SiCloudflare className='size-10' />
        <SiVmware className='size-10' />
        <SiJenkins className='size-10' />
        <SiFirebase className='size-10' />
        <SiPostgresql className='size-10' />
        <SiRedis className='size-10' />
        <SiPrisma className='size-10' />
        <SiPrometheus className='size-10' />
      </Marquee>
    </div>
  )
}

export default StacksCard
