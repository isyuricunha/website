<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import { getNotificationPageStats } from '@isyuricunha/trpc-server/utils/admin/integrity'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type Notification = RouterOutputs['communication']['getAllNotifications']['notifications'][number]

	let status = $state<'pending' | 'success' | 'error'>('pending')
	let payload = $state<RouterOutputs['communication']['getAllNotifications'] | null>(null)
	let isCreateDialogOpen = $state(false)
	let isCreating = $state(false)
	let isMarking = $state(false)

	let notifications = $derived(payload?.notifications ?? [])
	let notificationStats = $derived(
		payload ? getNotificationPageStats(payload) : { total: 0, loaded: 0, unread: 0, readRate: 0, isPageScoped: true }
	)

	function fetchNotifications() {
		trpc.communication.getAllNotifications
			.query({ limit: 50, offset: 0, includeExpired: false })
			.then((result) => {
				payload = result as RouterOutputs['communication']['getAllNotifications']
				status = 'success'
			})
			.catch(() => (status = 'error'))
	}

	function submitCreate(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const title = formData.get('title') as string
		const content = formData.get('content') as string
		const type = formData.get('type')
		const userId = formData.get('userId') as string
		const expiresAtRaw = formData.get('expiresAt') as string
		const actionUrlRaw = formData.get('actionUrl') as string

		if (!title || !content) {
			toastError(labels['messages.title-content-required'])
			return
		}

		isCreating = true
		trpc.communication.createNotification
			.mutate({
				title,
				content,
				type: type as 'system' | 'security' | 'user_action' | 'content' | 'marketing' | 'reminder',
				userId: userId || undefined,
				expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : undefined,
				actionUrl: actionUrlRaw || undefined
			})
			.then(() => {
				toastSuccess(labels['messages.created'])
				isCreateDialogOpen = false
				fetchNotifications()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.create-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isCreating = false))
	}

	function markAsRead(notificationId: string) {
		isMarking = true
		trpc.communication.adminMarkNotificationRead
			.mutate({ notificationId })
			.then(() => fetchNotifications())
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.mark-read-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isMarking = false))
	}

	function severityIcon(severity: string | null) {
		return severity === 'success'
			? 'check'
			: severity === 'warning'
				? 'clock'
				: severity === 'error'
					? 'x'
					: 'bell'
	}

	function severityColor(severity: string | null) {
		return severity === 'error'
			? 'text-destructive'
			: severity === 'success' || severity === 'info' || severity === 'warning'
				? 'text-accent-earth-text'
				: 'text-text-secondary'
	}

	function typeColor(severity: string | null) {
		return severity === 'error'
			? 'border-destructive/30 bg-destructive/10 text-text-primary'
			: 'border-[var(--border-subtle)] bg-bg-surface text-text-primary'
	}

	$effect(() => {
		fetchNotifications()
	})
</script>

