<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import { getAnnouncementUi, normalizeAnnouncementType } from '#lib/announcement-ui.ts'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type CommStats = RouterOutputs['communication']['getCommunicationStats']
	type Campaigns = RouterOutputs['communication']['getEmailCampaigns']
	type Templates = RouterOutputs['communication']['getEmailTemplates']
	type Announcements = RouterOutputs['announcements']['getAnnouncements']
	type Notifications = RouterOutputs['communication']['getAllNotifications']

	let selectedTab = $state('overview')

	let commStats = $state<CommStats | null>(null)
	let campaigns = $state<Campaigns | null>(null)
	let templates = $state<Templates | null>(null)
	let announcements = $state<Announcements | null>(null)
	let notifications = $state<Notifications | null>(null)

	let statsLoading = $state(true)
	let campaignsLoading = $state(true)
	let templatesLoading = $state(true)
	let announcementsLoading = $state(true)
	let notificationsLoading = $state(true)

	let isCreatingTemplate = $state(false)
	let isCreatingCampaign = $state(false)
	let isCreatingAnnouncement = $state(false)
	let isSendingCampaign = $state(false)

	function fetchAll() {
		trpc.communication.getCommunicationStats
			.query()
			.then((data) => {
				commStats = data as CommStats
				statsLoading = false
			})
			.catch(() => (statsLoading = false))
		trpc.communication.getEmailCampaigns
			.query({})
			.then((data) => (campaigns = data as Campaigns))
			.catch(() => {})
			.finally(() => (campaignsLoading = false))
		trpc.communication.getEmailTemplates
			.query({})
			.then((data) => (templates = data as Templates))
			.catch(() => {})
			.finally(() => (templatesLoading = false))
		trpc.announcements.getAnnouncements
			.query({ adminView: true })
			.then((data) => (announcements = data as Announcements))
			.catch(() => {})
			.finally(() => (announcementsLoading = false))
		trpc.communication.getAllNotifications
			.query({ limit: 20, offset: 0, includeExpired: false })
			.then((data) => (notifications = data as Notifications))
			.catch(() => {})
			.finally(() => (notificationsLoading = false))
	}

	function createTemplate(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const name = formData.get('name') as string
		const type = formData.get('type')
		const subject = formData.get('subject') as string
		const htmlContent = formData.get('htmlContent') as string

		if (!name || !type || !subject || !htmlContent) {
			toastError(labels['messages.all-fields-required'])
			return
		}

		isCreatingTemplate = true
		trpc.communication.createEmailTemplate
			.mutate({ name, type: type as 'welcome' | 'newsletter' | 'announcement' | 'notification' | 'marketing' | 'transactional', subject, htmlContent })
			.then(() => {
				toastSuccess(labels['messages.template-created'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.template-create-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isCreatingTemplate = false))
	}

	function createCampaign(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const name = formData.get('name') as string
		const subject = formData.get('subject') as string
		const htmlContent = formData.get('htmlContent') as string

		if (!name || !subject || !htmlContent) {
			toastError(labels['messages.campaign-fields-required'])
			return
		}

		isCreatingCampaign = true
		trpc.communication.createEmailCampaign
			.mutate({ name, subject, htmlContent })
			.then(() => {
				toastSuccess(labels['messages.campaign-created'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.campaign-create-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isCreatingCampaign = false))
	}

	function sendCampaign(campaignId: string) {
		isSendingCampaign = true
		trpc.communication.sendEmailCampaign
			.mutate({ campaignId })
			.then(() => {
				toastSuccess(labels['messages.campaign-sent'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.campaign-send-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isSendingCampaign = false))
	}

	function createAnnouncement(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const title = formData.get('title') as string
		const content = formData.get('content') as string
		const titlePt = (formData.get('titlePt') as string | null) ?? ''
		const contentPt = (formData.get('contentPt') as string | null) ?? ''
		const type = formData.get('type')
		const priority = Number.parseInt(formData.get('priority') as string) || 0

		if (!title || !content) {
			toastError(labels['messages.title-content-required'])
			return
		}

		isCreatingAnnouncement = true
		trpc.announcements.createAnnouncement
			.mutate({
				title,
				content,
				titlePt: titlePt.trim() ? titlePt : undefined,
				contentPt: contentPt.trim() ? contentPt : undefined,
				type: normalizeAnnouncementType(type as string) as 'info',
				priority
			})
			.then(() => {
				toastSuccess(labels['messages.announcement-created'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.announcement-create-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isCreatingAnnouncement = false))
	}

	function campaignBadge(status: string) {
		switch (status) {
			case 'sent':
				return 'bg-status-success-soft text-status-success'
			case 'sending':
				return 'bg-status-agent-soft text-status-agent'
			case 'scheduled':
				return 'bg-status-info-soft text-status-info'
			case 'failed':
				return 'bg-status-danger-soft text-status-danger'
			default:
				return 'border border-[var(--border-faint)]'
		}
	}

	function announcementBadge(type: string) {
		return getAnnouncementUi(type).badgeClassName
	}

	$effect(() => {
		fetchAll()
	})
</script>

{#if statsLoading}
	<div class="p-6">{labels.loading}</div>
{:else}
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-medium">{labels.title}</h1>
				<p class="text-text-secondary">{labels.description}</p>
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.email-campaigns']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{commStats?.campaigns.total || 0}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.sent-campaigns'], { count: commStats?.campaigns.sent || 0 }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.emails-sent']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{commStats?.campaigns.totalEmailsSent || 0}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.delivered'], { count: commStats?.campaigns.totalEmailsDelivered || 0 }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.announcements']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{commStats?.announcements.total || 0}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.active'], { count: commStats?.announcements.active || 0 }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.notifications']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{commStats?.notifications.total || 0}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.unread'], { count: commStats?.notifications.unread || 0 }, locale)}
					</p>
				</div>
			</div>
		</div>

		<div class="bg-bg-hover grid w-full grid-cols-2 rounded-md p-1 sm:grid-cols-3 lg:grid-cols-5">
			{#each ['overview', 'campaigns', 'templates', 'announcements', 'notifications'] as tab (tab)}
				<button type="button" class="rounded-md px-2 py-1.5 text-sm transition-colors {selectedTab === tab ? 'bg-bg-base text-text-primary shadow' : 'text-text-secondary hover:text-text-primary'}" onclick={() => (selectedTab = tab)}>
					{labels[`tabs.${tab}`]}
				</button>
			{/each}
		</div>

		{#if selectedTab === 'overview'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['overview.recent-campaigns.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['overview.recent-campaigns.description']}</p>
					</div>
					<div class="p-6">
						{#if campaignsLoading}
							<div>{labels['campaigns.loading']}</div>
						{:else}
							<div class="space-y-3">
								{#each (campaigns?.campaigns ?? []).slice(0, 5) as campaign (campaign.id)}
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-2">
											<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {campaignBadge(campaign.status)}">{campaign.status}</span>
											<span class="text-sm">{campaign.name}</span>
										</div>
										<span class="text-text-secondary text-xs">{new Date(campaign.createdAt).toLocaleDateString()}</span>
									</div>
								{/each}
								{#if (campaigns?.campaigns.length ?? 0) === 0}
									<div class="text-text-secondary text-sm">{labels['campaigns.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['overview.active-announcements.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['overview.active-announcements.description']}</p>
					</div>
					<div class="p-6">
						{#if announcementsLoading}
							<div>{labels['announcements.loading']}</div>
						{:else}
							<div class="space-y-3">
								{#each (announcements?.announcements ?? []).filter((a) => a.isActive).slice(0, 5) as announcement (announcement.id)}
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-2">
											<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {announcementBadge(announcement.type)}">{announcement.type}</span>
											<span class="text-sm">{announcement.title}</span>
										</div>
										<span class="text-text-secondary text-xs">
											{formatMessage(labels['announcements.priority'], { priority: announcement.priority }, locale)}
										</span>
									</div>
								{/each}
								{#if (announcements?.announcements.filter((a) => a.isActive).length ?? 0) === 0}
									<div class="text-text-secondary text-sm">{labels['announcements.no-active']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'campaigns'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['campaigns.create-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['campaigns.create-description']}</p>
					</div>
					<div class="p-6">
						<form onsubmit={createCampaign} class="space-y-4">
							<div>
								<label for="campaignName" class="text-sm font-medium">{labels['fields.campaign-name']}</label>
								<input id="campaignName" name="name" required placeholder={labels['fields.campaign-name-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="campaignSubject" class="text-sm font-medium">{labels['fields.email-subject']}</label>
								<input id="campaignSubject" name="subject" required placeholder={labels['fields.email-subject-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="campaignContent" class="text-sm font-medium">{labels['fields.email-content-html']}</label>
								<textarea id="campaignContent" name="htmlContent" rows="6" required placeholder={labels['fields.campaign-content-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
							</div>
							<button type="submit" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={isCreatingCampaign}>
								{isCreatingCampaign ? labels['actions.creating'] : labels['actions.create-campaign']}
							</button>
						</form>
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['campaigns.list-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['campaigns.list-description']}</p>
					</div>
					<div class="p-6">
						{#if campaignsLoading}
							<div>{labels['campaigns.loading']}</div>
						{:else}
							<div class="space-y-3">
								{#each campaigns?.campaigns ?? [] as campaign (campaign.id)}
									<div class="rounded border border-[var(--border-faint)] p-3">
										<div class="mb-2 flex items-center justify-between">
											<div class="font-medium">{campaign.name}</div>
											<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {campaignBadge(campaign.status)}">{campaign.status}</span>
										</div>
										<div class="text-text-secondary mb-2 text-sm">
											{formatMessage(labels['campaigns.subject'], { subject: campaign.subject }, locale)}
										</div>
										<div class="text-text-secondary mb-2 text-sm">
											{formatMessage(labels['campaigns.recipients'], { count: campaign.totalRecipients || 0 }, locale)}
										</div>
										<div class="flex items-center justify-between">
											<span class="text-text-secondary text-xs">
												{formatMessage(labels['date.created'], { date: new Date(campaign.createdAt).toLocaleDateString() }, locale)}
											</span>
											{#if campaign.status === 'draft'}
												<button type="button" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50" onclick={() => sendCampaign(campaign.id)} disabled={isSendingCampaign}>
													{labels['actions.send-now']}
												</button>
											{/if}
										</div>
									</div>
								{/each}
								{#if (campaigns?.campaigns.length ?? 0) === 0}
									<div class="text-text-secondary text-center">{labels['campaigns.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'templates'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['templates.create-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['templates.create-description']}</p>
					</div>
					<div class="p-6">
						<form onsubmit={createTemplate} class="space-y-4">
							<div>
								<label for="templateName" class="text-sm font-medium">{labels['fields.template-name']}</label>
								<input id="templateName" name="name" required placeholder={labels['fields.template-name-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="templateType" class="text-sm font-medium">{labels['fields.template-type']}</label>
								<select id="templateType" name="type" required class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
									<option value="welcome">{labels['template-types.welcome']}</option>
									<option value="newsletter">{labels['template-types.newsletter']}</option>
									<option value="announcement">{labels['template-types.announcement']}</option>
									<option value="notification">{labels['template-types.notification']}</option>
									<option value="marketing">{labels['template-types.marketing']}</option>
									<option value="transactional">{labels['template-types.transactional']}</option>
								</select>
							</div>
							<div>
								<label for="templateSubject" class="text-sm font-medium">{labels['fields.subject-line']}</label>
								<input id="templateSubject" name="subject" required placeholder={labels['fields.template-subject-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="templateContent" class="text-sm font-medium">{labels['fields.html-content']}</label>
								<textarea id="templateContent" name="htmlContent" rows="6" required placeholder={labels['fields.template-content-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
							</div>
							<button type="submit" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={isCreatingTemplate}>
								{isCreatingTemplate ? labels['actions.creating'] : labels['actions.create-template']}
							</button>
						</form>
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['templates.list-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['templates.list-description']}</p>
					</div>
					<div class="p-6">
						{#if templatesLoading}
							<div>{labels['templates.loading']}</div>
						{:else}
							<div class="space-y-3">
								{#each templates?.templates ?? [] as template (template.id)}
									<div class="rounded border border-[var(--border-faint)] p-3">
										<div class="mb-2 flex items-center justify-between">
											<div class="font-medium">{template.name}</div>
											<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-xs font-medium">{template.type}</span>
										</div>
										<div class="text-text-secondary mb-2 text-sm">
											{formatMessage(labels['templates.subject'], { subject: template.subject }, locale)}
										</div>
										<div class="text-text-secondary text-xs">
											{formatMessage(labels['date.created'], { date: new Date(template.createdAt).toLocaleDateString() }, locale)}
										</div>
									</div>
								{/each}
								{#if (templates?.templates.length ?? 0) === 0}
									<div class="text-text-secondary text-center">{labels['templates.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'announcements'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['announcements.create-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['announcements.create-description']}</p>
					</div>
					<div class="p-6">
						<form onsubmit={createAnnouncement} class="space-y-4">
							<div>
								<label for="announcementTitle" class="text-sm font-medium">{labels['fields.title']}</label>
								<input id="announcementTitle" name="title" required placeholder={labels['fields.announcement-title-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="announcementTitlePt" class="text-sm font-medium">{labels['fields.title-pt']}</label>
								<input id="announcementTitlePt" name="titlePt" placeholder={labels['fields.announcement-title-pt-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="announcementType" class="text-sm font-medium">{labels['fields.type']}</label>
								<select id="announcementType" name="type" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
									<option value="info">{labels['announcement-types.info']}</option>
									<option value="warning">{labels['announcement-types.warning']}</option>
									<option value="success">{labels['announcement-types.success']}</option>
									<option value="error">{labels['announcement-types.error']}</option>
									<option value="maintenance">{labels['announcement-types.maintenance']}</option>
									<option value="feature">{labels['announcement-types.feature']}</option>
									<option value="update">{labels['announcement-types.update']}</option>
								</select>
							</div>
							<div>
								<label for="announcementPriority" class="text-sm font-medium">{labels['fields.priority']}</label>
								<input id="announcementPriority" name="priority" type="number" min="0" max="10" value="0" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="announcementContent" class="text-sm font-medium">{labels['fields.content']}</label>
								<textarea id="announcementContent" name="content" rows="4" required placeholder={labels['fields.announcement-content-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
							</div>
							<div>
								<label for="announcementContentPt" class="text-sm font-medium">{labels['fields.content-pt']}</label>
								<textarea id="announcementContentPt" name="contentPt" rows="4" placeholder={labels['fields.announcement-content-pt-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
							</div>
							<button type="submit" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={isCreatingAnnouncement}>
								{isCreatingAnnouncement ? labels['actions.creating'] : labels['actions.create-announcement']}
							</button>
						</form>
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['announcements.list-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['announcements.list-description']}</p>
					</div>
					<div class="p-6">
						{#if announcementsLoading}
							<div>{labels['announcements.loading']}</div>
						{:else}
							<div class="space-y-3">
								{#each announcements?.announcements ?? [] as announcement (announcement.id)}
									<div class="rounded border border-[var(--border-faint)] p-3">
										<div class="mb-2 flex items-center justify-between">
											<div class="font-medium">{announcement.title}</div>
											<div class="flex items-center space-x-2">
												<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {announcementBadge(announcement.type)}">{announcement.type}</span>
												{#if announcement.isActive}
													<span class="bg-accent-earth text-text-inverse inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">{labels['announcements.active']}</span>
												{/if}
											</div>
										</div>
										<div class="text-text-secondary mb-2 text-sm">{announcement.content}</div>
										<div class="text-text-secondary flex items-center justify-between text-xs">
											<span>{formatMessage(labels['announcements.priority'], { priority: announcement.priority }, locale)}</span>
											<span>{formatMessage(labels['date.created'], { date: new Date(announcement.createdAt).toLocaleDateString() }, locale)}</span>
										</div>
									</div>
								{/each}
								{#if (announcements?.announcements.length ?? 0) === 0}
									<div class="text-text-secondary text-center">{labels['announcements.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'notifications'}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="p-6 pb-0">
					<h3 class="font-medium">{labels['notifications.title']}</h3>
					<p class="text-muted-foreground text-sm">{labels['notifications.description']}</p>
				</div>
				<div class="p-6">
					{#if notificationsLoading}
						<div>{labels['notifications.loading']}</div>
					{:else}
						<div class="space-y-3">
							{#each notifications?.notifications ?? [] as notification (notification.id)}
								<div class="rounded border border-[var(--border-faint)] p-3">
									<div class="mb-2 flex items-center justify-between">
										<div class="font-medium">{notification.title}</div>
										<div class="flex items-center space-x-2">
											<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {notification.read ? 'border border-[var(--border-faint)]' : 'bg-accent-earth text-text-inverse'}">
												{notification.read ? labels['notifications.read'] : labels['notifications.unread']}
											</span>
										</div>
									</div>
									<div class="text-text-secondary mb-2 text-sm">{notification.message}</div>
									<div class="text-text-secondary text-xs">{new Date(notification.createdAt).toLocaleString()}</div>
								</div>
							{/each}
							{#if (notifications?.notifications.length ?? 0) === 0}
								<div class="text-text-secondary text-center">{labels['notifications.empty']}</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}
