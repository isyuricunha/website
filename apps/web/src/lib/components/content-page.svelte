<script lang="ts">
	import type { Page } from 'content-collections'

	let {
		page,
		head
	}: { page: Page; head: { title: string; description: string; canonicalPath: string } } = $props()
</script>

<svelte:head>
	<title>{head.title}</title>
	<meta name="description" content={head.description} />
	<link rel="canonical" href={head.canonicalPath} />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-16">
	<article class="prose prose-invert w-full">
		{@html page.html}
	</article>
</main>
