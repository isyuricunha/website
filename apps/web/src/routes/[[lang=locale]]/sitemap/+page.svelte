<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	// 4x4 viewBox scaled paths from src/lib/links.ts, rendered inline.
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalPath} />
</svelte:head>

<div class="mx-auto max-w-5xl px-6">
	<h1
		class="mb-2 text-[clamp(32px,4vw,52px)] font-normal tracking-tighter"
	>
		{data.title}
	</h1>
	<p class="text-muted-foreground mb-10">{data.description}</p>

	<div class="space-y-8">
		<section class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
			<h2 class="mb-1 flex items-center gap-2 text-base sm:text-lg">
				<svg
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle>
					<line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line
						x1="14.83"
						y1="14.83"
						x2="19.07"
						y2="19.07"
					></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line
						x1="4.93"
						y1="19.07"
						x2="9.17"
						y2="14.83"
					></line>
				</svg>
				{data.strings.mainPages.title}
			</h2>
			<p class="text-muted-foreground mb-4 text-xs sm:text-sm">
				{data.strings.mainPages.description}
			</p>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				{#each data.mainPages as page (page.href)}
					<a
						href={page.href}
						class="hover:bg-muted/50 group block rounded-lg border border-[var(--border-subtle)] p-4 transition-colors"
					>
						<div class="flex items-start gap-3">
							<div class="text-muted-foreground group-hover:text-foreground mt-0.5 shrink-0">
								<svg
									class="size-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									{#each page.icon.split('|') as segment}
										<path d={segment}></path>
									{/each}
								</svg>
							</div>
							<div>
								<h3 class="group-hover:text-accent-earth-text mb-1 text-sm font-medium sm:text-base">
									{page.title}
								</h3>
								<p class="text-muted-foreground text-xs sm:text-sm">{page.description}</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</section>

		<section class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
			<h2 class="mb-4 flex items-center gap-2 text-base sm:text-lg">
				{data.strings.blogPosts.title} ({data.posts.length})
			</h2>
			<p class="text-muted-foreground -mt-3 mb-4 text-xs sm:text-sm">
				{data.strings.blogPosts.description}
			</p>
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{#each data.posts as post (post.href)}
					<a
						href={post.href}
						class="hover:bg-muted/50 group flex items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] p-3 transition-colors"
					>
						<span class="group-hover:text-accent-earth-text truncate text-sm">
							{post.title}
						</span>
						<span class="text-muted-foreground shrink-0 text-xs">{post.date}</span>
					</a>
				{/each}
			</div>
		</section>

		<section class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
			<h2 class="mb-4 flex items-center gap-2 text-base sm:text-lg">
				{data.strings.projects.title} ({data.projects.length})
			</h2>
			<p class="text-muted-foreground -mt-3 mb-4 text-xs sm:text-sm">
				{data.strings.projects.description}
			</p>
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{#each data.projects as project (project.href)}
					<a
						href={project.href}
						class="hover:bg-muted/50 group flex items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] p-3 transition-colors"
					>
						<span class="group-hover:text-accent-earth-text truncate text-sm">
							{project.name}
						</span>
						{#if project.homepage}
							<span class="text-muted-foreground shrink-0 text-xs">
								{data.strings.labels.liveDemo}
							</span>
						{/if}
					</a>
				{/each}
			</div>
		</section>

		<section class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
			<h2 class="mb-4 flex items-center gap-2 text-base sm:text-lg">
				{data.strings.snippets.title} ({data.snippets.length})
			</h2>
			<p class="text-muted-foreground -mt-3 mb-4 text-xs sm:text-sm">
				{data.strings.snippets.description}
			</p>
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{#each data.snippets as snippet (snippet.href)}
					<a
						href={snippet.href}
						class="hover:bg-muted/50 group flex items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] p-3 transition-colors"
					>
						<span class="group-hover:text-accent-earth-text truncate text-sm">
							{snippet.title}
						</span>
						<span class="text-muted-foreground shrink-0 text-xs">{snippet.date}</span>
					</a>
				{/each}
			</div>
		</section>
	</div>
</div>
