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
	<h1 class="mb-10 text-3xl font-bold tracking-tight">{data.title}</h1>
	<ul class="flex flex-col gap-6">
		{#each data.snippets as snippet (snippet.slug)}
			<li>
				<a
					href={data.locale === 'en'
						? `/snippet/${snippet.slug}`
						: `/${data.locale}/snippet/${snippet.slug}`}
					class="block rounded-lg border p-5 transition-colors hover:bg-accent/50"
				>
					<h2 class="text-xl font-semibold">{snippet.title}</h2>
					<p class="text-muted-foreground mt-1 text-sm">{snippet.description}</p>
					<div class="text-muted-foreground mt-3 text-xs">
						<time datetime={snippet.date}>
							{new Date(snippet.date).toLocaleDateString(data.locale)}
						</time>
					</div>
				</a>
			</li>
		{/each}
	</ul>
</main>