{#if status === 'pending'}
	<div class="p-6">{labels.loading}</div>
{:else if status === 'error' || !payload}
	<div class="text-destructive p-6">{labels.error}</div>
{:else}
	<div class="space-y-8">
		<div class="flex items-center justify-between">
			<div class="space-y-1">
				<h1 class="text-text-primary flex items-center gap-3 text-4xl font-medium tracking-tight">
					<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2.5">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-8 w-8">
							<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
						</svg>
					</div>
					{labels.title}
				</h1>
				<p class="text-text-secondary text-base">{labels.description}</p>
			</div>

			<button
				type="button"
				class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
				onclick={() => (isCreateDialogOpen = !isCreateDialogOpen)}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4">
					<path d="M5 12h14" /><path d="M12 5v14" />
				</svg>
				{labels['actions.create']}
			</button>
		</div>

		{#if isCreateDialogOpen}
			<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-16" role="dialog" aria-modal="true">
				<div class="bg-bg-base w-full max-w-2xl rounded-lg border border-[var(--border-subtle)] p-6">
					<h3 class="text-lg font-semibold">{labels['dialog.create-title']}</h3>
					<p class="text-muted-foreground text-sm">{labels['dialog.create-description']}</p>
					<form onsubmit={submitCreate} class="mt-4 space-y-4">
						<div>
							<label for="notification-title" class="text-sm font-medium">{labels['fields.title']}</label>
							<input id="notification-title" name="title" required placeholder={labels['fields.title-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
						</div>
						<div>
							<label for="notification-content" class="text-sm font-medium">{labels['fields.content']}</label>
							<textarea id="notification-content" name="content" rows="4" required placeholder={labels['fields.content-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
						</div>
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<label for="notification-type" class="text-sm font-medium">{labels['fields.type']}</label>
								<select id="notification-type" name="type" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
									<option value="system">{labels['types.system']}</option>
									<option value="security">{labels['types.security']}</option>
									<option value="user_action">{labels['types.user-action']}</option>
									<option value="content">{labels['types.content']}</option>
									<option value="marketing">{labels['types.marketing']}</option>
									<option value="reminder">{labels['types.reminder']}</option>
								</select>
							</div>
							<div>
								<label for="notification-user-id" class="text-sm font-medium">{labels['fields.user-id']}</label>
								<input id="notification-user-id" name="userId" placeholder={labels['fields.user-id-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
						</div>
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<label for="notification-expires" class="text-sm font-medium">{labels['fields.expires-at']}</label>
								<input id="notification-expires" name="expiresAt" type="datetime-local" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="notification-action-url" class="text-sm font-medium">{labels['fields.action-url']}</label>
								<input id="notification-action-url" name="actionUrl" type="url" placeholder="https://example.com" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
						</div>
						<div class="mt-6 flex justify-end gap-2">
							<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors" onclick={() => (isCreateDialogOpen = false)}>
								{labels['common.cancel']}
							</button>
							<button type="submit" class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={isCreating}>
								{labels['actions.send']}
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}

		<div class="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-300">
				<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
					<span class="text-text-secondary text-sm font-medium">{labels['stats.total.title']}</span>
					<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
							<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
						</svg>
					</div>
				</div>
				<div class="space-y-2 p-6">
					<div class="text-accent-earth-text text-3xl font-medium tracking-tight">{notificationStats.total}</div>
					<p class="text-text-secondary text-xs leading-relaxed">{labels['stats.total.description']}</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-300">
				<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
					<span class="text-text-secondary text-sm font-medium">{labels['stats.unread.title']}</span>
					<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
							<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
						</svg>
					</div>
				</div>
				<div class="space-y-2 p-6">
					<div class="text-accent-earth-text text-3xl font-medium tracking-tight">{notificationStats.unread}</div>
					<p class="text-text-secondary text-xs leading-relaxed">
						{formatMessage(labels['stats.unread.description'], { scope: labels['stats.current-page'] }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-300">
				<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
					<span class="text-text-secondary text-sm font-medium">{labels['stats.read-rate.title']}</span>
					<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
							<path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
						</svg>
					</div>
				</div>
				<div class="space-y-2 p-6">
					<div class="text-accent-earth-text text-3xl font-medium tracking-tight">{notificationStats.readRate}%</div>
					<p class="text-text-secondary text-xs leading-relaxed">
						{formatMessage(labels['stats.read-rate.description'], { scope: labels['stats.current-page'] }, locale)}
					</p>
				</div>
			</div>
		</div>

		<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
			<div class="p-6 pb-0">
				<div class="mb-1 flex items-center gap-2">
					<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
							<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
						</svg>
					</div>
					<h3 class="text-base font-medium">{labels['recent.title']}</h3>
				</div>
				<p class="text-muted-foreground text-xs">{labels['recent.description']}</p>
			</div>
			<div class="p-6">
				<div class="h-[600px] overflow-y-auto pr-4">
					<div class="space-y-4">
						{#each notifications as notification (notification.id)}
							<div class="rounded-lg border {typeColor(notification.severity)} {notification.read ? '' : 'ring-2 ring-[var(--accent-border)]'} transition-all duration-200 hover:shadow-feature-card">
								<div class="p-4">
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<div class="mb-2 flex items-center gap-2">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4 {severityColor(notification.severity)}">
													{#if severityIcon(notification.severity) === 'check'}
														<polyline points="20 6 9 17 4 12" />
													{:else if severityIcon(notification.severity) === 'clock'}
														<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
													{:else if severityIcon(notification.severity) === 'x'}
														<path d="M18 6 6 18" /><path d="m6 6 12 12" />
													{:else}
														<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
													{/if}
												</svg>
												<h3 class="font-medium">{notification.title}</h3>
												<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-xs font-medium">{notification.type}</span>
												{#if !notification.read}
													<span class="text-accent-earth-text inline-flex items-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-xs font-medium">
														{labels['status.unread']}
													</span>
												{/if}
											</div>

											<p class="mb-3 text-sm">{notification.message}</p>

											<div class="text-text-secondary flex items-center gap-4 text-xs">
												<span class="flex items-center gap-1">
													<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
														<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
													</svg>
													{new Date(notification.createdAt).toLocaleDateString()}
												</span>
												<span class="flex items-center gap-1">
													<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
														<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
													</svg>
													{formatMessage(labels['recent.user'], { userId: notification.userId ?? '' }, locale)}
												</span>
												{#if notification.expiresAt}
													<span>
														{formatMessage(labels['recent.expires'], { date: new Date(notification.expiresAt).toLocaleDateString() }, locale)}
													</span>
												{/if}
											</div>
										</div>

										<div class="ml-4 flex items-center gap-2">
											{#if !notification.read}
												<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors disabled:opacity-50" disabled={isMarking} onclick={() => markAsRead(notification.id)}>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-1 h-4 w-4">
														<polyline points="20 6 9 17 4 12" />
													</svg>
													{labels['actions.mark-read']}
												</button>
											{/if}
										</div>
									</div>
								</div>
							</div>
						{/each}

						{#if notifications.length === 0}
							<div class="text-text-secondary py-8 text-center">
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto mb-4 h-12 w-12 opacity-50">
									<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
								</svg>
								<p>{labels.empty}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
