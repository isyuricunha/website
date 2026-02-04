'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { useRouter } from '@isyuricunha/i18n/routing'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
    toast
} from '@isyuricunha/ui'
import { useEffect, useMemo, useState } from 'react'

import { changeEmail, changePassword, updateUser, useSession } from '@/lib/auth-client'
import { api } from '@/trpc/react'
import { getAvatarAbbreviation } from '@/utils/get-avatar-abbreviation'
import { getDefaultImage } from '@/utils/get-default-image'

const SettingsForm = () => {
    const { data: session, isPending } = useSession()
    const t = useTranslations()
    const router = useRouter()

    const user = session?.user

    const defaultImage = useMemo(() => {
        if (!user?.id) return null
        return getDefaultImage(user.id)
    }, [user?.id])

    const [profileForm, setProfileForm] = useState({
        image: '',
        bio: '',
        username: '',
        isPublic: true,
        nameColor: '',
        nameEffect: 'none'
    })

    const [emailForm, setEmailForm] = useState({
        newEmail: ''
    })

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    })

    const [avatarFile, setAvatarFile] = useState<File | null>(null)

    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isSavingEmail, setIsSavingEmail] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)

    const createAvatarUploadUrlMutation = api.users.createAvatarUploadUrl.useMutation()

    useEffect(() => {
        if (!user) return

        setProfileForm({
            image: user.image ?? '',
            bio: user.bio ?? '',
            username: user.username ?? '',
            isPublic: user.isPublic ?? true,
            nameColor: user.nameColor ?? '',
            nameEffect: user.nameEffect ?? 'none'
        })
    }, [user])

    if (isPending) return null
    if (!session) return null
    if (!user) return null

    const effectiveImage = profileForm.image || defaultImage || ''

    const save_profile = async () => {
        if (!user) return

        setIsSavingProfile(true)
        try {
            const { error } = await updateUser({
                bio: profileForm.bio || undefined,
                username: profileForm.username || undefined,
                isPublic: profileForm.isPublic,
                nameColor: profileForm.nameColor || undefined,
                nameEffect: profileForm.nameEffect,
                image: profileForm.image || undefined
            })

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success(t('settings.messages.profile-updated'))
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t('common.unknown-error'))
        } finally {
            setIsSavingProfile(false)
        }
    }

    const upload_avatar = async () => {
        if (!user) return

        if (!avatarFile) {
            toast.error(t('settings.messages.avatar-file-required'))
            return
        }

        if (!['image/png', 'image/jpeg', 'image/webp'].includes(avatarFile.type)) {
            toast.error(t('settings.messages.avatar-invalid-type'))
            return
        }

        if (avatarFile.size > 5 * 1024 * 1024) {
            toast.error(t('settings.messages.avatar-too-large'))
            return
        }

        try {
            const result = await createAvatarUploadUrlMutation.mutateAsync({
                contentType: avatarFile.type as 'image/png' | 'image/jpeg' | 'image/webp',
                size: avatarFile.size
            })

            const upload_response = await fetch(result.uploadUrl, {
                method: 'PUT',
                headers: result.requiredHeaders,
                body: avatarFile
            })

            if (!upload_response.ok) {
                throw new Error(`Upload failed with status ${upload_response.status}`)
            }

            const { error } = await updateUser({
                image: result.publicUrl
            })

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success(t('settings.messages.avatar-updated'))
            setAvatarFile(null)
            setProfileForm((p) => ({ ...p, image: result.publicUrl }))
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t('common.unknown-error'))
        }
    }

    const submit_change_email = async () => {
        const newEmail = emailForm.newEmail.trim()
        if (!newEmail) {
            toast.error(t('settings.messages.email-required'))
            return
        }

        setIsSavingEmail(true)
        try {
            const { error } = await changeEmail({
                newEmail,
                callbackURL: '/settings'
            })

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success(t('settings.messages.email-verification-sent'))
            setEmailForm({ newEmail: '' })
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t('common.unknown-error'))
        } finally {
            setIsSavingEmail(false)
        }
    }

    const submit_change_password = async () => {
        if (!passwordForm.currentPassword) {
            toast.error(t('settings.messages.current-password-required'))
            return
        }

        if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
            toast.error(t('settings.messages.password-too-short'))
            return
        }

        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            toast.error(t('settings.messages.passwords-do-not-match'))
            return
        }

        setIsSavingPassword(true)
        try {
            const { error } = await changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                revokeOtherSessions: true
            })

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success(t('settings.messages.password-updated'))
            setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t('common.unknown-error'))
        } finally {
            setIsSavingPassword(false)
        }
    }

    const isAnonymous = user.isAnonymous === true

    return (
        <div className='space-y-10'>
            <section className='space-y-4'>
                <div>
                    <h3 className='text-lg font-semibold'>{t('settings.sections.profile')}</h3>
                    <p className='text-muted-foreground text-sm'>{t('settings.sections.profile-description')}</p>
                </div>

                <div className='flex items-center gap-4'>
                    <Avatar className='size-12'>
                        <AvatarImage src={effectiveImage} />
                        <AvatarFallback>{getAvatarAbbreviation(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                        <Label htmlFor='image'>{t('settings.fields.avatar-url')}</Label>
                        <Input
                            id='image'
                            type='url'
                            value={profileForm.image}
                            disabled={isAnonymous}
                            onChange={(e) => setProfileForm((p) => ({ ...p, image: e.target.value }))}
                            placeholder='https://...'
                        />
                        <div className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-end'>
                            <div className='flex-1'>
                                <Label htmlFor='avatarFile'>{t('settings.fields.avatar-upload')}</Label>
                                <Input
                                    id='avatarFile'
                                    type='file'
                                    accept='image/png,image/jpeg,image/webp'
                                    disabled={isAnonymous || createAvatarUploadUrlMutation.isPending}
                                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                                />
                            </div>
                            <Button
                                type='button'
                                variant='secondary'
                                disabled={
                                    isAnonymous ||
                                    createAvatarUploadUrlMutation.isPending ||
                                    !avatarFile
                                }
                                isPending={createAvatarUploadUrlMutation.isPending}
                                onClick={upload_avatar}
                            >
                                {t('settings.actions.upload-avatar')}
                            </Button>
                        </div>
                        {isAnonymous ? (
                            <p className='text-muted-foreground mt-1 text-xs'>
                                {t('settings.messages.anonymous-avatar-restriction')}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label htmlFor='username'>{t('settings.fields.username')}</Label>
                        <Input
                            id='username'
                            value={profileForm.username}
                            onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                            placeholder='your-username'
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label>{t('settings.fields.public-profile')}</Label>
                        <Select
                            value={profileForm.isPublic ? 'public' : 'private'}
                            onValueChange={(value) => setProfileForm((p) => ({ ...p, isPublic: value === 'public' }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='public'>{t('settings.fields.public')}</SelectItem>
                                <SelectItem value='private'>{t('settings.fields.private')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label htmlFor='nameColor'>{t('settings.fields.name-color')}</Label>
                        <Input
                            id='nameColor'
                            value={profileForm.nameColor}
                            onChange={(e) => setProfileForm((p) => ({ ...p, nameColor: e.target.value }))}
                            placeholder='#ff0000'
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label>{t('settings.fields.name-effect')}</Label>
                        <Select
                            value={profileForm.nameEffect}
                            onValueChange={(value) => setProfileForm((p) => ({ ...p, nameEffect: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='none'>{t('settings.effects.none')}</SelectItem>
                                <SelectItem value='rays'>{t('settings.effects.rays')}</SelectItem>
                                <SelectItem value='glow'>{t('settings.effects.glow')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='bio'>{t('settings.fields.bio')}</Label>
                    <Textarea
                        id='bio'
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                        placeholder={t('settings.fields.bio-placeholder')}
                    />
                </div>

                <div className='flex justify-end'>
                    <Button onClick={save_profile} isPending={isSavingProfile} disabled={isSavingProfile}>
                        {t('settings.actions.save-profile')}
                    </Button>
                </div>
            </section>

            <section className='space-y-4'>
                <div>
                    <h3 className='text-lg font-semibold'>{t('settings.sections.security')}</h3>
                    <p className='text-muted-foreground text-sm'>{t('settings.sections.security-description')}</p>
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='newEmail'>{t('settings.fields.new-email')}</Label>
                    <Input
                        id='newEmail'
                        type='email'
                        value={emailForm.newEmail}
                        onChange={(e) => setEmailForm({ newEmail: e.target.value })}
                        placeholder='you@example.com'
                    />
                </div>

                <div className='flex justify-end'>
                    <Button
                        variant='secondary'
                        onClick={submit_change_email}
                        isPending={isSavingEmail}
                        disabled={isSavingEmail}
                    >
                        {t('settings.actions.change-email')}
                    </Button>
                </div>

                <div className='grid gap-4 sm:grid-cols-3'>
                    <div className='space-y-2'>
                        <Label htmlFor='currentPassword'>{t('settings.fields.current-password')}</Label>
                        <Input
                            id='currentPassword'
                            type='password'
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='newPassword'>{t('settings.fields.new-password')}</Label>
                        <Input
                            id='newPassword'
                            type='password'
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='confirmNewPassword'>{t('settings.fields.confirm-new-password')}</Label>
                        <Input
                            id='confirmNewPassword'
                            type='password'
                            value={passwordForm.confirmNewPassword}
                            onChange={(e) =>
                                setPasswordForm((p) => ({ ...p, confirmNewPassword: e.target.value }))
                            }
                        />
                    </div>
                </div>

                <div className='flex justify-end'>
                    <Button
                        variant='secondary'
                        onClick={submit_change_password}
                        isPending={isSavingPassword}
                        disabled={isSavingPassword}
                    >
                        {t('settings.actions.change-password')}
                    </Button>
                </div>
            </section>
        </div>
    )
}

export default SettingsForm
