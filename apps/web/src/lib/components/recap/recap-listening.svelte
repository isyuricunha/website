<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'

	type Props = {
		labels: Record<string, string>
	}

	let { labels }: Props = $props()

	type Artist = Awaited<ReturnType<typeof trpc.lastfm.getTopArtistsByRange.query>>[number]
	type Track = Awaited<ReturnType<typeof trpc.lastfm.getTopTracksByRange.query>>[number]

	let artists = $state<Artist[] | null>(null)
	let tracks = $state<Track[] | null>(null)
	let status = $state<'pending' | 'error' | 'success'>('pending')

	$effect(() => {
		Promise.all([
			trpc.lastfm.getTopArtistsByRange.query({ time_range: 'year_term' }),
			trpc.lastfm.getTopTracksByRange.query({ time_range: 'year_term' })
		])
			.then(([artistsResult, tracksResult]) => {
				artists = artistsResult
				tracks = tracksResult
				status = 'success'
			})
			.catch(() => {
				status = 'error'
			})
	})

	const showState = (list: unknown[] | null) =>
		status === 'pending' ? labels['loading'] : status === 'error' || !list || list.length === 0 ? labels['no-data'] : null

	const cardTitle = 'flex flex-wrap items-center gap-2 text-base font-medium'
	const playCount = 'text-text-secondary text-xs tabular-nums'
</script>

<div class="grid min-w-0 gap-8 lg:grid-cols-2">
	<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
		<h3 class={cardTitle}>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
				<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
				<circle cx="12" cy="7" r="4" />
			</svg>
			{labels['listening.top-artists']}
			<span class="text-text-secondary text-sm font-normal">{labels['period']}</span>
		</h3>
		<div class="mt-4">
			{#if showState(artists)}
				<p class="text-text-secondary text-sm">{showState(artists)}</p>
			{:else}
				<ul class="space-y-4">
					{#each (artists ?? []) as artist (artist.id)}
						<li class="flex min-w-0 items-center gap-4">
							<img
								src={artist.image ?? ''}
								alt={`${artist.name} artist photo`}
								width="48"
								height="48"
								loading="lazy"
								class="h-12 w-12 shrink-0 rounded-md border border-[var(--border-subtle)] object-cover"
							/>
							<div class="min-w-0 flex-1">
								<a href={artist.url} target="_blank" rel="noopener noreferrer" class="block truncate text-sm hover:underline">
									{artist.name}
								</a>
								<p class={playCount}>{artist.followers.toLocaleString()} {labels['listening.plays']}</p>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
		<h3 class={cardTitle}>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
				<path d="M9 18V5l12-2v13" />
				<circle cx="6" cy="18" r="3" />
				<circle cx="18" cy="16" r="3" />
			</svg>
			{labels['listening.top-tracks']}
			<span class="text-text-secondary text-sm font-normal">{labels['period']}</span>
		</h3>
		<div class="mt-4">
			{#if showState(tracks)}
				<p class="text-text-secondary text-sm">{showState(tracks)}</p>
			{:else}
				<ul class="space-y-4">
					{#each (tracks ?? []) as track (track.id)}
						<li class="flex min-w-0 items-center gap-4">
							<img
								src={track.image ?? ''}
								alt={`${track.name} album art`}
								width="48"
								height="48"
								loading="lazy"
								class="h-12 w-12 shrink-0 rounded-md border border-[var(--border-subtle)] object-cover"
							/>
							<div class="min-w-0 flex-1">
								<a href={track.url} target="_blank" rel="noopener noreferrer" class="block truncate text-sm hover:underline">
									{track.name}
								</a>
								<p class={playCount}>{track.playcount.toLocaleString()} {labels['listening.plays']}</p>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>
