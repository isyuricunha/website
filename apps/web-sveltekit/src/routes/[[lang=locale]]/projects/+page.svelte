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
	<ul class="grid grid-cols-1 gap-5 sm:grid-cols-2">
		{#each data.projects as project (project.slug)}
			<li>
				<a
					href={data.locale === 'en'
						? `/projects/${project.slug}`
						: `/${data.locale}/projects/${project.slug}`}
					class="bg-bg-surface hover:bg-bg-hover block h-full rounded-lg border border-[var(--border-subtle)] p-5 no-underline transition-colors"
				>
					<div class="flex items-center justify-between gap-2">
						<h2 class="text-lg font-semibold">{project.name}</h2>
						{#if project.status === 'archived'}
							<span class="text-muted-foreground text-xs uppercase">archived</span>
						{/if}
					</div>
					<p class="text-muted-foreground mt-2 text-sm">{project.description}</p>
					<div class="mt-3 flex flex-wrap gap-1.5">
						{#each project.techstack.slice(0, 6) as tech (tech)}
							<span class="bg-muted/20 text-muted-foreground rounded px-1.5 py-0.5 text-xs">
								{tech}
							</span>
						{/each}
					</div>
				</a>
			</li>
		{/each}
	</ul>
</main>
