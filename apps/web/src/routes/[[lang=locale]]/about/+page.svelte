<script lang="ts">
	import PageTitle from '#lib/components/blog/page-title.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalPath} />
</svelte:head>

	<PageTitle title={data.title} description={data.description} />

	<div class="mx-auto grid w-full max-w-6xl gap-12 px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20">
		<aside class="border-[var(--border-faint)] border-t pt-6 lg:sticky lg:top-28 lg:self-start">
			<span class="label-mono">{data.title}</span>
			<p class="text-text-secondary mt-4 text-[15px] leading-relaxed">{data.description}</p>
		</aside>
		<article class="prose prose-invert min-w-0 w-full">
			{@html data.html}
		</article>
	</div>
