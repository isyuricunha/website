<script lang="ts">
	type ProjectLike = {
		slug: string
		name: string
		description: string
	}

	type Props = {
		strings: { card: string; title: string; more: string }
		featured: ProjectLike
		supporting: ProjectLike[]
	}

	let { strings, featured, supporting }: Props = $props()
</script>

<section class="editorial-section">
	<div class="editorial-text">
		<span class="label-mono">{strings.card}</span>
		<h2>{strings.title}</h2>
		<p>{featured.description}</p>
		<a href="/projects" class="cta-link">
			{strings.more}
			{' '}
			<span class="yu-arrow" aria-hidden="true">&rarr;</span>
		</a>
	</div>

	<div class="space-y-4">
		<a
			href={`/projects/${featured.slug}`}
			class="app-window yu-lift group focus-visible:ring-ring block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			<div class="app-window-chrome">
				<span class="window-dot"></span>
				<span class="window-dot"></span>
				<span class="window-dot"></span>
				<span class="label-mono ml-2 truncate normal-case">{featured.name}</span>
			</div>
			<div class="bg-bg-surface relative aspect-[16/9] w-full overflow-hidden">
				<img
					src={`/images/projects/${featured.slug}/cover.png`}
					alt={featured.description}
					width="1280"
					height="832"
					loading="lazy"
					class="absolute inset-0 h-full w-full object-cover brightness-[0.78] saturate-[0.85]"
				/>
			</div>
			<div class="flex items-start justify-between gap-4 p-5">
				<div>
					<h3 class="text-foreground text-base font-medium sm:text-lg">{featured.name}</h3>
					<p class="text-muted-foreground mt-2 text-sm">{featured.description}</p>
				</div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
					class="text-accent-earth-text mt-1 size-4 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
				>
					<path d="M7 7h10v10" />
					<path d="M7 17 17 7" />
				</svg>
			</div>
		</a>

		{#if supporting.length > 0}
			<div class="card-grid">
				{#each supporting as project (project.slug)}
					<a href={`/projects/${project.slug}`} class="cursor-card block p-5">
						<h3 class="text-base font-medium">{project.name}</h3>
						<p class="mt-2 line-clamp-2 text-sm">{project.description}</p>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>
