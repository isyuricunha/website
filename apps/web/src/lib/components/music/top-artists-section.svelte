<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { exportJson, exportTopArtistsCsv } from '@isyuricunha/trpc-server/utils/exporters/music'
	import MusicImage from './music-image.svelte'
	import TimeRangeToggle from './time-range-toggle.svelte'

	let { labels }: { labels: Record<string, string> } = $props()

	type Artist = {
		id: string
		name: string
		image: string | null
		url: string
		followers: number
		genres: string[]
	}

	let artists = $state<Artist[] | null>(null)
	let isLoading = $state(true)
	let hasError = $state(false)
	let isRefreshing = $state(false)
	let viewMode = $state<'list' | 'grid'>('list')
	let isShuffled = $state(true)
	let timeRange = $state<'short_term' | 'medium_term' | 'long_term'>('short_term')

	function getStableShuffleRank(value: string) {
		let hash = 0
		for (let index = 0; index < value.length; index += 1) {
			hash = (hash * 31 + (value.codePointAt(index) ?? 0)) >>> 0
		}
		return hash
	}

	let displayedArtists = $derived.by(() => {
		if (!artists) return []
		if (isShuffled) {
			return artists.toSorted(
				(a, b) => getStableShuffleRank(a.id || a.name) - getStableShuffleRank(b.id || b.name)
			)
		}
		return artists
	})

	async function fetchArtists() {
		try {
			artists = await trpc.lastfm.getTopArtistsByRange.query({ time_range: timeRange })
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
		fetchArtists()
	}

	function exportCsv() {
		if (artists && artists.length > 0) exportTopArtistsCsv(artists)
	}

	function exportFile() {
		if (artists) exportJson('top-artists.json', artists)
	}

	$effect(() => {
		fetchArtists()
	})
</script>

<div class="bg-bg-surface max-w-full min-w-0 rounded-lg border border-[var(--border-subtle)]">
	<div class="min-w-0 p-6 pb-0">
		<h3 class="text-base font-medium sm:text-lg">{labels['top-artists.title']}</h3>
		<p class="text-text-secondary text-xs sm:text-sm">{labels['top-artists.subtitle']}</p>
		<div class="mt-3 flex min-w-0 flex-wrap items-center gap-2">
			<TimeRangeToggle value={timeRange} onChange={(v) => (timeRange = v)} {labels} />
			<div class="bg-bg-hover inline-flex items-center gap-1 rounded-md p-1 text-xs">
				<button
					type="button"
					onclick={() => (viewMode = 'list')}
					class="rounded-md p-1.5 transition-colors {viewMode === 'list'
						? 'bg-bg-base text-text-primary shadow'
						: 'text-text-secondary hover:text-text-primary'}"
					title={labels['tooltips.view-list']}
					aria-label={labels['tooltips.view-list']}
					aria-pressed={viewMode === 'list'}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
						<line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" />
						<line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" />
						<line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
					</svg>
				</button>
				<button
					type="button"
					onclick={() => (viewMode = 'grid')}
					class="rounded-md p-1.5 transition-colors {viewMode === 'grid'
						? 'bg-bg-base text-text-primary shadow'
						: 'text-text-secondary hover:text-text-primary'}"
					title={labels['tooltips.view-grid']}
					aria-label={labels['tooltips.view-grid']}
					aria-pressed={viewMode === 'grid'}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
						<rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
						<rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
					</svg>
				</button>
			</div>
			<button
				type="button"
				onclick={() => (isShuffled = !isShuffled)}
				class="rounded-md p-1.5 transition-colors {isShuffled
					? 'bg-accent-earth text-text-inverse'
					: 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'}"
				title={isShuffled ? labels['tooltips.shuffle-on'] : labels['tooltips.shuffle-off']}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
					<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
					<path d="m18 2 4 4-4 4" /><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
					<path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" /><path d="m18 14 4 4-4 4" />
				</svg>
			</button>
			<button
				type="button"
				onclick={exportCsv}
				class="text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md px-2 py-1 text-xs transition-colors"
				title={labels['export.csv']}
			>
				CSV
			</button>
			<button
				type="button"
				onclick={exportFile}
				class="text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md px-2 py-1 text-xs transition-colors"
				title={labels['export.json']}
			>
				JSON
			</button>
			<button
				type="button"
				onclick={refresh}
				disabled={isRefreshing}
				class="text-text-secondary hover:text-text-primary text-sm disabled:opacity-50"
			>
				{labels.refresh}
			</button>
		</div>
	</div>
	<div class="min-w-0 p-6">
		{#if isLoading}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each Array.from({ length: 10 }) as _, i (i)}
					<div class="flex flex-col items-center space-y-2">
						<div class="yu-skeleton h-16 w-16 rounded-full"></div>
						<div class="yu-skeleton h-4 w-20"></div>
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
		{:else if !artists || artists.length === 0}
			<div class="flex items-center justify-between">
				<p class="text-text-secondary">{labels['top-artists.no-data']}</p>
				<button
					type="button"
					onclick={refresh}
					disabled={isRefreshing}
					class="text-text-secondary hover:text-text-primary text-sm disabled:opacity-50"
				>
					{labels.refresh}
				</button>
			</div>
		{:else if viewMode === 'grid'}
			<div class="grid min-w-0 grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each displayedArtists as artist (artist.id)}
					<a
						href={artist.url}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:bg-bg-hover group flex min-w-0 flex-col items-center space-y-2 rounded-lg p-2 transition-colors"
					>
						<div class="relative h-16 w-16 overflow-hidden rounded-full">
							<MusicImage
								src={artist.image}
								alt="{artist.name} artist photo"
								fallbackIcon="user"
								width={64}
								height={64}
							/>
						</div>
						<div class="w-full min-w-0 text-center">
							<h3 class="group-hover:text-accent-earth-text w-full truncate text-xs font-medium sm:text-sm">
								{artist.name}
							</h3>
							{#if artist.genres && artist.genres.length > 0}
								<p class="text-text-secondary w-full truncate text-[10px] sm:text-xs">
									{artist.genres.slice(0, 2).join(', ')}
								</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="min-w-0 space-y-3">
				{#each displayedArtists as artist (artist.id)}
					<a
						href={artist.url}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:bg-bg-hover group flex items-center gap-4 rounded-lg p-3 transition-colors"
					>
						<div class="flex min-w-0 flex-1 items-center gap-4">
							<div class="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
								<MusicImage
									src={artist.image}
									alt="{artist.name} artist photo"
									fallbackIcon="user"
									width={48}
									height={48}
								/>
							</div>
							<div class="min-w-0 flex-1">
								<h3 class="group-hover:text-accent-earth-text truncate text-sm font-medium">
									{artist.name}
								</h3>
								{#if artist.genres && artist.genres.length > 0}
									<p class="text-text-secondary truncate text-xs">
										{artist.genres.slice(0, 3).join(', ')}
									</p>
								{/if}
							</div>
							<div class="shrink-0 text-right">
								<p class="text-text-secondary text-xs">
									{artist.followers.toLocaleString()} {labels.followers}
								</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
