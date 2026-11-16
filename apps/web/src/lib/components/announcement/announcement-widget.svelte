<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { getAnnouncementUi } from '#lib/announcement-ui.ts'
	import {
		addDismissedAnnouncementId,
		addViewedAnnouncementId,
		getDismissedAnnouncementIds,
		getViewedAnnouncementIds
	} from '@isyuricunha/trpc-server/utils/announcements/announcement-storage'
	import { hasHighPriorityBadge } from '@isyuricunha/trpc-server/utils/announcements/announcement-priority'
	import AnnouncementIcon from './announcement-icon.svelte'

	let {
		labels,
		locale,
		maxItems = 5
	}: {
		labels: Record<string, string>
		locale: string
		maxItems?: number
	} = $props()

	type Announcement = {
		id: string
		title: string
		content: string
		type: string
		priority: number
		isDismissible: boolean
		createdAt: string | Date
		userInteraction?: { dismissed?: boolean } | null
	}

	let dismissedItems = $state<string[]>([])
	let data = $state<Announcement[] | null>(null)
	let isLoading = $state(true)

	let activeAnnouncements = $derived(
		(data ?? [])
			.filter(
				(announcement) =>
					!announcement.userInteraction?.dismissed && !dismissedItems.includes(announcement.id)
			)
			.slice(0, maxItems)
	)

	function dismiss(announcementId: string) {
		trpc.announcements.dismissAnnouncement
			.mutate({ announcementId })
			.then(() => {
				dismissedItems = addDismissedAnnouncementId(dismissedItems, announcementId)
			})
			.catch(() => {})
	}

	function formatShortDate(value: string | Date) {
		const dateLocale = locale === 'pt' ? 'pt-BR' : 'en-US'
		return new Date(value).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })
	}

	$effect(() => {
		dismissedItems = getDismissedAnnouncementIds()
		const viewed = getViewedAnnouncementIds()
		trpc.announcements
			.getAnnouncements.query({ active: true, adminView: false, locale })
			.then((payload) => {
				const announcements = (payload as { announcements: Announcement[] }).announcements
				data = announcements
				const toMark = announcements.filter(
					(announcement) =>
						!announcement.userInteraction?.dismissed &&
						!dismissedItems.includes(announcement.id) &&
						!viewed.includes(announcement.id)
				)
				for (const announcement of toMark) {
					trpc.announcements.markAnnouncementViewed.mutate({ announcementId: announcement.id }).catch(() => {})
					addViewedAnnouncementId(viewed, announcement.id)
				}
			})
			.catch(() => {})
			.finally(() => (isLoading = false))
	})
</script>

<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
	{#if isLoading}
		<div class="p-6 pb-3">
			<h3 class="flex items-center gap-2 text-sm font-medium">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
					<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
				</svg>
				{labels['widget.title']}
			</h3>
		</div>
		<div class="p-6 pt-0">
			<div class="text-muted-foreground text-sm">{labels['widget.loading']}</div>
		</div>
	{:else if !data}
		<!-- Nothing to render, same as the Next null return. -->
	{:else if activeAnnouncements.length === 0}
		<div class="p-6 pb-3">
			<h3 class="flex items-center gap-2 text-sm font-medium">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
					<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
				</svg>
				{labels['widget.title']}
			</h3>
		</div>
		<div class="p-6 pt-0">
			<div class="text-muted-foreground text-sm">{labels['widget.empty']}</div>
		</div>
	{:else}
		<div class="p-6 pb-4">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accent-border)] bg-[var(--accent-dim)]">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-5 w-5">
						<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
					</svg>
				</div>
				<div class="flex-1">
					<h3 class="text-base font-medium tracking-tighter">{labels['widget.title']}</h3>
					<p class="text-muted-foreground text-xs">{labels['widget.description']}</p>
				</div>
				<span class="bg-bg-hover inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
					{activeAnnouncements.length}
				</span>
			</div>
		</div>
		<div class="p-6 pt-0">
			<div class="h-[320px] overflow-y-auto pr-4">
				<div class="space-y-3">
					{#each activeAnnouncements as announcement (announcement.id)}
						{@const ui = getAnnouncementUi(announcement.type, { iconSize: 'sm' })}
						<div class="group bg-bg-surface hover:bg-bg-hover relative rounded-lg border border-[var(--border-subtle)] p-3 transition-colors hover:border-[var(--border-default)]">
							<div class="flex items-start gap-3">
								<div class="shrink-0 transition-colors duration-150 {ui.iconClassName}">
									<AnnouncementIcon iconId={ui.iconId} className="h-4 w-4" />
								</div>

								<div class="min-w-0 flex-1 space-y-2">
									<div class="flex items-start gap-2">
										<h4 class="flex-1 text-sm leading-tight font-medium">{announcement.title}</h4>
										{#if announcement.isDismissible}
											<button
												type="button"
												onclick={() => dismiss(announcement.id)}
												class="hover:bg-bg-active shrink-0 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
												aria-label={labels['widget.dismiss']}
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
													<path d="M18 6 6 18" /><path d="m6 6 12 12" />
												</svg>
											</button>
										{/if}
									</div>

									<p class="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
										{announcement.content}
									</p>

									<div class="flex items-center gap-2">
										<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-[10px] font-medium {ui.badgeClassName}">
											{announcement.type}
										</span>
										{#if hasHighPriorityBadge(announcement.priority)}
											<span class="text-accent-earth-text border-[var(--accent-border)] inline-flex rounded-full border bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-medium">
												{labels['widget.high-priority']}
											</span>
										{/if}
										<span class="text-muted-foreground ml-auto text-[10px]">
											{formatShortDate(announcement.createdAt)}
										</span>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
