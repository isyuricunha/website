<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalPath} />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-16">
	<article>
		<h1 class="mb-10 text-3xl font-bold tracking-tight">{data.title}</h1>
		<div class="prose prose-invert w-full">
			{@html data.html}
		</div>
	</article>
</main>
