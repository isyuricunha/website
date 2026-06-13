'use client'

import { useRef, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea
} from '@isyuricunha/ui'

import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { toast } from 'sonner'
import { cn } from '@isyuricunha/utils'
import { api } from '@/trpc/react'
import { getAnnouncementUi } from '@/lib/announcement-ui'

interface EditAnnouncementData {
  id: string
  title: string
  content: string
  titlePt?: string
  contentPt?: string
  titleEs?: string
  contentEs?: string
  titleFr?: string
  contentFr?: string
  titleDe?: string
  contentDe?: string
  titleJa?: string
  contentJa?: string
  titleZhCn?: string
  contentZhCn?: string
  type: string
  priority: number
  isDismissible: boolean
  isActive: boolean
  targetAudience?: any
}

const ANNOUNCEMENT_LOCALES = [
  { code: 'pt', label: 'Português', fieldSuffix: 'Pt' },
  { code: 'es', label: 'Español', fieldSuffix: 'Es' },
  { code: 'fr', label: 'Français', fieldSuffix: 'Fr' },
  { code: 'de', label: 'Deutsch', fieldSuffix: 'De' },
  { code: 'ja', label: '日本語', fieldSuffix: 'Ja' },
  { code: 'zh-CN', label: '中文（简体）', fieldSuffix: 'ZhCn' }
] as const

