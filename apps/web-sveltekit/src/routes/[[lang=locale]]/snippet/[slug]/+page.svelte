<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.snippet.title}</title>
	<meta name="description" content={data.snippet.description} />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-16">
	<article>
		<h1 class="mb-4 text-3xl font-bold tracking-tight">{data.snippet.title}</h1>
		<div class="text-muted-foreground mb-10 text-sm">
			<time datetime={data.snippet.date}>
				{new Date(data.snippet.date).toLocaleDateString(data.locale)}
			</time>
		</div>
		<div class="prose prose-invert w-full">
			{@html data.snippet.html}
		</div>
	</article>
</main>
