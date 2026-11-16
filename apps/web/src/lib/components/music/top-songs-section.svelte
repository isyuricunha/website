<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { exportJson, exportTopTracksCsv } from '@isyuricunha/trpc-server/utils/exporters/music'
	import MusicImage from './music-image.svelte'
	import TimeRangeToggle from './time-range-toggle.svelte'

	let { labels }: { labels: Record<string, string> } = $props()

	type TopTrack = {
		id: string
		name: string
		artist: string
		album: string
		albumImage: string | null
		url: string
		duration: number
		popularity: number
	}

	let tracks = $state<TopTrack[] | null>(null)
	let isLoading = $state(true)
	let hasError = $state(false)
	let isRefreshing = $state(false)
	let timeRange = $state<'short_term' | 'medium_term' | 'long_term'>('short_term')

	function formatDuration(ms: number) {
		const minutes = Math.floor(ms / 60_000)
		const seconds = Math.floor((ms % 60_000) / 1000)
		return `${minutes}:${seconds.toString().padStart(2, '0')}`
	}

	async function fetchTracks() {
		try {
			tracks = await trpc.lastfm.getTopTracksByRange.query({ time_range: timeRange })
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

	function exportCsv() {
		if (tracks && tracks.length > 0) exportTopTracksCsv(tracks)
	}

	function exportFile() {
		if (tracks) exportJson('top-tracks.json', tracks)
	}

	$effect(() => {
		fetchTracks()
	})
</script>

<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
	<div class="p-6 pb-0">
		<h3 class="text-base font-medium sm:text-lg">{labels['top-songs.title']}</h3>
		<p class="text-text-secondary text-xs sm:text-sm">{labels['top-songs.subtitle']}</p>
		<div class="mt-3 flex flex-wrap items-center gap-2">
			<TimeRangeToggle value={timeRange} onChange={(v) => (timeRange = v)} {labels} />
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
	<div class="p-6">
		{#if isLoading}
			<div class="space-y-4">
				{#each Array.from({ length: 5 }) as _, i (i)}
					<div class="flex items-center space-x-4">
						<div class="yu-skeleton h-12 w-12 rounded-lg"></div>
						<div class="flex-1 space-y-2">
							<div class="yu-skeleton h-4 w-48"></div>
							<div class="yu-skeleton h-3 w-32"></div>
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
		{:else if !tracks || tracks.length === 0}
			<div class="flex items-center justify-between">
				<p class="text-text-secondary">{labels['top-songs.no-data']}</p>
				<button
					type="button"
					onclick={refresh}
					disabled={isRefreshing}
					class="text-text-secondary hover:text-text-primary text-sm disabled:opacity-50"
				>
					{labels.refresh}
				</button>
			</div>
		{:else}
			<div class="space-y-4">
				{#each tracks as track, index (track.id)}
					<a
						href={track.url}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:bg-bg-hover group flex items-center space-x-4 rounded-lg p-2 transition-colors"
					>
						<div class="bg-bg-hover text-text-secondary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-sm font-medium">
							{index + 1}
						</div>

						<div class="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
							<MusicImage
								src={track.albumImage}
								alt="{track.album} album cover"
								fallbackIcon="play"
								width={48}
								height={48}
							/>
						</div>

						<div class="min-w-0 flex-1">
							<h3 class="group-hover:text-accent-earth-text truncate text-sm font-medium sm:text-base">
								{track.name}
							</h3>
							<p class="text-text-secondary truncate text-xs sm:text-sm">
								{track.artist} • {track.album}
							</p>
						</div>

						<div class="flex-shrink-0 text-right">
							<p class="text-text-secondary text-xs sm:text-sm">{formatDuration(track.duration)}</p>
							<p class="text-text-secondary text-[10px] sm:text-xs">
								{track.popularity} {labels.listeners}
							</p>
						</div>

						<div class="flex-shrink-0">
							<svg
								stroke="currentColor"
								fill="currentColor"
								stroke-width="0"
								viewBox="0 0 496 512"
								height="16"
								width="16"
								xmlns="http://www.w3.org/2000/svg"
								aria-label="Last.fm"
								class="text-accent-earth-text"
							>
								<path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm49.1 346.7c-15.8 4.3-33-3.6-32.9-20.9 0-38.3 43-44.5 43.1-80.1.1-16.1-9.9-25.1-23.7-25.1-13.4 0-21.5 8.1-30.8 19.3L231.7 266.6 216.9 247.5c-9.1-13.2-19.1-17.5-31.5-17.5-16.1 0-27.1 11-27.1 27.2s12.5 27.3 27 27.3c10.3 0 17.6-4.5 24.1-12.2l14.9 18.7c-13.3 11-23.7 17.5-41.9 17.5-31.2 0-51.4-24.3-51.4-53.7s19.8-54 53.6-54c20.3 0 33 9.4 46.5 24.1l11.4 12.8 11.4-12.8c12.2-13.6 27.3-24.1 48.6-24.1 32 0 49.3 22 49.3 48.1.1 44.9-50.3 54.4-50.1 82.2 0 18.3 18.9 22.3 33.3 17.6l2.1 15.1z" />
							</svg>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
