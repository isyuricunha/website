<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import { getAnnouncementUi } from '#lib/announcement-ui.ts'
	import AnnouncementIcon from '#lib/components/announcement/announcement-icon.svelte'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type Announcement = RouterOutputs['announcements']['getAnnouncements']['announcements'][number]
	type Analytics = RouterOutputs['announcements']['getAnnouncementAnalytics']

	type EditData = {
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
		targetAudience?: unknown
	}

	const ANNOUNCEMENT_LOCALES = [
		{ code: 'pt', label: 'Português', fieldSuffix: 'Pt' },
		{ code: 'es', label: 'Español', fieldSuffix: 'Es' },
		{ code: 'fr', label: 'Français', fieldSuffix: 'Fr' },
		{ code: 'de', label: 'Deutsch', fieldSuffix: 'De' },
		{ code: 'ja', label: '日本語', fieldSuffix: 'Ja' },
		{ code: 'zh-CN', label: '中文（简体）', fieldSuffix: 'ZhCn' }
	] as const

	let status = $state<'pending' | 'success'>('pending')
	let announcements = $state<Announcement[] | null>(null)
	let analytics = $state<Analytics | null>(null)
	let isCreateDialogOpen = $state(false)
	let isEditDialogOpen = $state(false)
	let editingAnnouncement = $state<EditData | null>(null)
	let isTranslating = $state(false)


	function fetchAnnouncements() {
		trpc.announcements.getAnnouncements
			.query({ adminView: true })
			.then((data) => {
				announcements = (data as { announcements: Announcement[] }).announcements
				status = 'success'
			})
			.catch(() => (status = 'success'))
		trpc.announcements.getAnnouncementAnalytics
			.query({})
			.then((data) => (analytics = data as Analytics))
			.catch(() => {})
	}

	async function translateAll(form: HTMLFormElement) {
		const title = (form.elements.namedItem('title') as HTMLInputElement)?.value ?? ''
		const content = (form.elements.namedItem('content') as HTMLTextAreaElement)?.value ?? ''

		if (!title.trim() || !content.trim()) {
			toastError(labels['messages.title-content-required'])
			return
		}

		isTranslating = true
		const results = await Promise.allSettled(
			ANNOUNCEMENT_LOCALES.map(async (target) => {
				const result = await trpc.announcements.translateAnnouncement.mutate({
					title,
					content,
					fromLang: 'en',
					toLang: target.code
				})
				return { code: target.code, result }
			})
		)
		isTranslating = false

		let successCount = 0
		for (const settled of results) {
			if (settled.status !== 'fulfilled') continue
			const { code, result } = settled.value
			const titleInput = form.elements.namedItem(`title_${code}`) as HTMLInputElement | null
			const contentInput = form.elements.namedItem(`content_${code}`) as HTMLTextAreaElement | null
			if (titleInput) titleInput.value = result.titleTranslated
			if (contentInput) contentInput.value = result.contentTranslated
			successCount++
		}

		if (successCount > 0) {
			toastSuccess(formatMessage(labels['messages.all-languages-filled'], { count: successCount }, locale))
		} else {
			toastError(formatMessage(labels['messages.translate-failed'], { message: 'All translations failed' }, locale))
		}
	}

	async function translateAllFromEvent(event: Event) {
		const form = (event.currentTarget as HTMLButtonElement).form
		if (!form) return
		await translateAll(form)
	}

	function submitCreate(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const title = formData.get('title') as string
		const content = formData.get('content') as string
		const type = formData.get('type')
		const priority = Number.parseInt(formData.get('priority') as string) || 0
		const isDismissible = formData.get('isDismissible') === 'on'

		if (!title || !content) {
			toastError(labels['messages.title-content-required'])
			return
		}

		const localeField = (target: string, field: 'title' | 'content'): string | undefined => {
			const value = formData.get(`${field}_${target}`) as string | null
			return value?.trim() ? value : undefined
		}

		trpc.announcements.createAnnouncement
			.mutate({
				title,
				content,
				titlePt: localeField('pt', 'title'),
				contentPt: localeField('pt', 'content'),
				titleEs: localeField('es', 'title'),
				contentEs: localeField('es', 'content'),
				titleFr: localeField('fr', 'title'),
				contentFr: localeField('fr', 'content'),
				titleDe: localeField('de', 'title'),
				contentDe: localeField('de', 'content'),
				titleJa: localeField('ja', 'title'),
				contentJa: localeField('ja', 'content'),
				titleZhCn: localeField('zh-CN', 'title'),
				contentZhCn: localeField('zh-CN', 'content'),
				type: type as 'info' | 'success' | 'warning' | 'error' | 'maintenance' | 'feature' | 'update',
				priority,
				isDismissible
			})
			.then(() => {
				toastSuccess(labels['messages.created'])
				isCreateDialogOpen = false
				fetchAnnouncements()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.create-failed'], { message: error.message ?? '' }, locale))
			)
	}

	function submitEdit(event: SubmitEvent) {
		event.preventDefault()
		if (!editingAnnouncement) return

		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const title = formData.get('title') as string
		const content = formData.get('content') as string
		const type = formData.get('type')
		const priority = Number.parseInt(formData.get('priority') as string) || 0
		const isDismissible = formData.get('isDismissible') === 'on'
		const isActive = formData.get('isActive') === 'on'

		if (!title || !content) {
			toastError(labels['messages.title-content-required'])
			return
		}

		const localeField = (target: string, field: 'title' | 'content'): string | undefined => {
			const value = formData.get(`${field}_${target}`) as string | null
			return value?.trim() ? value : undefined
		}

		trpc.announcements.updateAnnouncement
			.mutate({
				id: editingAnnouncement.id,
				title,
				content,
				titlePt: localeField('pt', 'title'),
				contentPt: localeField('pt', 'content'),
				titleEs: localeField('es', 'title'),
				contentEs: localeField('es', 'content'),
				titleFr: localeField('fr', 'title'),
				contentFr: localeField('fr', 'content'),
				titleDe: localeField('de', 'title'),
				contentDe: localeField('de', 'content'),
				titleJa: localeField('ja', 'title'),
				contentJa: localeField('ja', 'content'),
				titleZhCn: localeField('zh-CN', 'title'),
				contentZhCn: localeField('zh-CN', 'content'),
				type: type as 'info' | 'success' | 'warning' | 'error' | 'maintenance' | 'feature' | 'update',
				priority,
				isDismissible,
				isActive
			})
			.then(() => {
				toastSuccess(labels['messages.updated'])
				isEditDialogOpen = false
				editingAnnouncement = null
				fetchAnnouncements()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.update-failed'], { message: error.message ?? '' }, locale))
			)
	}

	function toggleActive(announcement: Announcement) {
		trpc.announcements.updateAnnouncement
			.mutate({ id: announcement.id, isActive: !announcement.isActive })
			.then(() => fetchAnnouncements())
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.update-failed'], { message: error.message ?? '' }, locale))
			)
	}

	function deleteAnnouncement(id: string) {
		trpc.announcements.deleteAnnouncement
			.mutate({ id })
			.then(() => {
				toastSuccess(labels['messages.deleted'])
				fetchAnnouncements()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.delete-failed'], { message: error.message ?? '' }, locale))
			)
	}

	function openEditDialog(announcement: Announcement) {
		editingAnnouncement = {
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
		}
		isEditDialogOpen = true
	}

	function hasTranslations(announcement: Announcement) {
		return ANNOUNCEMENT_LOCALES.some((target) => {
			const titleValue = announcement[`title${target.fieldSuffix}` as keyof Announcement]
			const contentValue = announcement[`content${target.fieldSuffix}` as keyof Announcement]
			return (
				(typeof titleValue === 'string' && titleValue.trim().length > 0) ||
				(typeof contentValue === 'string' && contentValue.trim().length > 0)
			)
		})
	}

	$effect(() => {
		fetchAnnouncements()
	})
</script>

{#if status === 'pending'}
	<div class="p-6">{labels.loading}</div>
{:else}
	<div class="space-y-8 p-4 sm:p-6">
		<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div class="min-w-0 flex-1 space-y-1">
				<h1 class="text-text-primary flex items-center gap-3 text-3xl font-medium tracking-tight sm:text-4xl">
					<div class="text-accent-earth-text shrink-0 rounded-lg bg-[var(--accent-dim)] p-2.5">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-7 w-7 sm:h-8 sm:w-8">
							<path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
						</svg>
					</div>
					<span class="truncate">{labels.title}</span>
				</h1>
				<p class="text-text-secondary text-sm sm:text-base">{labels.description}</p>
			</div>

			<button
				type="button"
				class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex min-h-[44px] w-full items-center px-4 text-sm sm:w-auto sm:px-6 sm:text-base"
				onclick={() => (isCreateDialogOpen = !isCreateDialogOpen)}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4 shrink-0">
					<path d="M5 12h14" /><path d="M12 5v14" />
				</svg>
				<span class="truncate">{labels['actions.create']}</span>
			</button>
		</div>

		{#if isCreateDialogOpen}
			<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10" role="dialog" aria-modal="true">
				<div class="bg-bg-base mx-4 w-full max-w-2xl rounded-lg border border-[var(--border-subtle)] p-6">
					<h3 class="text-lg font-semibold">{labels['create.title']}</h3>
					<p class="text-muted-foreground text-sm">{labels['create.description']}</p>
					<form onsubmit={submitCreate}>
						<div class="space-y-4">
							<div>
								<label for="create-announcement-title" class="text-sm font-medium">{labels['fields.title']}</label>
								<input id="create-announcement-title" name="title" required placeholder={labels['fields.title-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="create-announcement-content" class="text-sm font-medium">{labels['fields.content']}</label>
								<textarea id="create-announcement-content" name="content" rows="4" required placeholder={labels['fields.content-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
							</div>

							{#each ANNOUNCEMENT_LOCALES as target (target.code)}
								<div class="space-y-3 rounded-lg border border-[var(--border-subtle)] p-3">
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium">{target.label}</span>
										<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-xs">{target.code}</span>
									</div>
									<input
										name="title_{target.code}"
										placeholder={labels['fields.title-placeholder']}
															class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
									/>
									<textarea
										name="content_{target.code}"
										rows="2"
										placeholder={labels['fields.content-placeholder']}
															class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
									></textarea>
								</div>
							{/each}

							<div>
								<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors disabled:opacity-50" onclick={translateAllFromEvent} disabled={isTranslating}>
									{isTranslating ? labels['actions.translating'] : labels['actions.translate-all']}
								</button>
							</div>

							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="create-announcement-type" class="text-sm font-medium">{labels['fields.type']}</label>
									<select id="create-announcement-type" name="type" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
										<option value="info">{labels['types.info']}</option>
										<option value="success">{labels['types.success']}</option>
										<option value="warning">{labels['types.warning']}</option>
										<option value="error">{labels['types.error']}</option>
										<option value="maintenance">{labels['types.maintenance']}</option>
										<option value="feature">{labels['types.feature']}</option>
										<option value="update">{labels['types.update']}</option>
									</select>
								</div>
								<div>
									<label for="create-announcement-priority" class="text-sm font-medium">{labels['fields.priority']}</label>
									<input id="create-announcement-priority" name="priority" type="number" min="0" max="10" value="0" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
								</div>
							</div>

							<div class="flex items-center space-x-2">
								<input type="checkbox" id="create-isDismissible" name="isDismissible" checked class="rounded" />
								<label for="create-isDismissible" class="text-sm font-medium">{labels['fields.dismissible']}</label>
							</div>
						</div>

						<div class="mt-6 flex justify-end gap-2">
							<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors" onclick={() => (isCreateDialogOpen = false)}>
								{labels['common.cancel']}
							</button>
							<button type="submit" class="bg-accent-earth text-text-inverse rounded-md px-4 py-2 text-sm font-medium transition-colors">
								{labels['actions.create']}
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}

		{#if analytics}
			<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-300">
					<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
						<span class="text-text-secondary text-sm font-medium">{labels['analytics.total-views.title']}</span>
						<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5"><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
						</div>
					</div>
					<div class="space-y-2 p-6">
						<div class="text-accent-earth-text text-3xl font-medium tracking-tight">{analytics.totalViews}</div>
						<p class="text-text-secondary text-xs leading-relaxed">{labels['analytics.total-views.description']}</p>
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-300">
					<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
						<span class="text-text-secondary text-sm font-medium">{labels['analytics.dismissal-rate.title']}</span>
						<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
						</div>
					</div>
					<div class="space-y-2 p-6">
						<div class="text-accent-earth-text text-3xl font-medium tracking-tight">{analytics.dismissalRate.toFixed(1)}%</div>
						<p class="text-text-secondary text-xs leading-relaxed">
							{formatMessage(labels['analytics.dismissal-rate.description'], { count: analytics.totalDismissals }, locale)}
						</p>
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-300">
					<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
						<span class="text-text-secondary text-sm font-medium">{labels['analytics.active.title']}</span>
						<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5"><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
						</div>
					</div>
					<div class="space-y-2 p-6">
						<div class="text-accent-earth-text text-3xl font-medium tracking-tight">
							{(announcements ?? []).filter((a) => a.isActive).length || 0}
						</div>
						<p class="text-text-secondary text-xs leading-relaxed">{labels['analytics.active.description']}</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
			<div class="p-4 sm:p-6">
				<div class="mb-1 flex items-center gap-2">
					<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4"><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
					</div>
					<h3 class="text-lg font-medium sm:text-xl">{labels['list.title']}</h3>
				</div>
				<p class="text-muted-foreground text-xs sm:text-sm">{labels['list.description']}</p>
			</div>
			<div class="p-4 sm:p-6">
				<div class="h-[400px] overflow-y-auto sm:h-[500px] lg:h-[600px]">
					<div class="space-y-4">
						{#each announcements ?? [] as announcement (announcement.id)}
							{@const ui = getAnnouncementUi(announcement.type, { iconSize: 'sm' })}
							{@const translated = hasTranslations(announcement)}
							<div class="group bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-colors duration-150 hover:border-[var(--accent-border)]">
								<div class="p-5">
									<div class="flex items-start justify-between gap-4">
										<div class="min-w-0 flex-1 space-y-3">
											<div class="flex items-start gap-3">
												<div class="rounded-lg p-2.5 {ui.iconContainerClassName} {ui.iconClassName}">
													<AnnouncementIcon iconId={ui.iconId} className="h-4 w-4" />
												</div>
												<div class="min-w-0 flex-1">
													<div class="mb-1.5 flex items-center gap-2">
														<h4 class="group-hover:text-accent-earth-text truncate text-lg font-medium transition-colors">
															{announcement.title}
														</h4>
														{#if !announcement.isActive}
															<span class="bg-bg-hover inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">{labels['status.inactive']}</span>
														{/if}
														{#if translated}
															<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2.5 py-0.5 text-xs font-medium">{labels['status.translated']}</span>
														{/if}
													</div>
													<p class="text-text-secondary line-clamp-2 text-sm leading-relaxed">{announcement.content}</p>
												</div>
											</div>

											<div class="text-text-secondary flex flex-wrap items-center gap-4 pl-14 text-xs">
												<span class="flex items-center gap-1.5">
													<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3.5 w-3.5"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
													{new Date(announcement.createdAt).toLocaleDateString()}
												</span>
												<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2.5 py-0.5 text-xs font-medium">
													{formatMessage(labels['fields.priority-value'], { priority: announcement.priority }, locale)}
												</span>
												{#if announcement.targetAudience}
													<span class="flex items-center gap-1.5">{labels['status.targeted']}</span>
												{/if}
												<span>
													{announcement.isDismissible ? labels['status.dismissible'] : labels['status.not-dismissible']}
												</span>
											</div>
										</div>

										<div class="flex items-center gap-2">
											<button
												type="button"
												class="inline-flex h-9 w-9 p-0 transition-all duration-200 {announcement.isActive ? 'text-accent-earth-text hover:bg-[var(--accent-dim)]' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'}"
												onclick={() => toggleActive(announcement)}
												aria-label={announcement.isActive ? labels['actions.deactivate'] : labels['actions.activate']}
											>
												{#if announcement.isActive}
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto h-4 w-4"><path d="M2.062 12.348a1 1 0 0 1 0-.678 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .678 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto h-4 w-4"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
												{/if}
											</button>

											<button
												type="button"
												class="text-accent-earth-text inline-flex h-9 w-9 p-0 transition-all duration-200 hover:bg-[var(--accent-dim)]"
												onclick={() => openEditDialog(announcement)}
												aria-label={labels['actions.edit-aria']}
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto h-4 w-4"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L2 18v3h3z" /></svg>
											</button>

											<button
												type="button"
												class="text-destructive hover:bg-destructive/10 inline-flex h-9 w-9 p-0 transition-all duration-200"
												onclick={() => deleteAnnouncement(announcement.id)}
												aria-label={labels['actions.delete-aria']}
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto h-4 w-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
											</button>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if isEditDialogOpen && editingAnnouncement}
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10" role="dialog" aria-modal="true">
		<div class="bg-bg-base mx-4 w-full max-w-2xl rounded-lg border border-[var(--border-subtle)] p-6">
			<h3 class="text-lg font-semibold">{labels['edit.title']}</h3>
			<p class="text-muted-foreground text-sm">{labels['edit.description']}</p>
			<form onsubmit={submitEdit}>
				<div class="space-y-4">
					<div>
						<label for="edit-announcement-title" class="text-sm font-medium">{labels['fields.title']}</label>
						<input id="edit-announcement-title" name="title" required value={editingAnnouncement.title} placeholder={labels['fields.title-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
					</div>
					<div>
						<label for="edit-announcement-content" class="text-sm font-medium">{labels['fields.content']}</label>
						<textarea id="edit-announcement-content" name="content" rows="4" required value={editingAnnouncement.content} placeholder={labels['fields.content-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
					</div>

					{#each ANNOUNCEMENT_LOCALES as target (target.code)}
						<div class="space-y-3 rounded-lg border border-[var(--border-subtle)] p-3">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">{target.label}</span>
								<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-xs">{target.code}</span>
							</div>
							<input
								name="title_{target.code}"
								value={editingAnnouncement[`title${target.fieldSuffix}` as keyof EditData] as string | undefined}
								placeholder={labels['fields.title-placeholder']}
											class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
							/>
							<textarea
								name="content_{target.code}"
								rows="2"
								value={editingAnnouncement[`content${target.fieldSuffix}` as keyof EditData] as string | undefined}
								placeholder={labels['fields.content-placeholder']}
											class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
							></textarea>
						</div>
					{/each}

					<div>
						<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors disabled:opacity-50" onclick={translateAllFromEvent} disabled={isTranslating}>
							{isTranslating ? labels['actions.translating'] : labels['actions.translate-all']}
						</button>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for="edit-announcement-type" class="text-sm font-medium">{labels['fields.type']}</label>
							<select id="edit-announcement-type" name="type" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
								{#each ['info', 'success', 'warning', 'error', 'maintenance', 'feature', 'update'] as type (type)}
									<option value={type} selected={editingAnnouncement.type === type}>{labels[`types.${type}`]}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="edit-announcement-priority" class="text-sm font-medium">{labels['fields.priority']}</label>
							<input id="edit-announcement-priority" name="priority" type="number" min="0" max="10" value={editingAnnouncement.priority} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
						</div>
					</div>

					<div class="flex items-center space-x-6">
						<div class="flex items-center space-x-2">
							<input type="checkbox" id="edit-isDismissible" name="isDismissible" checked={editingAnnouncement.isDismissible} class="rounded" />
							<label for="edit-isDismissible" class="text-sm font-medium">{labels['fields.dismissible']}</label>
						</div>
						<div class="flex items-center space-x-2">
							<input type="checkbox" id="edit-isActive" name="isActive" checked={editingAnnouncement.isActive} class="rounded" />
							<label for="edit-isActive" class="text-sm font-medium">{labels['fields.active']}</label>
						</div>
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-2">
					<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors" onclick={() => { isEditDialogOpen = false; editingAnnouncement = null }}>
						{labels['common.cancel']}
					</button>
					<button type="submit" class="bg-accent-earth text-text-inverse rounded-md px-4 py-2 text-sm font-medium transition-colors">
						{labels['actions.save']}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
