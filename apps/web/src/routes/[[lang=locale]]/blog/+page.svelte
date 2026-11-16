<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-16">
	<h1 class="mb-3 text-3xl font-bold tracking-tight">{data.title}</h1>
	<p class="text-muted-foreground mb-10">{data.description}</p>

	<ul class="flex flex-col gap-6">
		{#each data.posts as post (post.slug)}
			<li>
				<a
					href={data.locale === 'en' ? `/blog/${post.slug}` : `/${data.locale}/blog/${post.slug}`}
					class="block rounded-lg border p-5 transition-colors hover:bg-accent/50"
				>
					<h2 class="text-xl font-semibold">{post.title}</h2>
					<p class="text-muted-foreground mt-1 text-sm">{post.summary}</p>
					<div class="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
						<time datetime={post.date}>{new Date(post.date).toLocaleDateString(data.locale)}</time>
						{#if post.readingTime}
							<span>{post.readingTime} min read</span>
						{/if}
					</div>
				</a>
			</li>
		{/each}
	</ul>
</main>
