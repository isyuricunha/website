<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import MusicImage from './music-image.svelte'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type RecentTrack = {
		id: string
		name: string
		artist: string
		album: string
		albumImage: string | null
		url: string
		playedAt: string
	}

	type Period = 'last-hour' | 'today' | 'yesterday' | 'this-week' | 'earlier'

	let recentTracks = $state<RecentTrack[] | null>(null)
	let isLoading = $state(true)
	let hasError = $state(false)
	let isRefreshing = $state(false)

	async function fetchTracks() {
		try {
			recentTracks = await trpc.lastfm.getRecentlyPlayed.query()
			hasError = false
		} catch {
			hasError = true
		} finally {
			isLoading = false
			isRefreshing = false
		}
	}

	function refresh() {
		isRefreshing = true
		fetchTracks()
	}

	function formatTime(playedAt: string) {
		const date = new Date(playedAt)
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	}

	function formatDate(playedAt: string) {
		const date = new Date(playedAt)
		return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
	}

	let timelineData = $derived.by(() => {
		if (!recentTracks) return []

		const now = new Date()
		const groups: Record<Period, RecentTrack[]> = {
			'last-hour': [],
			today: [],
			yesterday: [],
			'this-week': [],
			earlier: []
		}

		for (const track of recentTracks) {
			const playedAt = new Date(track.playedAt)
			const diffInHours = (now.getTime() - playedAt.getTime()) / (1000 * 60 * 60)
			const diffInDays = diffInHours / 24

			if (diffInHours < 1) groups['last-hour'].push(track)
			else if (diffInDays < 1) groups.today.push(track)
			else if (diffInDays < 2) groups.yesterday.push(track)
			else if (diffInDays < 7) groups['this-week'].push(track)
			else groups.earlier.push(track)
		}

		return Object.entries(groups)
			.filter(([, tracks]) => tracks.length > 0)
			.map(([period, tracks]) => ({ period: period as Period, tracks }))
	})

	$effect(() => {
		fetchTracks()
	})
</script>

<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
	<div class="flex items-center justify-between p-6 pb-0">
		<div>
			<h3 class="flex items-center gap-2 text-base font-medium sm:text-lg">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
					<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
				</svg>
				{labels['timeline.title']}
			</h3>
			<p class="text-text-secondary text-xs sm:text-sm">{labels['timeline.subtitle']}</p>
		</div>
		<button
			type="button"
			onclick={refresh}
			disabled={isRefreshing}
			class="text-text-secondary hover:text-text-primary text-xs disabled:opacity-50 sm:text-sm"
		>
			{labels.refresh}
		</button>
	</div>
	<div class="p-6">
		{#if isLoading}
			<div class="space-y-4">
				{#each Array.from({ length: 3 }) as _, i (i)}
					<div class="space-y-3">
						<div class="yu-skeleton h-4 w-32"></div>
						<div class="ml-4 space-y-3">
							<div class="flex items-center gap-3">
								<div class="yu-skeleton h-10 w-10 rounded-lg"></div>
								<div class="flex-1 space-y-2">
									<div class="yu-skeleton h-3 w-40"></div>
									<div class="yu-skeleton h-3 w-24"></div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else if hasError}
			<div class="flex items-center justify-between">
				<p class="text-text-secondary">{labels.error}</p>
				<button
					type="button"
					onclick={refresh}
					disabled={isRefreshing}
					class="text-text-secondary hover:text-text-primary text-sm disabled:opacity-50"
				>
					{labels.refresh}
				</button>
			</div>
		{:else if !recentTracks || recentTracks.length === 0}
			<div class="py-8 text-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary mx-auto mb-4 h-12 w-12">
					<path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
				</svg>
				<p class="text-text-secondary text-sm">{labels['timeline.empty']}</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each timelineData as { period, tracks } (period)}
					<div class="relative">
						<div class="mb-4 flex items-center gap-2">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-dim)]">
								{#if period === 'last-hour'}
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-4 w-4">
										<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
									</svg>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-4 w-4">
										<path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
									</svg>
								{/if}
							</div>
							<h3 class="text-sm font-medium sm:text-base">
								{labels[`timeline.periods.${period}`]}
							</h3>
							<span class="text-text-secondary text-xs sm:text-sm">
								{formatMessage(
									labels['timeline.count'],
									{
										count: tracks.length,
										label: labels[`timeline.labels.${tracks.length === 1 ? 'track' : 'tracks'}`]
									},
									locale
								)}
							</span>
						</div>

						<div class="ml-4 space-y-4 border-l-[0.5px] border-[var(--border-subtle)] pl-6">
							{#each tracks.slice(0, 5) as track (`${track.id}-${track.playedAt}`)}
								<div class="relative">
									<div class="bg-accent-earth border-bg-base absolute top-2 -left-[1.75rem] h-3 w-3 rounded-full border"></div>

									<a
										href={track.url}
										target="_blank"
										rel="noopener noreferrer"
										class="hover:bg-bg-hover group flex items-center gap-3 rounded-lg p-3 transition-colors"
									>
										<div class="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
											<MusicImage
												src={track.albumImage}
												alt="{track.album} album cover"
												width={40}
												height={40}
											/>
										</div>
										<div class="min-w-0 flex-1">
											<h4 class="group-hover:text-accent-earth-text truncate text-xs font-medium sm:text-sm">
												{track.name}
											</h4>
											<p class="text-text-secondary truncate text-[10px] sm:text-xs">
												{track.artist} • {track.album}
											</p>
										</div>
										<div class="text-right">
											<p class="text-text-secondary text-[10px] sm:text-xs">{formatTime(track.playedAt)}</p>
											<p class="text-text-secondary text-[10px] sm:text-xs">{formatDate(track.playedAt)}</p>
										</div>
									</a>
								</div>
							{/each}

							{#if tracks.length > 5}
								<div class="relative">
									<div class="bg-bg-hover border-bg-base absolute top-2 -left-[1.75rem] h-3 w-3 rounded-full border"></div>
									<div class="p-3 text-center">
										<p class="text-text-secondary text-xs sm:text-sm">
											{formatMessage(labels['timeline.more-tracks'], { count: tracks.length - 5 }, locale)}
										</p>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-6 border-t pt-6">
				<div class="grid grid-cols-2 gap-4">
					<div class="text-center">
						<div class="mb-1 flex items-center justify-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4">
								<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
							</svg>
							<span class="text-text-secondary text-xs sm:text-sm">
								{labels['timeline.labels.total-tracks']}
							</span>
						</div>
						<p class="text-lg font-medium sm:text-xl">{recentTracks.length}</p>
					</div>
					<div class="text-center">
						<div class="mb-1 flex items-center justify-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4">
								<path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
							</svg>
							<span class="text-text-secondary text-xs sm:text-sm">
								{labels['timeline.labels.unique-artists']}
							</span>
						</div>
						<p class="text-lg font-medium sm:text-xl">
							{new Set(recentTracks.map((track) => track.artist)).size}
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
