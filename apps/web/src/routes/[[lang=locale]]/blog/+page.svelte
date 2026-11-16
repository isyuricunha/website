<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	// Frontmatter dates are plain YYYY-MM-DD. Parsing without a time treats
	// them as UTC midnight, which shifts the day a day back in UTC-3.
	const formatDate = (date: string) => {
		const parsed = new Date(`${date.slice(0, 10)}T12:00:00`)
		return new Intl.DateTimeFormat(data.locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(parsed)
	}
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-16">
	<nav aria-label="Breadcrumb" class="mb-6 flex items-center gap-2 text-sm">
		<a
			href={data.locale === 'en' ? '/' : `/${data.locale}`}
			class="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
		>
			<svg
				class="size-4"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
			</svg>
			{data.strings.home}
		</a>
		<span class="text-muted-foreground" aria-hidden="true">/</span>
		<span class="text-foreground">{data.strings.blog}</span>
	</nav>

	<h1 class="mb-3 text-3xl font-bold tracking-tight">{data.title}</h1>
	<p class="text-muted-foreground mb-10">{data.description}</p>

	<div class="mb-8 flex items-center justify-end">
		<a
			href="/rss.xml"
			class="inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:underline"
		>
			<svg
				class="size-4"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M13 19a6 6 0 0 0-6-6"></path><path d="M19 19a12 12 0 0 0-12-12"></path><circle cx="6.5" cy="17.5" r="1.5" fill="currentColor" stroke="none"></circle>
			</svg>
			{data.strings.rss}
		</a>
	</div>

	<ul class="flex flex-col gap-6">
		{#each data.posts as post (post.slug)}
			<li>
				<a
					href={data.locale === 'en' ? `/blog/${post.slug}` : `/${data.locale}/blog/${post.slug}`}
					class="cursor-card shadow-feature-card block rounded-lg p-5"
				>
					<h2 class="text-xl font-semibold">{post.title}</h2>
					<p class="text-muted-foreground mt-1 text-sm">{post.summary}</p>
					<div class="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
						<time datetime={post.date}>{formatDate(post.date)}</time>
						{#if post.readingTime}
							<span>{post.readingTimeLabel}</span>
						{/if}
					</div>
				</a>
			</li>
		{/each}
	</ul>
</main>