export default function AnnouncementManagement() {
  const t = useTranslations('admin.announcement-management')
  const commonT = useTranslations('common')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<EditAnnouncementData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const createTitleRef = useRef<HTMLInputElement>(null)
  const createContentRef = useRef<HTMLTextAreaElement>(null)
  const createTranslationRefsRef = useRef<
    Record<string, { title: HTMLInputElement | null; content: HTMLTextAreaElement | null }>
  >({})

  const editTitleRef = useRef<HTMLInputElement>(null)
  const editContentRef = useRef<HTMLTextAreaElement>(null)
  const editTranslationRefsRef = useRef<
    Record<string, { title: HTMLInputElement | null; content: HTMLTextAreaElement | null }>
  >({})

  // Queries
  const {
    data: announcements,
    isLoading,
    refetch
  } = api.announcements.getAnnouncements.useQuery(
    {
      adminView: true
    },
    {
      staleTime: 30_000
    }
  )

  const translateMutation = api.announcements.translateAnnouncement.useMutation({
    onError: (error) => {
      toast.error(t('messages.translate-failed', { message: error.message }))
    }
  })

  const handleTranslateAll = async (
    titleRef: React.RefObject<HTMLInputElement | null>,
    contentRef: React.RefObject<HTMLTextAreaElement | null>,
    translationRefsRef: React.RefObject<
      Record<
        string,
        { title: HTMLInputElement | null; content: HTMLTextAreaElement | null } | undefined
      >
    >
  ) => {
    const title = titleRef.current?.value ?? ''
    const content = contentRef.current?.value ?? ''

    if (!title.trim() || !content.trim()) {
      toast.error(t('messages.title-content-required'))
      return
    }

    const refs = translationRefsRef.current ?? {}

    // Translate to all languages in parallel
    const results = await Promise.allSettled(
      ANNOUNCEMENT_LOCALES.map(async (locale) => {
        const result = await translateMutation.mutateAsync({
          title,
          content,
          fromLang: 'en',
          toLang: locale.code
        })
        return { locale: locale.code, result }
      })
    )

    let successCount = 0
    for (const settled of results) {
      if (settled.status === 'fulfilled') {
        const { locale, result } = settled.value
        const ref = refs[locale]
        if (ref?.title) ref.title.value = result.titleTranslated
        if (ref?.content) ref.content.value = result.contentTranslated
        successCount++
      }
    }

    if (successCount > 0) {
      toast.success(t('messages.all-languages-filled', { count: successCount }))
    } else {
      toast.error(t('messages.translate-failed', { message: 'All translations failed' }))
    }
  }

  const { data: analytics } = api.announcements.getAnnouncementAnalytics.useQuery(
    {},
    {
      staleTime: 30_000
    }
  )

  // Mutations
  const createMutation = api.announcements.createAnnouncement.useMutation({
    onSuccess: () => {
      toast.success(t('messages.created'))
      setIsCreateDialogOpen(false)
      refetch()
    },
    onError: (error) => {
      toast.error(t('messages.create-failed', { message: error.message }))
    }
  })

  const updateMutation = api.announcements.updateAnnouncement.useMutation({
    onSuccess: () => {
      toast.success(t('messages.updated'))
      setIsEditDialogOpen(false)
      setEditingAnnouncement(null)
      refetch()
    },
    onError: (error) => {
      toast.error(t('messages.update-failed', { message: error.message }))
    }
  })

  const deleteMutation = api.announcements.deleteAnnouncement.useMutation({
    onSuccess: () => {
      toast.success(t('messages.deleted'))
      refetch()
    },
    onError: (error) => {
      toast.error(t('messages.delete-failed', { message: error.message }))
    }
  })

  const handleCreateAnnouncement = (formData: FormData) => {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as any
    const priority = Number.parseInt(formData.get('priority') as string) || 0
    const isDismissible = formData.get('isDismissible') === 'on'

    if (!title || !content) {
      toast.error(t('messages.title-content-required'))
      return
    }

    const getLocaleField = (locale: string, field: 'title' | 'content'): string | undefined => {
      const val = formData.get(`${field}_${locale}`) as string | null
      return val?.trim() ? val : undefined
    }

    createMutation.mutate({
      title,
      content,
      titlePt: getLocaleField('pt', 'title'),
      contentPt: getLocaleField('pt', 'content'),
      titleEs: getLocaleField('es', 'title'),
      contentEs: getLocaleField('es', 'content'),
      titleFr: getLocaleField('fr', 'title'),
      contentFr: getLocaleField('fr', 'content'),
      titleDe: getLocaleField('de', 'title'),
      contentDe: getLocaleField('de', 'content'),
      titleJa: getLocaleField('ja', 'title'),
      contentJa: getLocaleField('ja', 'content'),
      titleZhCn: getLocaleField('zh-CN', 'title'),
      contentZhCn: getLocaleField('zh-CN', 'content'),
      type,
      priority,
      isDismissible
    })
  }

  const handleEditAnnouncement = (formData: FormData) => {
    if (!editingAnnouncement) return

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as any
    const priority = Number.parseInt(formData.get('priority') as string) || 0
    const isDismissible = formData.get('isDismissible') === 'on'
    const isActive = formData.get('isActive') === 'on'

    if (!title || !content) {
      toast.error(t('messages.title-content-required'))
      return
    }

    const getLocaleField = (locale: string, field: 'title' | 'content'): string | undefined => {
      const val = formData.get(`${field}_${locale}`) as string | null
      return val?.trim() ? val : undefined
    }

    updateMutation.mutate({
      id: editingAnnouncement.id,
      title,
      content,
      titlePt: getLocaleField('pt', 'title'),
      contentPt: getLocaleField('pt', 'content'),
      titleEs: getLocaleField('es', 'title'),
      contentEs: getLocaleField('es', 'content'),
      titleFr: getLocaleField('fr', 'title'),
      contentFr: getLocaleField('fr', 'content'),
      titleDe: getLocaleField('de', 'title'),
      contentDe: getLocaleField('de', 'content'),
      titleJa: getLocaleField('ja', 'title'),
      contentJa: getLocaleField('ja', 'content'),
      titleZhCn: getLocaleField('zh-CN', 'title'),
      contentZhCn: getLocaleField('zh-CN', 'content'),
      type,
      priority,
      isDismissible,
      isActive
    })
  }

  const handleToggleActive = (announcement: any) => {
    updateMutation.mutate({
      id: announcement.id,
      isActive: !announcement.isActive
    })
  }

  const handleDeleteAnnouncement = (id: string) => {
    deleteMutation.mutate({ id })
  }

  const openEditDialog = (announcement: any) => {
    setEditingAnnouncement({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      titlePt: announcement.titlePt ?? undefined,
      contentPt: announcement.contentPt ?? undefined,
      titleEs: announcement.titleEs ?? undefined,
      contentEs: announcement.contentEs ?? undefined,
      titleFr: announcement.titleFr ?? undefined,
      contentFr: announcement.contentFr ?? undefined,
      titleDe: announcement.titleDe ?? undefined,
      contentDe: announcement.contentDe ?? undefined,
      titleJa: announcement.titleJa ?? undefined,
      contentJa: announcement.contentJa ?? undefined,
      titleZhCn: announcement.titleZhCn ?? undefined,
      contentZhCn: announcement.contentZhCn ?? undefined,
      type: announcement.type,
      priority: announcement.priority,
      isDismissible: announcement.isDismissible,
      isActive: announcement.isActive,
      targetAudience: announcement.targetAudience
    })
    setIsEditDialogOpen(true)
  }

  if (isLoading) {
    return <div className='p-6'>{t('loading')}</div>
  }

  return (
    <div className='space-y-8 p-4 sm:p-6'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='min-w-0 flex-1 space-y-1'>
          <h1 className='text-text-primary flex items-center gap-3 text-3xl font-medium tracking-tight sm:text-4xl'>
            <div className='text-accent-earth-text shrink-0 rounded-lg bg-[var(--accent-dim)] p-2.5'>
              <Megaphone className='h-7 w-7 sm:h-8 sm:w-8' />
            </div>
            <span className='truncate'>{t('title')}</span>
          </h1>
          <p className='text-text-secondary text-sm sm:text-base'>{t('description')}</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className='min-h-[44px] w-full px-4 text-sm sm:w-auto sm:px-6 sm:text-base'>
              <Plus className='mr-2 h-4 w-4 shrink-0' />
              <span className='truncate'>{t('actions.create')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className='mx-4 max-h-[90vh] max-w-2xl overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>{t('create.title')}</DialogTitle>
              <DialogDescription>{t('create.description')}</DialogDescription>
            </DialogHeader>
            <form action={handleCreateAnnouncement}>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='title'>{t('fields.title')}</Label>
                  <Input
                    id='title'
                    name='title'
                    placeholder={t('fields.title-placeholder')}
                    required
                    ref={createTitleRef}
                  />
                </div>

                <div>
                  <Label htmlFor='content'>{t('fields.content')}</Label>
                  <Textarea
                    id='content'
                    name='content'
                    placeholder={t('fields.content-placeholder')}
                    rows={4}
                    required
                    ref={createContentRef}
                  />
                </div>

                {ANNOUNCEMENT_LOCALES.map((locale) => (
                  <div
                    key={locale.code}
                    className='space-y-3 rounded-lg border border-[var(--border-subtle)] p-3'
                  >
                    <div className='flex items-center justify-between'>
                      <Label className='text-sm font-medium'>{locale.label}</Label>
                      <Badge variant='outline' className='text-xs'>
                        {locale.code}
                      </Badge>
                    </div>
                    <div>
                      <Input
                        name={`title_${locale.code}`}
                        placeholder={t('fields.title-placeholder')}
                        ref={(el: HTMLInputElement | null) => {
                          if (!createTranslationRefsRef.current)
                            createTranslationRefsRef.current = {}
                          const existing = createTranslationRefsRef.current[locale.code] ?? {
                            title: null,
                            content: null
                          }
                          createTranslationRefsRef.current[locale.code] = { ...existing, title: el }
                        }}
                      />
                    </div>
                    <div>
                      <Textarea
                        name={`content_${locale.code}`}
                        placeholder={t('fields.content-placeholder')}
                        rows={2}
                        ref={(el: HTMLTextAreaElement | null) => {
                          if (!createTranslationRefsRef.current)
                            createTranslationRefsRef.current = {}
                          const existing = createTranslationRefsRef.current[locale.code] ?? {
                            title: null,
                            content: null
                          }
                          createTranslationRefsRef.current[locale.code] = {
                            ...existing,
                            content: el
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() =>
                      handleTranslateAll(createTitleRef, createContentRef, createTranslationRefsRef)
                    }
                    disabled={translateMutation.isPending}
                  >
                    {translateMutation.isPending
                      ? t('actions.translating')
                      : t('actions.translate-all')}
                  </Button>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='type'>{t('fields.type')}</Label>
                    <Select name='type' defaultValue='info'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='info'>{t('types.info')}</SelectItem>
                        <SelectItem value='success'>{t('types.success')}</SelectItem>
                        <SelectItem value='warning'>{t('types.warning')}</SelectItem>
                        <SelectItem value='error'>{t('types.error')}</SelectItem>
                        <SelectItem value='maintenance'>{t('types.maintenance')}</SelectItem>
                        <SelectItem value='feature'>{t('types.feature')}</SelectItem>
                        <SelectItem value='update'>{t('types.update')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='priority'>{t('fields.priority')}</Label>
                    <Input
                      id='priority'
                      name='priority'
                      type='number'
                      min='0'
                      max='10'
                      defaultValue='0'
                    />
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='isDismissible'
                    name='isDismissible'
                    defaultChecked
                    className='rounded'
                  />
                  <Label htmlFor='isDismissible'>{t('fields.dismissible')}</Label>
                </div>
              </div>

              <DialogFooter className='mt-6'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  {commonT('cancel')}
                </Button>
                <Button type='submit'>{t('actions.create')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          <Card className='bg-bg-surface hover:shadow-feature-card border-[var(--border-subtle)] transition-all duration-300'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-text-secondary text-sm font-medium'>
                {t('analytics.total-views.title')}
              </CardTitle>
              <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                <BarChart3 className='h-5 w-5' />
              </div>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-accent-earth-text text-3xl font-medium tracking-tight'>
                {analytics.totalViews}
              </div>
              <p className='text-text-secondary text-xs leading-relaxed'>
                {t('analytics.total-views.description')}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-bg-surface hover:shadow-feature-card border-[var(--border-subtle)] transition-all duration-300'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-text-secondary text-sm font-medium'>
                {t('analytics.dismissal-rate.title')}
              </CardTitle>
              <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                <Users className='h-5 w-5' />
              </div>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-accent-earth-text text-3xl font-medium tracking-tight'>
                {analytics.dismissalRate.toFixed(1)}%
              </div>
              <p className='text-text-secondary text-xs leading-relaxed'>
                {t('analytics.dismissal-rate.description', {
                  count: analytics.totalDismissals
                })}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-bg-surface hover:shadow-feature-card border-[var(--border-subtle)] transition-all duration-300'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-text-secondary text-sm font-medium'>
                {t('analytics.active.title')}
              </CardTitle>
              <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                <Megaphone className='h-5 w-5' />
              </div>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-accent-earth-text text-3xl font-medium tracking-tight'>
                {announcements?.announcements?.filter((a) => a.isActive).length || 0}
              </div>
              <p className='text-text-secondary text-xs leading-relaxed'>
                {t('analytics.active.description')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Announcements List */}
      <Card className='bg-bg-surface border-[var(--border-subtle)]'>
        <CardHeader className='p-4 sm:p-6'>
          <div className='mb-1 flex items-center gap-2'>
            <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
              <Megaphone className='h-4 w-4' />
            </div>
            <CardTitle className='text-lg font-medium sm:text-xl'>{t('list.title')}</CardTitle>
          </div>
          <CardDescription className='text-xs sm:text-sm'>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent className='p-4 sm:p-6'>
          <ScrollArea className='h-[400px] sm:h-[500px] lg:h-[600px]'>
            <div className='space-y-4'>
              {announcements?.announcements?.map((announcement) => {
                const ui = getAnnouncementUi(announcement.type, { iconSize: 'sm' })
                const hasTranslations = ANNOUNCEMENT_LOCALES.some((locale) => {
                  const titleKey = `title${locale.fieldSuffix}` as keyof EditAnnouncementData
                  const contentKey = `content${locale.fieldSuffix}` as keyof EditAnnouncementData
                  const titleValue = announcement[titleKey]
                  const contentValue = announcement[contentKey]
                  const hasTitle = typeof titleValue === 'string' && titleValue.trim().length > 0
                  const hasContent =
                    typeof contentValue === 'string' && contentValue.trim().length > 0
                  return hasTitle || hasContent
                })
                return (
                  <Card
                    key={announcement.id}
                    className='bg-bg-surface group border-[var(--border-subtle)] transition-colors duration-150 hover:border-[var(--accent-border)]'
                  >
                    <CardContent className='p-5'>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='min-w-0 flex-1 space-y-3'>
                          {/* Header */}
                          <div className='flex items-start gap-3'>
                            <div
                              className={cn(
                                'rounded-lg p-2.5',
                                ui.iconContainerClassName,
                                ui.iconClassName
                              )}
                            >
                              {ui.icon}
                            </div>
                            <div className='min-w-0 flex-1'>
                              <div className='mb-1.5 flex items-center gap-2'>
                                <h3 className='group-hover:text-accent-earth-text truncate text-lg font-medium transition-colors'>
                                  {announcement.title}
                                </h3>
                                {!announcement.isActive && (
                                  <Badge variant='secondary' className='text-xs'>
                                    {t('status.inactive')}
                                  </Badge>
                                )}
                                {hasTranslations && (
                                  <Badge variant='outline' className='text-xs'>
                                    {t('status.translated')}
                                  </Badge>
                                )}
                              </div>
                              <p className='text-text-secondary line-clamp-2 text-sm leading-relaxed'>
                                {announcement.content}
                              </p>
                            </div>
                          </div>

                          {/* Footer Info */}
                          <div className='text-text-secondary flex flex-wrap items-center gap-4 pl-14 text-xs'>
                            <span className='flex items-center gap-1.5'>
                              <Calendar className='h-3.5 w-3.5' />
                              {new Date(announcement.createdAt).toLocaleDateString()}
                            </span>
                            <Badge variant='outline' className='text-xs font-medium'>
                              {t('fields.priority-value', { priority: announcement.priority })}
                            </Badge>
                            {announcement.targetAudience && (
                              <span className='flex items-center gap-1.5'>
                                <Users className='h-3.5 w-3.5' />
                                {t('status.targeted')}
                              </span>
                            )}
                            <span>
                              {announcement.isDismissible
                                ? t('status.dismissible')
                                : t('status.not-dismissible')}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleToggleActive(announcement)}
                            className={cn(
                              'h-9 w-9 p-0 transition-all duration-200',
                              announcement.isActive
                                ? 'text-accent-earth-text hover:bg-[var(--accent-dim)]'
                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                            )}
                            aria-label={
                              announcement.isActive
                                ? t('actions.deactivate')
                                : t('actions.activate')
                            }
                          >
                            {announcement.isActive ? (
                              <Eye className='h-4 w-4' />
                            ) : (
                              <EyeOff className='h-4 w-4' />
                            )}
                          </Button>

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => openEditDialog(announcement)}
                            className='text-accent-earth-text h-9 w-9 p-0 transition-all duration-200 hover:bg-[var(--accent-dim)]'
                            aria-label={t('actions.edit-aria')}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='text-destructive hover:bg-destructive/10 h-9 w-9 p-0 transition-all duration-200'
                                aria-label={t('actions.delete-aria')}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('delete.description', { title: announcement.title })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{commonT('cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                >
                                  {commonT('delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {!announcements?.announcements?.length && (
                <div className='text-text-secondary py-8 text-center sm:py-12'>
                  <Megaphone className='mx-auto mb-4 h-8 w-8 opacity-50 sm:h-12 sm:w-12' />
                  <p className='px-4 text-sm sm:text-base'>{t('empty')}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{t('edit.title')}</DialogTitle>
            <DialogDescription>{t('edit.description')}</DialogDescription>
          </DialogHeader>
          {editingAnnouncement && (
            <form action={handleEditAnnouncement}>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='edit-title'>{t('fields.title')}</Label>
                  <Input
                    id='edit-title'
                    name='title'
                    defaultValue={editingAnnouncement.title}
                    required
                    ref={editTitleRef}
                  />
                </div>

                <div>
                  <Label htmlFor='edit-content'>{t('fields.content')}</Label>
                  <Textarea
                    id='edit-content'
                    name='content'
                    defaultValue={editingAnnouncement.content}
                    rows={4}
                    required
                    ref={editContentRef}
                  />
                </div>

                {ANNOUNCEMENT_LOCALES.map((locale) => {
                  const titleKey = `title${locale.fieldSuffix}` as keyof EditAnnouncementData
                  const contentKey = `content${locale.fieldSuffix}` as keyof EditAnnouncementData
                  return (
                    <div
                      key={locale.code}
                      className='space-y-3 rounded-lg border border-[var(--border-subtle)] p-3'
                    >
                      <div className='flex items-center justify-between'>
                        <Label className='text-sm font-medium'>{locale.label}</Label>
                        <Badge variant='outline' className='text-xs'>
                          {locale.code}
                        </Badge>
                      </div>
                      <div>
                        <Input
                          name={`title_${locale.code}`}
                          placeholder={t('fields.title-placeholder')}
                          defaultValue={(editingAnnouncement[titleKey] as string) ?? ''}
                          ref={(el: HTMLInputElement | null) => {
                            if (!editTranslationRefsRef.current) editTranslationRefsRef.current = {}
                            const existing = editTranslationRefsRef.current[locale.code] ?? {
                              title: null,
                              content: null
                            }
                            editTranslationRefsRef.current[locale.code] = { ...existing, title: el }
                          }}
                        />
                      </div>
                      <div>
                        <Textarea
                          name={`content_${locale.code}`}
                          placeholder={t('fields.content-placeholder')}
                          rows={2}
                          defaultValue={(editingAnnouncement[contentKey] as string) ?? ''}
                          ref={(el: HTMLTextAreaElement | null) => {
                            if (!editTranslationRefsRef.current) editTranslationRefsRef.current = {}
                            const existing = editTranslationRefsRef.current[locale.code] ?? {
                              title: null,
                              content: null
                            }
                            editTranslationRefsRef.current[locale.code] = {
                              ...existing,
                              content: el
                            }
                          }}
                        />
                      </div>
                    </div>
                  )
                })}

                <div>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() =>
                      handleTranslateAll(editTitleRef, editContentRef, editTranslationRefsRef)
                    }
                    disabled={translateMutation.isPending}
                  >
                    {translateMutation.isPending ? t('actions.translating') : t('actions.fill-pt')}
                  </Button>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='edit-type'>{t('fields.type')}</Label>
                    <Select name='type' defaultValue={editingAnnouncement.type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='info'>{t('types.info')}</SelectItem>
                        <SelectItem value='success'>{t('types.success')}</SelectItem>
                        <SelectItem value='warning'>{t('types.warning')}</SelectItem>
                        <SelectItem value='error'>{t('types.error')}</SelectItem>
                        <SelectItem value='maintenance'>{t('types.maintenance')}</SelectItem>
                        <SelectItem value='feature'>{t('types.feature')}</SelectItem>
                        <SelectItem value='update'>{t('types.update')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='edit-priority'>{t('fields.priority')}</Label>
                    <Input
                      id='edit-priority'
                      name='priority'
                      type='number'
                      min='0'
                      max='10'
                      defaultValue={editingAnnouncement.priority}
                    />
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit-isDismissible'
                      name='isDismissible'
                      defaultChecked={editingAnnouncement.isDismissible}
                      className='rounded'
                    />
                    <Label htmlFor='edit-isDismissible'>{t('fields.dismissible')}</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit-isActive'
                      name='isActive'
                      defaultChecked={editingAnnouncement.isActive}
                      className='rounded'
                    />
                    <Label htmlFor='edit-isActive'>{t('fields.active')}</Label>
                  </div>
                </div>
              </div>

              <DialogFooter className='mt-6'>
                <Button type='button' variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                  {commonT('cancel')}
                </Button>
                <Button type='submit'>{t('actions.update')}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
