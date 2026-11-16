<script lang="ts">
	let { items, labels }: { items: UpdatedItem[]; labels: Record<string, string> } = $props()

	type UpdatedItem = {
		id: string
		title: string
		description: string
		href: string
		type: 'post' | 'project'
		date: string
		dateFormatted: string
	}
</script>

<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
	<div class="p-6 pb-0">
		<h3 class="flex items-center gap-2 text-base font-medium sm:text-lg">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
				<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
			</svg>
			{labels['recently-updated.title']}
		</h3>
		<p class="text-muted-foreground text-xs sm:text-sm">{labels['recently-updated.description']}</p>
	</div>
	<div class="p-6">
		<div class="space-y-4">
			{#each items as item (item.id)}
				<a
					href={item.href}
					class="hover:bg-[var(--bg-muted)] group block rounded-lg p-3 transition-colors"
				>
					<div class="flex items-start gap-3">
						<div class="text-muted-foreground group-hover:text-foreground mt-0.5 shrink-0">
							{#if item.type === 'post'}
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
									<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" />
								</svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
									<polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
								</svg>
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<div class="mb-1 flex items-center gap-2">
								<h4 class="group-hover:text-accent-earth-text truncate text-sm font-medium sm:text-base">
									{item.title}
								</h4>
								<span class="text-muted-foreground bg-[var(--bg-muted)] rounded-full px-2 py-0.5 text-xs">
									{labels[item.type === 'post' ? 'recently-updated.type.post' : 'recently-updated.type.project']}
								</span>
							</div>
							<p class="text-muted-foreground mb-2 line-clamp-2 text-xs sm:text-sm">
								{item.description}
							</p>
							<div class="flex items-center gap-1">
								<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-muted-foreground h-3 w-3">
									<path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
								</svg>
								<span class="text-muted-foreground text-xs">
									{labels['recently-updated.updated-on'].replace('{date}', item.dateFormatted)}
								</span>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>

		{#if items.length === 0}
			<div class="py-8 text-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-muted-foreground mx-auto mb-4 h-12 w-12">
					<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
				</svg>
				<p class="text-muted-foreground text-sm">{labels['recently-updated.empty']}</p>
			</div>
		{/if}
	</div>
</div>
