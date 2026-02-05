'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { useRouter } from '@isyuricunha/i18n/routing'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton
} from '@isyuricunha/ui'
import { PencilIcon, SettingsIcon, UserIcon } from 'lucide-react'

import { signOut, useSession } from '@/lib/auth-client'
import UserName from '@/components/user/user-name'
import { useDialogsStore } from '@/store/dialogs'
import { getAvatarAbbreviation } from '@/utils/get-avatar-abbreviation'
import { getDefaultImage } from '@/utils/get-default-image'

const AccountDropdown = () => {
  const { data: session, isPending } = useSession()
  const t = useTranslations()
  const router = useRouter()
  const { setIsSignInOpen } = useDialogsStore()

  if (isPending) {
    return <Skeleton className='size-9 rounded-full' />
  }

  if (!session) {
    return (
      <Button
        variant='ghost'
        className='size-9 p-0'
        aria-label={t('common.sign-in')}
        onClick={() => setIsSignInOpen(true)}
      >
        <UserIcon className='size-4' />
      </Button>
    )
  }

  const { id, image, name, email, username, nameColor, nameEffect } = session.user
  const defaultImage = getDefaultImage(id)
  const handle = username ?? id
  const displayName = name ?? email ?? 'Account'
  const resolvedNameEffect =
    nameEffect === 'none' || nameEffect === 'rays' || nameEffect === 'glow' ? nameEffect : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='size-9 rounded-full p-0' variant='ghost' aria-label={displayName}>
          <Avatar className='size-9'>
            <AvatarImage className='size-9' src={image ?? defaultImage} />
            <AvatarFallback>{getAvatarAbbreviation(displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end'>
        <DropdownMenuLabel>
          <div className='flex flex-col gap-1'>
            <p className='text-sm'>
              <UserName
                name={displayName}
                color={nameColor}
                effect={resolvedNameEffect}
                className='font-normal'
              />
            </p>
            {email ? <p className='text-muted-foreground text-xs'>{email}</p> : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='gap-2' onClick={() => router.push(`/u/${handle}`)}>
          <UserIcon className='size-4' />
          {t('account.actions.my-profile')}
        </DropdownMenuItem>
        <DropdownMenuItem className='gap-2' onClick={() => router.push('/settings#profile')}>
          <PencilIcon className='size-4' />
          {t('account.actions.edit-profile')}
        </DropdownMenuItem>
        <DropdownMenuItem className='gap-2' onClick={() => router.push('/settings')}>
          <SettingsIcon className='size-4' />
          {t('command-menu.actions.settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='gap-2'
          onClick={async () => {
            await signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.refresh()
                }
              }
            })
          }}
        >
          {t('common.sign-out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AccountDropdown
