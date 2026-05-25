'use client'

import type { GetUsersOutput } from '@/trpc/routers/users'

import { useTranslations } from '@isyuricunha/i18n/client'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { api } from '@/trpc/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@isyuricunha/ui'

type User = GetUsersOutput['users'][number]

type UserEditModalProps = {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const UserEditModal = ({ user, open, onOpenChange }: UserEditModalProps) => {
  const t = useTranslations()
  const utils = api.useUtils()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'user',
    image: user?.image || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateUserMutation = api.users.updateUser.useMutation({
    onSuccess: () => {
      toast.success(t('admin.table.users.update-success'))
      utils.users.getUsers.invalidate()
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('admin.table.users.update-error'))
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const userSchema = z.object({
        name: z.string().min(1, t('admin.modals.edit-user.validation.name-required')),
        username: z.string().optional(),
        email: z.string().email(t('admin.modals.edit-user.validation.invalid-email')),
        role: z.enum(['user', 'admin']),
        image: z
          .string()
          .url(t('admin.modals.edit-user.validation.invalid-url'))
          .optional()
          .or(z.literal(''))
      })
      const validatedData = userSchema.parse(formData)
      setErrors({})

      if (user) {
        updateUserMutation.mutate({
          userId: user.id,
          ...validatedData
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('admin.modals.edit-user.title')}</DialogTitle>
          <DialogDescription>
            {user?.name} - {user?.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>{t('admin.modals.edit-user.name')}</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className='text-destructive text-sm'>{errors.name}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='username'>{t('admin.modals.edit-user.username')}</Label>
            <Input
              id='username'
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={errors.username ? 'border-destructive' : ''}
            />
            {errors.username && <p className='text-destructive text-sm'>{errors.username}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>{t('admin.modals.edit-user.email')}</Label>
            <Input
              id='email'
              type='email'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className='text-destructive text-sm'>{errors.email}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='role'>{t('admin.modals.edit-user.role')}</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='user'>{t('admin.modals.edit-user.roles.user')}</SelectItem>
                <SelectItem value='admin'>{t('admin.modals.edit-user.roles.admin')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='image'>{t('admin.modals.edit-user.image')}</Label>
            <Input
              id='image'
              type='url'
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              className={errors.image ? 'border-destructive' : ''}
            />
            {errors.image && <p className='text-destructive text-sm'>{errors.image}</p>}
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              {t('admin.modals.edit-user.cancel')}
            </Button>
            <Button type='submit' disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending
                ? t('admin.modals.edit-user.saving')
                : t('admin.modals.edit-user.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UserEditModal
