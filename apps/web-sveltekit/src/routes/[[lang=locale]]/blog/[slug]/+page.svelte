<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.post.title}</title>
	<meta name="description" content={data.post.summary} />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-16">
	<article>
		<header class="mb-10">
			<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{data.post.title}</h1>
			<div class="text-muted-foreground mt-4 flex items-center gap-4 text-sm">
				<time datetime={data.post.date}>
					{new Date(data.post.date).toLocaleDateString(data.locale)}
				</time>
				{#if data.post.readingTime}
					<span>{data.post.readingTime} min</span>
				{/if}
			</div>
		</header>

		<!-- Rendered at build time by the content pipeline; no framework runtime. -->
		<div class="prose prose-invert w-full">
			{@html data.post.html}
		</div>
	</article>
</main>
