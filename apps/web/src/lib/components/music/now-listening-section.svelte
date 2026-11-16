<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import MusicImage from './music-image.svelte'

	let { labels }: { labels: Record<string, string> } = $props()

	type CurrentTrack = {
		name: string
		artist: string
		album: string
		albumImage: string | null
		songUrl: string
		isPlaying: boolean
	}

	let currentTrack = $state<CurrentTrack | null>(null)
	let isLoading = $state(true)
	let hasError = $state(false)
	let isRefreshing = $state(false)
	let interval: ReturnType<typeof setInterval> | undefined

	async function fetchTrack() {
		try {
			currentTrack = await trpc.lastfm.getCurrentlyPlaying.query()
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
		fetchTrack()
	}

	$effect(() => {
		fetchTrack()
		interval = setInterval(fetchTrack, 60_000)
		return () => clearInterval(interval)
	})
</script>

<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
	<div class="flex items-center justify-between p-6 pb-0">
		<div>
			<h3 class="text-base font-medium sm:text-lg">{labels['now-listening.title']}</h3>
			<p class="text-text-secondary text-xs sm:text-sm">{labels['now-listening.subtitle']}</p>
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
			<div class="flex items-center space-x-4">
				<div class="bg-bg-hover h-16 w-16 animate-pulse rounded-lg"></div>
				<div class="space-y-2">
					<div class="bg-bg-hover h-4 w-48 animate-pulse rounded"></div>
					<div class="bg-bg-hover h-3 w-32 animate-pulse rounded"></div>
				</div>
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
		{:else if !currentTrack}
			<div class="flex items-center justify-between">
				<p class="text-text-secondary">{labels['not-playing']}</p>
				<button
					type="button"
					onclick={refresh}
					disabled={isRefreshing}
					class="text-text-secondary hover:text-text-primary text-sm disabled:opacity-50"
				>
					{labels.refresh}
				</button>
			</div>
		{:else if currentTrack}
			<a
				href={currentTrack.songUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="hover:bg-bg-hover group flex items-center space-x-4 rounded-lg p-4 transition-colors"
			>
				<div class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
					<MusicImage
						src={currentTrack.albumImage}
						alt="{currentTrack.album} album cover"
						fallbackIcon="play"
						width={64}
						height={64}
					/>
					{#if currentTrack.isPlaying}
						<div class="bg-bg-base/20 absolute inset-0 flex items-center justify-center">
							<div class="flex space-x-1">
								<div class="bg-foreground/80 h-1 w-1 animate-pulse rounded-full"></div>
								<div class="bg-foreground/80 h-1 w-1 animate-pulse rounded-full [animation-delay:150ms]"></div>
								<div class="bg-foreground/80 h-1 w-1 animate-pulse rounded-full [animation-delay:300ms]"></div>
							</div>
						</div>
					{/if}
				</div>

				<div class="min-w-0 flex-1">
					<h3 class="group-hover:text-accent-earth-text truncate text-sm font-medium sm:text-base">
						{currentTrack.name}
					</h3>
					<p class="text-text-secondary truncate text-xs sm:text-sm">
						{currentTrack.artist} {labels['now-listening.by']} {currentTrack.album}
					</p>
				</div>

				<div class="flex-shrink-0">
					<div class="relative flex h-6 w-6 items-center justify-center">
						{#if currentTrack.isPlaying}
							<div class="flex h-4 items-end gap-[3px]">
								<div class="bg-accent-earth w-[4px] animate-music-bar-1 opacity-80"></div>
								<div class="bg-accent-earth w-[4px] animate-music-bar-2 opacity-80"></div>
								<div class="bg-accent-earth w-[4px] animate-music-bar-3 opacity-80"></div>
							</div>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-5 w-5 opacity-50">
								<path d="M9 18V5l12-2v13" />
								<circle cx="6" cy="18" r="3" />
								<circle cx="18" cy="16" r="3" />
							</svg>
						{/if}
					</div>
				</div>
			</a>
		{/if}
	</div>
</div>
