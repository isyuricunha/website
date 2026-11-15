<script lang="ts">
	type PostLike = {
		slug: string
		title: string
		summary: string
		date: string
	}

	type Props = {
		strings: { card: string; title: string; more: string }
		locale: string
		featured: PostLike
		supporting: PostLike | null
	}

	let { strings, locale, featured, supporting }: Props = $props()

	const formatDate = (date: string) => new Date(date).toLocaleDateString(locale)
</script>

<section class="editorial-section">
	<div class="editorial-text">
		<span class="label-mono">{strings.card}</span>
		<h2>{strings.title}</h2>
		<p>{featured.summary}</p>
		<a href="/blog" class="cta-link">
			{strings.more}
			{' '}
			<span class="yu-arrow" aria-hidden="true">&rarr;</span>
		</a>
	</div>

	<div class="space-y-4">
		<a href={`/blog/${featured.slug}`} class="app-window yu-lift group block">
			<div class="app-window-chrome">
				<span class="window-dot"></span>
				<span class="window-dot"></span>
				<span class="window-dot"></span>
				<span class="label-mono ml-2 truncate normal-case">{formatDate(featured.date)}</span>
			</div>
			<div class="bg-bg-surface relative aspect-[16/9] overflow-hidden">
				<img
					src={`/images/blog/${featured.slug}/cover.png`}
					alt={featured.title}
					width="1280"
					height="832"
					loading="lazy"
					class="absolute inset-0 h-full w-full object-cover brightness-[0.78] saturate-[0.85]"
				/>
			</div>
			<div class="p-5">
				<h3 class="text-lg font-medium">{featured.title}</h3>
				<p class="text-muted-foreground mt-2 line-clamp-2 text-sm">{featured.summary}</p>
			</div>
		</a>

		{#if supporting}
			<a href={`/blog/${supporting.slug}`} class="block rounded-lg border border-[var(--border-subtle)] p-5 transition-colors hover:bg-bg-hover">
				<h3 class="text-base font-medium">{supporting.title}</h3>
				<p class="text-muted-foreground mt-2 line-clamp-2 text-sm">{supporting.summary}</p>
			</a>
		{/if}
	</div>
</section>
