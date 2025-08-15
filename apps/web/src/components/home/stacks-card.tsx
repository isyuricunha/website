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
      <Marquee gap='12px' className='py-2' fade pauseOnHover>
        <SiDocker className='size-6' />
        <SiKubernetes className='size-6' />
        <SiNginx className='size-6' />
        <SiApache className='size-6' />
        <SiAmazon className='size-6' />
        <SiGooglecloud className='size-6' />
        <SiDigitalocean className='size-6' />
        <SiUbuntu className='size-6' />
        <SiDebian className='size-6' />
        <SiCentos className='size-6' />
        <SiRedhat className='size-6' />
        <SiMongodb className='size-6' />
        <SiMysql className='size-6' />
        <SiMariadb className='size-6' />
      </Marquee>
      <Marquee gap='12px' className='py-2' reverse fade pauseOnHover>
        <SiApachecassandra className='size-6' />
        <SiHeroku className='size-6' />
        <SiOpenstack className='size-6' />
        <SiTerraform className='size-6' />
        <SiPuppet className='size-6' />
        <SiAnsible className='size-6' />
        <SiCloudflare className='size-6' />
        <SiVmware className='size-6' />
        <SiJenkins className='size-6' />
        <SiFirebase className='size-6' />
        <SiPostgresql className='size-6' />
        <SiRedis className='size-6' />
        <SiPrisma className='size-6' />
        <SiPrometheus className='size-6' />
      </Marquee>
    </div>
  )
}

export default StacksCard
