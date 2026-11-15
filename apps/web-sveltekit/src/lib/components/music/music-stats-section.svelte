<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'

	let { labels }: { labels: Record<string, string> } = $props()

	type TopArtist = { genres: string[] }
	type TopTrack = { duration?: number; popularity?: number; artist: string }
	type RecentTrack = { duration?: number }

	let topArtists = $state<TopArtist[] | null>(null)
	let topTracks = $state<TopTrack[] | null>(null)
	let recentTracks = $state<RecentTrack[] | null>(null)
	let isRefreshing = $state(false)

	function getGenreBadgeClassName(index: number) {
		if (index === 0) return 'bg-accent-earth text-text-inverse'
		if (index === 1) return 'bg-bg-surface text-text-primary'
		return 'bg-bg-hover text-text-secondary'
	}

	function refresh() {
		isRefreshing = true
		fetchStats()
	}

	async function fetchStats() {
		try {
			const [artists, tracks, recent] = await Promise.all([
				trpc.lastfm.getTopArtists.query(),
				trpc.lastfm.getTopTracks.query(),
				trpc.lastfm.getRecentlyPlayed.query()
			])
			topArtists = artists as TopArtist[]
			topTracks = tracks as TopTrack[]
			recentTracks = recent as RecentTrack[]
		} finally {
			isRefreshing = false
		}
	}

	let stats = $derived.by(() => {
		if (!topTracks || !topArtists || !recentTracks) return null

		const totalTracks = topTracks.length

		const totalMinutes =
			recentTracks.reduce((acc, track) => acc + (track.duration || 180_000), 0) / 60_000
		const totalHours = Math.round(totalMinutes / 60)

		const genreCount: Record<string, number> = {}
		for (const artist of topArtists) {
			if (artist.genres && artist.genres.length > 0) {
				for (const genre of artist.genres) {
					genreCount[genre] = (genreCount[genre] || 0) + 1
				}
			}
		}

		const topGenres = Object.entries(genreCount)
			.toSorted(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([genre]) => genre)

		const avgPopularity =
			totalTracks === 0
				? 0
				: Math.round(
						topTracks.reduce((acc, track) => acc + (track.popularity || 0), 0) / totalTracks
					)

		const uniqueArtists =
			totalTracks === 0 ? 0 : new Set(topTracks.map((track) => track.artist)).size
		const diversityScore = totalTracks === 0 ? 0 : Math.round((uniqueArtists / totalTracks) * 100)

		return {
			totalHours,
			topGenres,
			avgPopularity,
			diversityScore,
			totalTracks,
			totalArtists: topArtists.length
		}
	})

	$effect(() => {
		fetchStats()
	})
</script>

<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
	<div class="flex items-center justify-between p-6 pb-0">
		<div>
			<h3 class="flex items-center gap-2 text-base font-medium sm:text-lg">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
					<path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
				</svg>
				{labels['stats.title']}
			</h3>
			<p class="text-text-secondary text-xs sm:text-sm">{labels['stats.subtitle']}</p>
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
		{#if !stats}
			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
				{#each Array.from({ length: 4 }) as _, i (i)}
					<div class="space-y-2 text-center">
						<div class="yu-skeleton mx-auto h-8 w-8 rounded-full"></div>
						<div class="yu-skeleton mx-auto h-4 w-16"></div>
						<div class="yu-skeleton mx-auto h-3 w-12"></div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-6 md:grid-cols-4">
				<div class="space-y-2 text-center">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-dim)]">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-6 w-6">
							<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
						</svg>
					</div>
					<div>
						<p class="text-lg font-medium sm:text-xl">{stats.totalHours}h</p>
						<p class="text-text-secondary text-xs sm:text-sm">{labels['labels.total-hours']}</p>
					</div>
				</div>

				<div class="space-y-2 text-center">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-dim)]">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-6 w-6">
							<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
						</svg>
					</div>
					<div>
						<p class="text-lg font-medium sm:text-xl">{stats.diversityScore}%</p>
						<p class="text-text-secondary text-xs sm:text-sm">{labels['labels.diversity']}</p>
					</div>
				</div>

				<div class="space-y-2 text-center">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-dim)]">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-6 w-6">
							<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
						</svg>
					</div>
					<div>
						<p class="text-lg font-medium sm:text-xl">{stats.avgPopularity}%</p>
						<p class="text-text-secondary text-xs sm:text-sm">{labels['labels.avg-popularity']}</p>
					</div>
				</div>

				<div class="space-y-2 text-center">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-dim)]">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-6 w-6">
							<path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
						</svg>
					</div>
					<div>
						<p class="text-lg font-medium sm:text-xl">{stats.totalArtists}</p>
						<p class="text-text-secondary text-xs sm:text-sm">{labels['labels.top-artists']}</p>
					</div>
				</div>
			</div>

			{#if stats.topGenres.length > 0}
				<div class="mt-6 border-t pt-6">
					<h4 class="mb-3 flex items-center gap-2 text-sm font-medium sm:text-base">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
							<path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
						</svg>
						{labels['labels.top-genres']}
					</h4>
					<div class="flex flex-wrap gap-2">
						{#each stats.topGenres as genre, index (genre)}
							<span class="rounded-full px-3 py-1 text-xs font-medium sm:text-sm {getGenreBadgeClassName(index)}">
								#{index + 1} {genre}
							</span>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
