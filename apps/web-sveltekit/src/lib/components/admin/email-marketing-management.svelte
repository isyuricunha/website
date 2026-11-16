<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'
	import ConfirmationDialog from './confirmation-dialog.svelte'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type Audiences = RouterOutputs['resendEmail']['getAudiences']
	type Broadcasts = RouterOutputs['resendEmail']['getBroadcasts']
	type Templates = RouterOutputs['emailManagement']['getEmailTemplates']
	type Analytics = RouterOutputs['resendEmail']['getAnalytics']

	type SelectedBroadcast = {
		id: string
		name?: string
		subject?: string
		html?: string
		text?: string
		from?: string
		status?: string
		audienceId?: string
	}

	let selectedTab = $state('overview')
	let isCreateTemplateDialogOpen = $state(false)
	let isCreateCampaignDialogOpen = $state(false)
	let isCreateAudienceDialogOpen = $state(false)
	let isEditBroadcastDialogOpen = $state(false)
	let isViewBroadcastDialogOpen = $state(false)
	let selectedBroadcast = $state<SelectedBroadcast | null>(null)
	let broadcastFilter = $state('all')
	let confirmDialog = $state<{ open: boolean; title: string; description: string; variant?: 'default' | 'destructive'; action: () => void }>({
		open: false,
		title: '',
		description: '',
		action: () => {}
	})

	// Sequential loading: the original gates each Resend query behind the
	// previous stage to avoid hammering the API on page load.
	let loadingStage = $state<'audiences' | 'broadcasts' | 'templates' | 'analytics' | 'complete'>('audiences')
	let audiences = $state<Audiences | null>(null)
	let broadcasts = $state<Broadcasts | null>(null)
	let templates = $state<Templates | null>(null)
	let analytics = $state<Analytics | null>(null)
	let audiencesLoading = $state(true)
	let broadcastsLoading = $state(true)
	let templatesLoading = $state(true)
	let selectedBroadcastData = $state<RouterOutputs['resendEmail']['getBroadcast'] | null>(null)

	let isCreatingTemplate = $state(false)
	let isCreatingAudience = $state(false)
	let isCreatingBroadcast = $state(false)
	let isSyncing = $state(false)
	let isSending = $state(false)
	let isUpdating = $state(false)
	let isDeleting = $state(false)

	function fetchAudiences() {
		trpc.resendEmail.getAudiences
			.query()
			.then((data) => {
				audiences = data as Audiences
				audiencesLoading = false
			})
			.catch(() => (audiencesLoading = false))
	}

	function fetchBroadcasts() {
		trpc.resendEmail.getBroadcasts
			.query()
			.then((data) => {
				broadcasts = data as Broadcasts
				broadcastsLoading = false
			})
			.catch(() => (broadcastsLoading = false))
	}

	function fetchTemplates() {
		trpc.emailManagement.getEmailTemplates
			.query({})
			.then((data) => {
				templates = data as Templates
				templatesLoading = false
			})
			.catch(() => (templatesLoading = false))
	}

	function fetchAnalytics() {
		trpc.resendEmail.getAnalytics
			.query()
			.then((data) => {
				analytics = data as Analytics
			})
			.catch(() => {})
	}

	$effect(() => {
		fetchAudiences()
	})

	// Advance the loading chain one stage at a time when the current stage has data.
	$effect(() => {
		if (loadingStage === 'audiences' && !audiencesLoading && audiences !== null) {
			const timer = setTimeout(() => {
				loadingStage = 'broadcasts'
				fetchBroadcasts()
			}, 1000)
			return () => clearTimeout(timer)
		}
		if (loadingStage === 'broadcasts' && !broadcastsLoading && broadcasts !== null) {
			const timer = setTimeout(() => {
				loadingStage = 'templates'
				fetchTemplates()
			}, 1000)
			return () => clearTimeout(timer)
		}
		if (loadingStage === 'templates' && !templatesLoading && templates !== null) {
			const timer = setTimeout(() => {
				loadingStage = 'analytics'
				fetchAnalytics()
			}, 1000)
			return () => clearTimeout(timer)
		}
		if (loadingStage === 'analytics' && analytics !== null) {
			const timer = setTimeout(() => (loadingStage = 'complete'), 0)
			return () => clearTimeout(timer)
		}
	})

	$effect(() => {
		if (selectedBroadcast?.id) {
			trpc.resendEmail.getBroadcast
				.query({ broadcastId: selectedBroadcast.id })
				.then((data) => (selectedBroadcastData = data as RouterOutputs['resendEmail']['getBroadcast']))
				.catch(() => {})
		}
	})

	function createTemplate(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const name = formData.get('name') as string
		const subject = formData.get('subject') as string
		const html = formData.get('html') as string

		isCreatingTemplate = true
		trpc.emailManagement.createEmailTemplate
			.mutate({ name, subject, content: html, type: 'notification' as const, variables: [] })
			.then(() => {
				toastSuccess(labels['messages.template-created'])
				isCreateTemplateDialogOpen = false
				fetchTemplates()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.template-create-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isCreatingTemplate = false))
	}

	function createAudience(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const name = formData.get('name') as string

		isCreatingAudience = true
		trpc.resendEmail.createAudience
			.mutate({ name })
			.then(() => {
				toastSuccess(labels['messages.audience-created'])
				isCreateAudienceDialogOpen = false
				fetchAudiences()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.audience-create-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isCreatingAudience = false))
	}

	function createBroadcast(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const audienceId = formData.get('audienceId') as string
		const name = formData.get('name') as string
		const subject = formData.get('subject') as string
		const html = formData.get('html') as string
		const text = formData.get('text') as string
		const from = formData.get('from') as string

		isCreatingBroadcast = true
		trpc.resendEmail.createBroadcast
			.mutate({ audienceId, name, subject, html, text: text || undefined, from })
			.then(() => {
				toastSuccess(labels['messages.broadcast-created'])
				isCreateCampaignDialogOpen = false
				fetchBroadcasts()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.broadcast-create-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isCreatingBroadcast = false))
	}

	function syncUsers(audienceId: string) {
		isSyncing = true
		trpc.resendEmail.syncUsersToAudience
			.mutate({ audienceId })
			.then((data) => {
				toastSuccess(formatMessage(labels['messages.users-synced'], { count: (data as { synced: number }).synced }, locale))
				fetchAudiences()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.sync-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isSyncing = false))
	}

	function sendBroadcast(broadcastId: string) {
		isSending = true
		trpc.resendEmail.sendBroadcast
			.mutate({ broadcastId })
			.then(() => {
				toastSuccess(labels['messages.broadcast-sent'])
				fetchBroadcasts()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.broadcast-send-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isSending = false))
	}

	function updateBroadcast(event: SubmitEvent) {
		event.preventDefault()
		if (!selectedBroadcast?.id) return
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const subject = formData.get('subject') as string
		const html = formData.get('html') as string

		isUpdating = true
		trpc.resendEmail.updateBroadcast
			.mutate({ broadcastId: selectedBroadcast.id, subject, html })
			.then(() => {
				toastSuccess(labels['messages.broadcast-updated'])
				isEditBroadcastDialogOpen = false
				fetchBroadcasts()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.broadcast-update-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isUpdating = false))
	}

	function deleteBroadcast(broadcastId: string) {
		confirmDialog = {
			open: true,
			title: labels['confirm.delete-broadcast-title'],
			description: labels['confirm.delete-broadcast'],
			variant: 'destructive',
			action: () => {
				confirmDialog = { ...confirmDialog, open: false }
				isDeleting = true
				trpc.resendEmail.deleteBroadcast
					.mutate({ broadcastId })
					.then(() => {
						toastSuccess(labels['messages.broadcast-deleted'])
						fetchBroadcasts()
					})
					.catch((error: { message?: string }) =>
						toastError(formatMessage(labels['messages.broadcast-delete-failed'], { message: error.message ?? '' }, locale))
					)
					.finally(() => (isDeleting = false))
			}
		}
	}

	function duplicateBroadcast(broadcast: SelectedBroadcast) {
		selectedBroadcast = { ...broadcast, name: `${broadcast.name} (Copy)` }
		isCreateCampaignDialogOpen = true
	}

	function broadcastStatusColor(status: string | undefined) {
		switch (status ?? 'draft') {
			case 'sent':
				return 'border border-[var(--status-success-border)] bg-status-success-soft text-status-success'
			case 'scheduled':
				return 'border border-[var(--status-info-border)] bg-status-info-soft text-status-info'
			default:
				return 'border border-[var(--border-subtle)] bg-bg-surface text-text-secondary'
		}
	}

	function formatBroadcastSentDate(sentAt: string | null | undefined) {
		return sentAt ? new Date(sentAt).toLocaleDateString() : labels['date.not-sent']
	}

	function stageDone(stage: string) {
		return (
			(stage === 'audiences' && audiences !== null) ||
			(stage === 'broadcasts' && broadcasts !== null) ||
			(stage === 'templates' && templates !== null) ||
			(stage === 'analytics' && analytics !== null)
		)
	}

	function stageActive(stage: string) {
		return loadingStage === stage
	}

	let filteredBroadcasts = $derived(
		(broadcasts?.broadcasts ?? []).filter((broadcast) => broadcastFilter === 'all' || broadcast.status === broadcastFilter)
	)
	let hasBroadcasts = $derived(Boolean(broadcasts?.broadcasts?.length))
	let showFilteredEmpty = $derived(filteredBroadcasts.length === 0 && hasBroadcasts)
	let showEmptyState = $derived(!hasBroadcasts)
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<h1 class="text-text-primary flex items-center gap-3 text-4xl font-medium tracking-tight">
				<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2.5">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-8 w-8"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
				</div>
				{labels.title}
			</h1>
			<p class="text-text-secondary text-base">{labels.description}</p>
		</div>
	</div>

	{#if loadingStage !== 'complete'}
		<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
			<div class="p-6 pb-0">
				<h3 class="flex items-center gap-2 text-base font-medium">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-status-agent h-5 w-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
					{labels['loading.title']}
				</h3>
			</div>
			<div class="space-y-3 p-6">
				{#each ['audiences', 'broadcasts', 'templates', 'analytics'] as stage (stage)}
					<div class="flex items-center gap-3">
						{#if stageDone(stage)}
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-status-success h-5 w-5"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11.5 14.5 15.5 10" /></svg>
						{:else if stageActive(stage)}
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-status-agent h-5 w-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-5 w-5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
						{/if}
						<span class={stageActive(stage) ? 'font-medium' : ''}>{labels[`loading.${stage}`]}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="bg-bg-hover grid w-full grid-cols-2 rounded-md p-1 sm:grid-cols-4">
		{#each ['overview', 'audiences', 'broadcasts', 'templates'] as tab (tab)}
			<button type="button" class="rounded-md px-2 py-1.5 text-sm transition-colors {selectedTab === tab ? 'bg-bg-base text-text-primary shadow' : 'text-text-secondary hover:text-text-primary'}" onclick={() => (selectedTab = tab)}>
				{labels[`tabs.${tab}`]}
			</button>
		{/each}
	</div>

	{#if selectedTab === 'overview'}
		<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-300">
				<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
					<span class="text-text-secondary text-sm font-medium">{labels['stats.total-audiences.title']}</span>
					<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
				</div>
				<div class="space-y-2 p-6">
					<div class="text-3xl font-medium tracking-tight">{analytics?.totalAudiences || 0}</div>
					<p class="text-text-secondary text-xs leading-relaxed">{labels['stats.total-audiences.description']}</p>
				</div>
			</div>
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-300">
				<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
					<span class="text-text-secondary text-sm font-medium">{labels['stats.total-broadcasts.title']}</span>
					<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg></div>
				</div>
				<div class="space-y-2 p-6">
					<div class="text-3xl font-medium tracking-tight">{analytics?.totalBroadcasts || 0}</div>
					<p class="text-text-secondary text-xs leading-relaxed">{labels['stats.total-broadcasts.description']}</p>
				</div>
			</div>
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-300">
				<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
					<span class="text-text-secondary text-sm font-medium">{labels['stats.subscribers.title']}</span>
					<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg></div>
				</div>
				<div class="space-y-2 p-6">
					<div class="text-3xl font-medium tracking-tight">{analytics?.totalSubscribers || 0}</div>
					<p class="text-text-secondary text-xs leading-relaxed">
						{formatMessage(labels['stats.subscribers.description'], { rate: analytics?.subscriptionRate || 0 }, locale)}
					</p>
				</div>
			</div>
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-300">
				<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
					<span class="text-text-secondary text-sm font-medium">{labels['stats.sent-broadcasts.title']}</span>
					<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg></div>
				</div>
				<div class="space-y-2 p-6">
					<div class="text-3xl font-medium tracking-tight">{analytics?.broadcasts?.sent || 0}</div>
					<p class="text-text-secondary text-xs leading-relaxed">{labels['stats.sent-broadcasts.description']}</p>
				</div>
			</div>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="p-6 pb-0">
					<div class="mb-1 flex items-center gap-2">
						<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
						<h3 class="text-base font-medium">{labels['overview.recent-activity']}</h3>
					</div>
				</div>
				<div class="space-y-4 p-6">
					{#if broadcasts?.broadcasts?.length}
						{#each broadcasts.broadcasts.slice(0, 5) as broadcast (broadcast.id)}
							<div class="flex items-center space-x-4">
								<div class="flex-shrink-0">
									<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {broadcastStatusColor(broadcast.status)}">{broadcast.status}</span>
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium">{broadcast.name}</p>
									<p class="text-text-secondary text-sm">{formatBroadcastSentDate(broadcast.sent_at)}</p>
								</div>
							</div>
						{/each}
					{:else}
						<p class="text-text-secondary text-sm">{labels['overview.no-activity']}</p>
					{/if}
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="p-6 pb-0">
					<div class="mb-1 flex items-center gap-2">
						<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg></div>
						<h3 class="text-base font-medium">{labels['overview.quick-actions']}</h3>
					</div>
				</div>
				<div class="space-y-3 p-6">
					<button type="button" class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover w-full rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" onclick={() => (isCreateCampaignDialogOpen = true)} disabled={!audiences?.audiences?.length}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 inline h-4 w-4"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
						{labels['actions.create-new-broadcast']}
					</button>
					<button type="button" class="hover:bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm font-medium transition-colors" onclick={() => (isCreateAudienceDialogOpen = true)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 inline h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
						{labels['actions.create-new-audience']}
					</button>
					<button type="button" class="hover:bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm font-medium transition-colors" onclick={() => (isCreateTemplateDialogOpen = true)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 inline h-4 w-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
						{labels['actions.create-new-template']}
					</button>
				</div>
			</div>
		</div>
	{:else if selectedTab === 'audiences'}
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-medium">{labels['audiences.title']}</h2>
				<button type="button" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors" onclick={() => (isCreateAudienceDialogOpen = true)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
					{labels['actions.create-audience']}
				</button>
			</div>

			<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
				{#if audiences?.audiences?.length}
					{#each audiences.audiences as audience (audience.id)}
						<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-200">
							<div class="p-6 pb-0">
								<div class="flex items-center justify-between text-base">
									<span class="font-medium">{audience.name}</span>
									<span class="bg-bg-hover inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
										{formatMessage(labels['audiences.subscriber-count'], { count: 0 }, locale)}
									</span>
								</div>
							</div>
							<div class="space-y-2 p-6">
								<p class="text-text-secondary text-sm">{formatMessage(labels['date.created'], { date: '—' }, locale)}</p>
								<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors disabled:opacity-50" onclick={() => syncUsers(audience.id)} disabled={isSyncing}>
									{#if isSyncing}
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 inline h-4 w-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
										{labels['actions.syncing']}
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 inline h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
										{labels['actions.sync-users']}
									{/if}
								</button>
							</div>
						</div>
					{/each}
				{:else}
					<div class="text-text-secondary col-span-full py-8 text-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto mb-4 h-12 w-12 opacity-50"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
						<p>{labels['audiences.empty']}</p>
					</div>
				{/if}
			</div>
		</div>
	{:else if selectedTab === 'broadcasts'}
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-medium">{labels['broadcasts.title']}</h2>
				<div class="flex items-center gap-4">
					<select bind:value={broadcastFilter} aria-label={labels['broadcasts.filter-placeholder']} class="bg-bg-hover w-[180px] rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
						<option value="all">{labels['broadcasts.status.all']}</option>
						<option value="draft">{labels['broadcasts.status.draft']}</option>
						<option value="sent">{labels['broadcasts.status.sent']}</option>
						<option value="scheduled">{labels['broadcasts.status.scheduled']}</option>
						<option value="sending">{labels['broadcasts.status.sending']}</option>
					</select>
					<button type="button" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" onclick={() => (isCreateCampaignDialogOpen = true)} disabled={!audiences?.audiences?.length}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
						{labels['actions.create-broadcast']}
					</button>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="h-[500px] overflow-y-auto p-4">
					<div class="space-y-4">
						{#each filteredBroadcasts as broadcast (broadcast.id)}
							<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] transition-all duration-200 hover:shadow-feature-card">
								<div class="p-4">
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<div class="mb-2 flex items-center gap-2">
												<h3 class="font-medium">{broadcast.name}</h3>
												<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {broadcastStatusColor(broadcast.status)}">{broadcast.status}</span>
											</div>
											<div class="text-text-secondary flex items-center gap-4 text-sm">
												<span class="flex items-center gap-1">
													<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
													{formatBroadcastSentDate(broadcast.sent_at)}
												</span>
												<span class="flex items-center gap-1">{labels['fields.audience']}</span>
												{#if broadcast.status === 'sent'}
													<span class="flex items-center gap-1">{labels['broadcasts.status.sent']}</span>
												{/if}
											</div>
										</div>

										<div class="ml-4 flex items-center gap-2">
											<button type="button" aria-label="View broadcast" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-2 py-1.5 text-sm transition-colors" onclick={() => { selectedBroadcast = broadcast; isViewBroadcastDialogOpen = true }}>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4"><path d="M2.062 12.348a1 1 0 0 1 0-.678 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .678 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
											</button>
											{#if broadcast.status === 'draft'}
												<button type="button" aria-label="Edit broadcast" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-2 py-1.5 text-sm transition-colors" onclick={() => { selectedBroadcast = broadcast; isEditBroadcastDialogOpen = true }}>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4"><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" /></svg>
												</button>
												<button type="button" aria-label="Send broadcast" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-2 py-1.5 text-sm transition-colors disabled:opacity-50" onclick={() => sendBroadcast(broadcast.id)} disabled={isSending}>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
												</button>
											{/if}
											<button type="button" aria-label="Duplicate broadcast" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-2 py-1.5 text-sm transition-colors" onclick={() => duplicateBroadcast(broadcast)}>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
											</button>
											<button type="button" aria-label="Delete broadcast" class="text-destructive hover:bg-destructive/10 inline-flex items-center rounded-md border border-[var(--border-faint)] px-2 py-1.5 text-sm transition-colors disabled:opacity-50" onclick={() => deleteBroadcast(broadcast.id)} disabled={isDeleting}>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
											</button>
										</div>
									</div>
								</div>
							</div>
						{/each}

						{#if showFilteredEmpty}
							<div class="text-text-secondary py-8 text-center">
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto mb-4 h-12 w-12 opacity-50"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
								<p>{labels['broadcasts.empty-filtered']}</p>
								<button type="button" class="hover:bg-bg-hover mt-2 rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors" onclick={() => (broadcastFilter = 'all')}>
									{labels['actions.show-all-broadcasts']}
								</button>
							</div>
						{/if}

						{#if showEmptyState}
							<div class="text-text-secondary py-8 text-center">
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto mb-4 h-12 w-12 opacity-50"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
								<p>{labels['broadcasts.empty']}</p>
								<p class="mt-2 text-sm">{labels['broadcasts.empty-hint']}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{:else if selectedTab === 'templates'}
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-medium">{labels['templates.title']}</h2>
				<button type="button" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors" onclick={() => (isCreateTemplateDialogOpen = true)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
					{labels['actions.create-template']}
				</button>
			</div>

			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#if templates?.templates?.length}
					{#each templates.templates as template (template.id)}
						<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
							<div class="p-6 pb-0">
								<h3 class="font-medium">{template.name}</h3>
								<p class="text-muted-foreground text-sm">{template.subject}</p>
							</div>
							<div class="space-y-2 p-6">
								<p class="text-text-secondary text-sm">
									{formatMessage(labels['date.created'], { date: new Date(template.createdAt).toLocaleDateString() }, locale)}
								</p>
								<div class="flex gap-2">
									<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-1 h-4 w-4"><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" /></svg>
										{labels['actions.edit']}
									</button>
									<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-1 h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
										{labels['actions.use']}
									</button>
								</div>
							</div>
						</div>
					{/each}
				{:else}
					<div class="text-text-secondary col-span-full py-8 text-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto mb-4 h-12 w-12 opacity-50"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
						<p>{labels['templates.empty']}</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if isCreateAudienceDialogOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
		<div class="bg-bg-base w-full max-w-md rounded-lg border border-[var(--border-subtle)] p-6">
			<h3 class="text-lg font-semibold">{labels['audiences.create-title']}</h3>
			<p class="text-muted-foreground text-sm">{labels['audiences.create-description']}</p>
			<form onsubmit={createAudience} class="mt-4">
				<div class="space-y-4">
					<div>
						<label for="audience-name" class="text-sm font-medium">{labels['fields.audience-name']}</label>
						<input id="audience-name" name="name" required placeholder={labels['fields.audience-name-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
					</div>
				</div>
				<div class="mt-6 flex justify-end gap-2">
					<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors" onclick={() => (isCreateAudienceDialogOpen = false)}>
						{labels['common.cancel']}
					</button>
					<button type="submit" class="bg-accent-earth text-text-inverse rounded-md px-4 py-2 text-sm font-medium transition-colors" disabled={isCreatingAudience}>
						{labels['actions.create-audience']}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if isCreateCampaignDialogOpen}
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10" role="dialog" aria-modal="true">
		<div class="bg-bg-base w-full max-w-2xl rounded-lg border border-[var(--border-subtle)] p-6">
			<h3 class="text-lg font-semibold">{labels['broadcasts.create-title']}</h3>
			<p class="text-muted-foreground text-sm">{labels['broadcasts.create-description']}</p>
			<form onsubmit={createBroadcast} class="mt-4">
				<div class="space-y-4">
					<div>
						<label for="broadcast-name" class="text-sm font-medium">{labels['fields.broadcast-name']}</label>
						<input id="broadcast-name" name="name" required value={selectedBroadcast?.name ?? ''} placeholder={labels['fields.broadcast-name-placeholder']} class="bg-bg-hover mt-1 h-11 min-h-[44px] w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm sm:text-base" />
					</div>
					<div>
						<label for="broadcast-audience" class="text-sm font-medium">{labels['fields.target-audience']}</label>
						<select id="broadcast-audience" name="audienceId" required class="bg-bg-hover mt-1 h-11 min-h-[44px] w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm sm:text-base">
							<option value="" disabled selected={!selectedBroadcast?.audienceId}>{labels['fields.select-audience']}</option>
							{#each audiences?.audiences ?? [] as audience (audience.id)}
								<option value={audience.id} selected={selectedBroadcast?.audienceId === audience.id}>
									{formatMessage(labels['audiences.option-subscriber-count'], { name: audience.name, count: 0 }, locale)}
								</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="broadcast-from" class="text-sm font-medium">{labels['fields.from-email']}</label>
						<input id="broadcast-from" name="from" type="email" required value={selectedBroadcast?.from ?? ''} placeholder="noreply@yourdomain.com" class="bg-bg-hover mt-1 h-11 min-h-[44px] w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm sm:text-base" />
					</div>
					<div>
						<label for="broadcast-subject" class="text-sm font-medium">{labels['fields.subject-line']}</label>
						<input id="broadcast-subject" name="subject" required value={selectedBroadcast?.subject ?? ''} placeholder={labels['fields.email-subject-placeholder']} class="bg-bg-hover mt-1 h-11 min-h-[44px] w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm sm:text-base" />
					</div>
					<div>
						<label for="broadcast-html" class="text-sm font-medium">{labels['fields.email-content-html']}</label>
						<textarea id="broadcast-html" name="html" value={selectedBroadcast?.html ?? ''} placeholder={labels['fields.email-html-placeholder']} rows="8" class="bg-bg-hover mt-1 min-h-[120px] w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm sm:text-base"></textarea>
					</div>
					<div>
						<label for="broadcast-text" class="text-sm font-medium">{labels['fields.plain-text-optional']}</label>
						<textarea id="broadcast-text" name="text" value={selectedBroadcast?.text ?? ''} placeholder={labels['fields.plain-text-placeholder']} rows="4" class="bg-bg-hover mt-1 min-h-[80px] w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm sm:text-base"></textarea>
					</div>
				</div>
				<div class="mt-6 flex justify-end gap-2">
					<button type="button" class="hover:bg-bg-hover min-h-[44px] rounded-md border border-[var(--border-faint)] px-4 text-sm transition-colors sm:text-base" onclick={() => (isCreateCampaignDialogOpen = false)}>
						{labels['common.cancel']}
					</button>
					<button type="submit" class="bg-accent-earth text-text-inverse min-h-[44px] rounded-md px-4 text-sm font-medium transition-colors sm:text-base" disabled={isCreatingBroadcast}>
						{labels['actions.create-broadcast']}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if isCreateTemplateDialogOpen}
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10" role="dialog" aria-modal="true">
		<div class="bg-bg-base w-full max-w-2xl rounded-lg border border-[var(--border-subtle)] p-6">
			<h3 class="text-lg font-semibold">{labels['templates.create-title']}</h3>
			<p class="text-muted-foreground text-sm">{labels['templates.create-description']}</p>
			<form onsubmit={createTemplate} class="mt-4">
				<div class="space-y-4">
					<div>
						<label for="template-name" class="text-sm font-medium">{labels['fields.template-name']}</label>
						<input id="template-name" name="name" required placeholder={labels['fields.template-name-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
					</div>
					<div>
						<label for="template-subject" class="text-sm font-medium">{labels['fields.subject-line']}</label>
						<input id="template-subject" name="subject" required placeholder={labels['fields.email-subject-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
					</div>
					<div>
						<label for="template-html" class="text-sm font-medium">{labels['fields.email-content-html']}</label>
						<textarea id="template-html" name="html" placeholder={labels['fields.email-html-placeholder']} rows="8" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
					</div>
					<div>
						<label for="template-text" class="text-sm font-medium">{labels['fields.plain-text-optional']}</label>
						<textarea id="template-text" name="text" placeholder={labels['fields.plain-text-placeholder']} rows="4" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
					</div>
				</div>
				<div class="mt-6 flex justify-end gap-2">
					<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors" onclick={() => (isCreateTemplateDialogOpen = false)}>
						{labels['common.cancel']}
					</button>
					<button type="submit" class="bg-accent-earth text-text-inverse rounded-md px-4 py-2 text-sm font-medium transition-colors" disabled={isCreatingTemplate}>
						{labels['actions.create-template']}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if isViewBroadcastDialogOpen}
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10" role="dialog" aria-modal="true">
		<div class="bg-bg-base w-full max-w-3xl rounded-lg border border-[var(--border-subtle)] p-6">
			<h3 class="text-lg font-semibold">{labels['broadcast-details.title']}</h3>
			<p class="text-muted-foreground text-sm">{labels['broadcast-details.description']}</p>

			{#if selectedBroadcastData}
				<div class="mt-4 space-y-4">
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<span class="text-sm font-medium">{labels['fields.name']}</span>
							<p class="text-sm">{selectedBroadcastData.broadcast?.name || labels['fields.not-available']}</p>
						</div>
						<div>
							<span class="text-sm font-medium">{labels['fields.status']}</span>
							<p>
								<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {broadcastStatusColor(selectedBroadcastData.broadcast?.status ?? 'draft')}">
									{selectedBroadcastData.broadcast?.status ?? 'draft'}
								</span>
							</p>
						</div>
						<div>
							<span class="text-sm font-medium">{labels['fields.subject']}</span>
							<p class="text-sm">{selectedBroadcastData.broadcast?.subject || labels['fields.not-available']}</p>
						</div>
						<div>
							<span class="text-sm font-medium">{labels['fields.from']}</span>
							<p class="text-sm">{selectedBroadcastData.broadcast?.from || labels['fields.not-available']}</p>
						</div>
					</div>

					<div>
						<span class="text-sm font-medium">{labels['fields.html-content']}</span>
						<div class="bg-bg-hover mt-2 max-h-64 overflow-y-auto rounded-lg p-4">
							<pre class="text-xs whitespace-pre-wrap">{selectedBroadcastData.broadcast?.html || labels['fields.no-content']}</pre>
						</div>
					</div>

					{#if selectedBroadcastData.broadcast?.text}
						<div>
							<span class="text-sm font-medium">{labels['fields.plain-text-content']}</span>
							<div class="bg-bg-hover mt-2 max-h-64 overflow-y-auto rounded-lg p-4">
								<pre class="text-xs whitespace-pre-wrap">{selectedBroadcastData.broadcast.text}</pre>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<div class="mt-6 flex justify-end gap-2">
				<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors" onclick={() => (isViewBroadcastDialogOpen = false)}>
					{labels['actions.close']}
				</button>
				{#if selectedBroadcast?.status === 'draft'}
					<button type="button" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors" onclick={() => { isViewBroadcastDialogOpen = false; if (selectedBroadcast) { selectedBroadcast = selectedBroadcast; isEditBroadcastDialogOpen = true } }}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4"><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" /></svg>
						{labels['actions.edit-broadcast']}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if isEditBroadcastDialogOpen && selectedBroadcast}
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10" role="dialog" aria-modal="true">
		<div class="bg-bg-base w-full max-w-2xl rounded-lg border border-[var(--border-subtle)] p-6">
			<h3 class="text-lg font-semibold">{labels['edit-broadcast.title']}</h3>
			<p class="text-muted-foreground text-sm">{labels['edit-broadcast.description']}</p>
			<form onsubmit={updateBroadcast} class="mt-4">
				<div class="space-y-4">
					<div>
						<label for="edit-subject" class="text-sm font-medium">{labels['fields.subject-line']}</label>
						<input id="edit-subject" name="subject" required value={selectedBroadcast.subject ?? ''} placeholder={labels['fields.email-subject-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
					</div>
					<div>
						<label for="edit-html" class="text-sm font-medium">{labels['fields.email-content-html']}</label>
						<textarea id="edit-html" name="html" value={selectedBroadcast.html ?? ''} placeholder={labels['fields.email-html-placeholder']} rows="12" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
					</div>
					<div>
						<label for="edit-text" class="text-sm font-medium">{labels['fields.plain-text-optional']}</label>
						<textarea id="edit-text" name="text" value={selectedBroadcast.text ?? ''} placeholder={labels['fields.plain-text-placeholder']} rows="6" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
					</div>
				</div>
				<div class="mt-6 flex justify-end gap-2">
					<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors" onclick={() => (isEditBroadcastDialogOpen = false)}>
						{labels['common.cancel']}
					</button>
					<button type="submit" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={isUpdating}>
						{#if isUpdating}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
							{labels['actions.updating']}
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4"><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" /></svg>
							{labels['actions.update-broadcast']}
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<ConfirmationDialog
	bind:open={confirmDialog.open}
	title={confirmDialog.title}
	description={confirmDialog.description}
	variant={confirmDialog.variant}
	onConfirm={confirmDialog.action}
	loading={isDeleting}
	{labels}
/>
