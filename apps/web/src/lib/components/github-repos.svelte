<script lang="ts">
	let { repos }: { repos: Repo[] } = $props()

	type Repo = {
		name: string
		description?: string | null
		stargazersCount: number
		forksCount?: number
		openIssuesCount?: number
		language?: string | null
		url: string
		updatedAt?: string
	}
</script>

<div class="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
	{#each repos as repo (repo.name)}
		<a
			href={repo.url}
			target="_blank"
			rel="noopener noreferrer"
			class="group relative overflow-hidden rounded-lg border border-[var(--border-subtle)] p-3 transition-all hover:border-[var(--accent-border)] hover:shadow-md"
		>
			<div class="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-muted-foreground h-4 w-4">
					<path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
				</svg>
			</div>

			<div class="space-y-2">
				<div class="space-y-1">
					<h3 class="group-hover:text-accent-earth-text line-clamp-1 pr-8 text-sm font-medium transition-colors">
						{repo.name}
					</h3>
					{#if repo.description}
						<p class="text-muted-foreground line-clamp-2 text-xs">{repo.description}</p>
					{/if}
				</div>

				<div class="text-muted-foreground flex items-center gap-3 text-xs">
					<div class="flex items-center gap-1">
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-3 w-3">
							<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
						</svg>
						<span>{repo.stargazersCount}</span>
					</div>
					{#if repo.forksCount !== undefined}
						<div class="flex items-center gap-1">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
								<circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" />
								<path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" /><path d="M12 12v3" />
							</svg>
							<span>{repo.forksCount}</span>
						</div>
					{/if}
				</div>

				<div class="flex items-center justify-between">
					{#if repo.language}
						<span class="bg-bg-hover inline-flex rounded-full px-2 py-0.5 text-xs font-medium">
							{repo.language}
						</span>
					{/if}
				</div>
			</div>
		</a>
	{/each}
</div>
