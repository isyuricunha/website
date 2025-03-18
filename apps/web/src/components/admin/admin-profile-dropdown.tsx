import { useTranslations } from '@tszhong0411/i18n/client'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Skeleton
} from '@tszhong0411/ui'

import { useSession } from '@/lib/auth-client'
import { useDialogsStore } from '@/store/dialogs'
import { getAvatarAbbreviation } from '@/utils/get-avatar-abbreviation'
import { getDefaultImage } from '@/utils/get-default-image'

const AdminProfileDropdown = () => {
  const { data: session, isPending } = useSession()
  const t = useTranslations()
  const { setIsSignInOpen } = useDialogsStore()

  if (isPending) {
    return <Skeleton className='size-9 rounded-full' />
  }

  if (!session) {
    return (
      <Button size='sm' onClick={() => setIsSignInOpen(true)}>
        {t('common.sign-in')}
      </Button>
    )
  }

  const { id, image, name, email } = session.user
  const defaultImage = getDefaultImage(id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='size-9 rounded-full' variant='ghost'>
          <Avatar className='size-9'>
            <AvatarImage className='size-9' src={image ?? defaultImage} />
            <AvatarFallback>{getAvatarAbbreviation(name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end'>
        <DropdownMenuLabel>
          <div className='flex flex-col gap-1'>
            <p className='text-sm'>{name}</p>
            <p className='text-muted-foreground text-xs'>{email}</p>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AdminProfileDropdown
