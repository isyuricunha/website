<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import SocialShare from '../social-share.svelte'
	import MusicImage from './music-image.svelte'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type CurrentTrack = { name: string; artist: string; album: string; albumImage: string | null; songUrl: string; url?: string }
	type TopTrack = { id: string; name: string; artist: string; album: string; albumImage: string | null; url: string }

	let currentTrack = $state<CurrentTrack | null>(null)
	let topTracks = $state<TopTrack[] | null>(null)
	let copiedTrack = $state<string | null>(null)

	function shareTrack(track: CurrentTrack | TopTrack, platform: 'twitter' | 'facebook' | 'copy') {
		const shareText = formatMessage(
			labels['social.share-text'],
			{
				name: track.name,
				artist: track.artist
			},
			locale
		)
		const shareUrl: string = track.url || ('songUrl' in track ? track.songUrl : '')

		switch (platform) {
			case 'twitter':
				window.open(
					`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
					'_blank'
				)
				break
			case 'facebook':
				window.open(
					`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
					'_blank'
				)
				break
			case 'copy':
				navigator.clipboard
					.writeText(`${shareText} ${shareUrl}`)
					.then(() => {
						copiedTrack = shareUrl
						setTimeout(() => (copiedTrack = null), 2000)
					})
					.catch((error) => console.error('Failed to copy to clipboard:', error))
				break
		}
	}

	let featuredTracks = $derived(topTracks?.slice(0, 3) || [])

	$effect(() => {
		trpc.lastfm.getCurrentlyPlaying
			.query()
			.then((track) => (currentTrack = track as CurrentTrack))
			.catch(() => {})
		trpc.lastfm.getTopTracks
			.query()
			.then((tracks) => (topTracks = tracks as TopTrack[]))
			.catch(() => {})
	})
</script>

<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
	<div class="p-6 pb-0">
		<h3 class="flex items-center gap-2 text-base font-medium sm:text-lg">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
				<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
				<line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
			</svg>
			{labels['social.title']}
		</h3>
		<p class="text-text-secondary text-xs sm:text-sm">{labels['social.subtitle']}</p>
	</div>
	<div class="space-y-6 p-6">
		{#if currentTrack}
			{@const track = currentTrack}
			<div>
				<h4 class="mb-3 text-sm font-medium sm:text-base">{labels['social.now-playing']}</h4>
				<div class="bg-bg-hover flex items-center gap-3 rounded-lg p-3">
					<div class="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
						<MusicImage
							src={currentTrack.albumImage}
							alt="{currentTrack.album} album cover"
							width={48}
							height={48}
						/>
					</div>
					<div class="min-w-0 flex-1">
						<h5 class="truncate text-sm font-medium sm:text-base">{currentTrack.name}</h5>
						<p class="text-text-secondary truncate text-xs sm:text-sm">{currentTrack.artist}</p>
					</div>
					<div class="flex items-center gap-1">
						<button
							type="button"
							onclick={() => shareTrack(track, 'twitter')}
							class="hover:bg-bg-hover rounded-lg p-2 transition-colors"
							title={labels['social.buttons.twitter']}
							aria-label={labels['social.buttons.twitter']}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-4 w-4">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
						</button>
						<button
							type="button"
							onclick={() => shareTrack(track, 'facebook')}
							class="hover:bg-bg-hover rounded-lg p-2 transition-colors"
							title={labels['social.buttons.facebook']}
							aria-label={labels['social.buttons.facebook']}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-4 w-4">
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
							</svg>
						</button>
						<button
							type="button"
							onclick={() => shareTrack(track, 'copy')}
							class="hover:bg-bg-hover rounded-lg p-2 transition-colors"
							title={labels['social.buttons.copy']}
							aria-label={labels['social.buttons.copy']}
						>
							{#if copiedTrack === currentTrack.songUrl}
								<span aria-hidden="true" class="text-accent-earth-text text-xs">✓</span>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
									<rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
								</svg>
							{/if}
						</button>
					</div>
				</div>
			</div>
		{/if}

		{#if featuredTracks.length > 0}
			<div>
				<h4 class="mb-3 text-sm font-medium sm:text-base">{labels['social.top-tracks']}</h4>
				<div class="space-y-3">
					{#each featuredTracks as track, index (track.url ?? track.id ?? index)}
						<div class="bg-bg-surface hover:bg-bg-hover flex items-center gap-3 rounded-lg p-3 transition-colors">
							<div class="bg-accent-earth text-text-inverse flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
								{index + 1}
							</div>
							<div class="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
								<MusicImage
									src={track.albumImage}
									alt="{track.album} album cover"
									width={40}
									height={40}
								/>
							</div>
							<div class="min-w-0 flex-1">
								<h5 class="truncate text-xs font-medium sm:text-sm">{track.name}</h5>
								<p class="text-text-secondary truncate text-[10px] sm:text-xs">{track.artist}</p>
							</div>
							<div class="flex items-center gap-1">
								<button
									type="button"
									onclick={() => shareTrack(track, 'twitter')}
									class="hover:bg-bg-hover rounded-lg p-1.5 transition-colors"
									title={labels['social.buttons.twitter']}
									aria-label={labels['social.buttons.twitter']}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-3 w-3">
										<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
									</svg>
								</button>
								<button
									type="button"
									onclick={() => shareTrack(track, 'facebook')}
									class="hover:bg-bg-hover rounded-lg p-1.5 transition-colors"
									title={labels['social.buttons.facebook']}
									aria-label={labels['social.buttons.facebook']}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="h-3 w-3">
										<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
									</svg>
								</button>
								<button
									type="button"
									onclick={() => shareTrack(track, 'copy')}
									class="hover:bg-bg-hover rounded-lg p-1.5 transition-colors"
									title={labels['social.buttons.copy']}
									aria-label={labels['social.buttons.copy']}
								>
									{#if copiedTrack === track.url}
										<span aria-hidden="true" class="text-accent-earth-text text-xs">✓</span>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
											<rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
										</svg>
									{/if}
								</button>
								<a
									href={track.url}
									target="_blank"
									rel="noopener noreferrer"
									class="hover:bg-bg-hover rounded-lg p-1.5 transition-colors"
									title={labels['social.buttons.open']}
									aria-label={labels['social.buttons.open']}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
										<path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
									</svg>
								</a>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="border-t pt-4">
			<h4 class="mb-3 text-sm font-medium sm:text-base">{labels['social.profile.title']}</h4>
			<div class="flex justify-center">
				<SocialShare
					title={labels['social.profile.share-title']}
					url="/music"
					description={labels['social.profile.share-description']}
					hashtags={['music', 'lastfm', 'nowplaying']}
					className="w-full"
					{labels}
				/>
			</div>
		</div>
	</div>
</div>
