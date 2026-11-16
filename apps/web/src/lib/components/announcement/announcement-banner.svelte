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
	import AnnouncementIcon from '#lib/components/announcement/announcement-icon.svelte'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type Announcement = {
		id: string
		title: string
		content: string
		type: string
		priority: number
		isDismissible: boolean
		userInteraction?: { dismissed?: boolean } | null
	}

	let dismissedAnnouncements = $state<string[]>([])
	let announcements = $state<Announcement[] | null>(null)

	let activeAnnouncements = $derived(
		(announcements ?? []).filter(
			(announcement) =>
				!announcement.userInteraction?.dismissed && !dismissedAnnouncements.includes(announcement.id)
		)
	)

	function dismiss(announcementId: string) {
		trpc.announcements.dismissAnnouncement
			.mutate({ announcementId })
			.then(() => {
				dismissedAnnouncements = addDismissedAnnouncementId(dismissedAnnouncements, announcementId)
			})
			.catch(() => {})
	}

	function markViewed(announcementId: string) {
		trpc.announcements.markAnnouncementViewed.mutate({ announcementId }).catch(() => {})
	}

	$effect(() => {
		dismissedAnnouncements = getDismissedAnnouncementIds()
		const viewed = getViewedAnnouncementIds()
		trpc.announcements
			.getAnnouncements.query({ active: true, adminView: false, locale })
			.then((data) => {
				announcements = (data as { announcements: Announcement[] }).announcements
				const toMark = (announcements ?? []).filter(
					(announcement) =>
						!announcement.userInteraction?.dismissed &&
						!dismissedAnnouncements.includes(announcement.id) &&
						!viewed.includes(announcement.id)
				)
				for (const announcement of toMark) {
					markViewed(announcement.id)
					addViewedAnnouncementId(viewed, announcement.id)
				}
			})
			.catch(() => {})
	})
</script>

{#if announcements && activeAnnouncements.length > 0}
	<div class="space-y-3">
		{#each activeAnnouncements as announcement (announcement.id)}
			{@const ui = getAnnouncementUi(announcement.type, { iconSize: 'md' })}
			<div class="group hover:bg-bg-hover relative overflow-hidden rounded-lg border transition-colors duration-150 {ui.containerClassName}">
				<div class="relative p-4">
					<div class="flex items-start gap-4">
						<div class="shrink-0 transition-colors duration-150 {ui.iconContainerClassName} {ui.iconClassName}">
							<AnnouncementIcon iconId={ui.iconId} className="h-5 w-5" />
						</div>

						<div class="min-w-0 flex-1 space-y-1.5">
							<div class="flex items-center gap-2">
								<h4 class="text-base leading-tight font-medium {ui.titleClassName}">
									{announcement.title}
								</h4>
								{#if hasHighPriorityBadge(announcement.priority)}
									<span class="text-accent-earth-text inline-flex items-center rounded-sm bg-[var(--accent-dim)] px-2 py-0.5 text-xs font-medium">
										{labels['high-priority']}
									</span>
								{/if}
							</div>
							<p class="text-sm leading-relaxed {ui.contentClassName}">{announcement.content}</p>
						</div>

						{#if announcement.isDismissible}
							<button
								type="button"
								onclick={() => dismiss(announcement.id)}
								class="hover:bg-[var(--bg-muted)] shrink-0 rounded-lg p-1.5 transition-colors disabled:opacity-50"
								aria-label={labels.dismiss}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4 opacity-60 transition-opacity hover:opacity-100">
									<path d="M18 6 6 18" /><path d="m6 6 12 12" />
								</svg>
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
