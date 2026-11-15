<script lang="ts">
	import NowListeningSection from '#lib/components/music/now-listening-section.svelte'
	import MusicStatsSection from '#lib/components/music/music-stats-section.svelte'
	import ListeningHeatmap from '#lib/components/music/listening-heatmap.svelte'
	import TopArtistsSection from '#lib/components/music/top-artists-section.svelte'
	import TopSongsSection from '#lib/components/music/top-songs-section.svelte'
	import RecentlyPlayedSection from '#lib/components/music/recently-played-section.svelte'
	import MusicTimeline from '#lib/components/music/music-timeline.svelte'
	import SocialSharing from '#lib/components/music/social-sharing.svelte'
	import LocalHistoryImport from '#lib/components/music/local-history-import.svelte'
	import { SITE_NAME, SITE_URL } from '#lib/constants.ts'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: data.labels.title,
		description: data.labels.description,
		url: `${SITE_URL}${data.canonicalPath}`,
		mainEntity: {
			'@type': 'Person',
			name: SITE_NAME,
			description: data.siteDescription,
			url: SITE_URL
		}
	})
</script>

<svelte:head>
	<title>{data.labels.title}</title>
	<meta name="description" content={data.labels.description} />
	<link rel="canonical" href={data.canonicalPath} />
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}<\/script>`}
</svelte:head>

<main class="mx-auto max-w-5xl px-6 py-16">
	<h1 class="mb-3 text-3xl font-bold tracking-tight">{data.labels.title}</h1>
	<p class="text-muted-foreground mb-10">{data.labels.description}</p>

	<div class="space-y-20">
		<section class="grid min-w-0 gap-8 lg:grid-cols-[1.25fr_0.85fr] lg:items-start">
			<div class="cursor-reveal min-w-0">
				<NowListeningSection labels={data.labels} />
			</div>
			<div class="cursor-reveal cursor-reveal-delay-1 min-w-0">
				<MusicStatsSection labels={data.labels} />
			</div>
		</section>

		<section class="grid min-w-0 gap-8 border-t-[0.5px] border-[var(--border-faint)] pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
			<div class="space-y-3">
				<span class="label-mono">{data.labels['sections.listening-data.label']}</span>
				<h2 class="max-w-lg text-[clamp(28px,3vw,40px)] font-medium tracking-tighter">
					{data.labels['sections.listening-data.title']}
				</h2>
			</div>
			<div class="cursor-reveal cursor-reveal-delay-1 min-w-0">
				<ListeningHeatmap labels={data.labels} />
			</div>
		</section>

		<section class="grid min-w-0 gap-8 border-t-[0.5px] border-[var(--border-faint)] pt-20 lg:grid-cols-2">
			<div class="cursor-reveal min-w-0">
				<TopArtistsSection labels={data.labels} />
			</div>
			<div class="cursor-reveal cursor-reveal-delay-1 min-w-0">
				<TopSongsSection labels={data.labels} />
			</div>
		</section>

		<section class="grid gap-8 border-t-[0.5px] border-[var(--border-faint)] pt-20 lg:grid-cols-[0.95fr_1.05fr]">
			<div class="cursor-reveal">
				<RecentlyPlayedSection labels={data.labels} />
			</div>
			<div class="cursor-reveal cursor-reveal-delay-1">
				<MusicTimeline labels={data.labels} locale={data.locale} />
			</div>
		</section>

		<section class="grid gap-8 border-t-[0.5px] border-[var(--border-faint)] pt-20">
			<div class="cursor-reveal">
				<SocialSharing labels={data.labels} locale={data.locale} />
			</div>
			<LocalHistoryImport labels={data.labels} />
		</section>
	</div>
</main>
