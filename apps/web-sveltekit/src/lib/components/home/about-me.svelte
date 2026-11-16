<script lang="ts">
	import CodingHours from './coding-hours.svelte'
	import Connect from './connect.svelte'
	import FavoriteFramework from './favorite-framework.svelte'
	import LocationCard from './location-card.svelte'
	import StacksCard from './stacks-card.svelte'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()
</script>

<div class="border-t border-[var(--border-faint)] py-24">
	<div class="mb-12 flex max-w-2xl flex-col gap-4">
		<span class="label-mono">{labels['about-me.title']}</span>
		<h2 class="text-[clamp(28px,3vw,40px)] font-medium tracking-tighter">
			{labels['get-in-touch.title']}
		</h2>
	</div>
	<div class="grid gap-4 md:grid-cols-2">
		<div class="grid gap-4">
			<LocationCard {labels} />
			<StacksCard {labels} />
		</div>
		<div class="grid gap-4">
			<Connect {labels} />
			<div class="grid gap-4 [@media(min-width:450px)]:grid-cols-2">
				<CodingHours {labels} {locale} />
				<FavoriteFramework {labels} />
			</div>
		</div>
	</div>
	<div class="mt-8">
		<a href={locale === 'en' ? '/about' : `/${locale}/about`} class="cta-link">
			{labels['about-me.more']}
			<span class="yu-arrow" aria-hidden="true">→</span>
		</a>
	</div>
</div>
