<script lang="ts">
	import { formatMessage } from '#lib/i18n/format.ts'

	let {
		projects,
		locale,
		labels
	}: {
		projects: Project[]
		locale: string
		labels: Record<string, string>
	} = $props()

	type Project = {
		slug: string
		name: string
		description: string
		techstack: string[]
		status?: 'active' | 'archived' | 'beta' | 'completed' | string
		category?: string
		featured?: boolean
		homepage?: string
		repository?: string
		github?: string
		startDate?: string
		endDate?: string
	}

	const statusPriority: Record<string, number> = { active: 0, beta: 1, completed: 2, archived: 3 }

	function compareStrings(a: string, b: string) {
		if (a < b) return -1
		if (a > b) return 1
		return 0
	}

	let filters = $state<{ search: string; category: string; status: string; techStack: string }>({
		search: '',
		category: 'all',
		status: 'all',
		techStack: 'all'
	})
	let showFilters = $state(false)

	let unique = $derived.by(() => {
		const categorySet = new Set<string>()
		const statusSet = new Set<string>()
		const techStackSet = new Set<string>()

		for (const project of projects) {
			if (project.category) categorySet.add(project.category)
			if (project.status) statusSet.add(project.status)
			for (const tech of project.techstack) techStackSet.add(tech)
		}

		return {
			categories: Array.from(categorySet).toSorted(compareStrings),
			statuses: Array.from(statusSet).toSorted(compareStrings),
			techStacks: Array.from(techStackSet).toSorted(compareStrings)
		}
	})

	let filteredProjects = $derived.by(() => {
		return projects
			.filter((project) => {
				const matchesSearch =
					filters.search === '' ||
					project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
					project.description.toLowerCase().includes(filters.search.toLowerCase())

				const matchesCategory = filters.category === 'all' || project.category === filters.category
				const matchesStatus = filters.status === 'all' || project.status === filters.status
				const matchesTechStack =
					filters.techStack === 'all' || project.techstack.includes(filters.techStack)

				return matchesSearch && matchesCategory && matchesStatus && matchesTechStack
			})
			.toSorted((a, b) => {
				if (a.featured && !b.featured) return -1
				if (!a.featured && b.featured) return 1

				return (statusPriority[a.status ?? 'active'] ?? 0) - (statusPriority[b.status ?? 'active'] ?? 0)
			})
	})

	let hasActiveFilters = $derived(
		filters.search !== '' ||
			filters.category !== 'all' ||
			filters.status !== 'all' ||
			filters.techStack !== 'all'
	)
	let featuredProjects = $derived(filteredProjects.filter((project) => project.featured))
	let regularProjects = $derived(filteredProjects.filter((project) => !project.featured))

	function clearFilters() {
		filters = { search: '', category: 'all', status: 'all', techStack: 'all' }
	}

	function projectHref(slug: string) {
		return locale === 'en' ? `/projects/${slug}` : `/${locale}/projects/${slug}`
	}

	function statusLabel(status: string | undefined) {
		if (!status) return ''
		return labels[`status.${status}`] ?? status
	}

	function year(value: string | undefined) {
		return value ? new Date(value).getFullYear() : null
	}
</script>

{#snippet projectCard(project: Project)}
	{@const statusBadge = project.status
		? {
				color:
					project.status === 'archived'
						? 'bg-[var(--bg-muted)] text-muted-foreground border-[var(--border-default)]'
						: 'bg-[var(--accent-dim)] text-accent-earth-text border-[var(--accent-border)]'
			}
		: null}
	<div class="group relative overflow-hidden rounded-lg border border-[var(--border-subtle)]">
		<a
			href={projectHref(project.slug)}
			aria-label={formatMessage(labels['card.open-aria'], { name: project.name }, locale)}
			class="focus-visible:ring-ring absolute inset-0 z-[5] rounded-lg focus-visible:ring-2 focus-visible:outline-none"
		>
			<span class="sr-only">{formatMessage(labels['card.open'], { name: project.name }, locale)}</span>
		</a>

		<div class="absolute top-3 left-3 z-10 flex gap-2">
			{#if project.featured}
				<span class="text-accent-earth-text border-[var(--accent-border)] inline-flex items-center gap-1 rounded-full border bg-[var(--accent-dim)] px-2.5 py-0.5 text-xs font-medium">
					<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-1 h-3 w-3">
						<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
					</svg>
					{labels['card.featured']}
				</span>
			{/if}
			{#if project.status}
				<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {statusBadge?.color}">
					{statusLabel(project.status)}
				</span>
			{/if}
		</div>

		<div class="relative overflow-hidden">
			<img
				src="/images/projects/{project.slug}/cover.png"
				width="1280"
				height="832"
				alt={project.name}
				loading="lazy"
				class="aspect-video w-full object-cover brightness-[0.78] saturate-[0.85] transition-transform duration-500 group-hover:scale-[1.03]"
			/>
		</div>

		<div class="space-y-4 p-4">
			{#if project.repository || project.github || project.homepage}
				<div class="relative z-20 -mt-2 flex items-center justify-start gap-2">
					{#if project.repository || project.github}
						<a
							href={project.repository || project.github}
							target="_blank"
							rel="noopener noreferrer"
							title={labels['card.github.title']}
							aria-label={labels['card.github.aria']}
							class="bg-bg-hover text-foreground hover:bg-bg-active relative z-10 inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-subtle)] px-2 shadow-sm transition-colors md:px-3"
						>
							<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4">
								<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
							</svg>
							<span class="hidden overflow-hidden text-xs font-medium md:inline-block md:max-w-0 md:opacity-0 md:transition-all md:group-hover:max-w-[64px] md:group-hover:opacity-100">
								{labels['card.github.label']}
							</span>
						</a>
					{/if}
					{#if project.homepage}
						<a
							href={project.homepage}
							target="_blank"
							rel="noopener noreferrer"
							title={labels['card.live.title']}
							aria-label={labels['card.live.aria']}
							class="border-accent-earth-hover bg-accent-earth text-text-inverse hover:bg-accent-earth-hover relative z-10 inline-flex h-9 items-center gap-2 rounded-md border px-2 shadow-sm transition-colors md:px-3"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
								<path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
							</svg>
							<span class="hidden overflow-hidden text-xs font-medium md:inline-block md:max-w-0 md:opacity-0 md:transition-all md:group-hover:max-w-[40px] md:group-hover:opacity-100">
								{labels['card.live.label']}
							</span>
						</a>
					{/if}
				</div>
			{/if}

			<div class="space-y-2">
				<div class="flex items-start justify-between gap-2">
					<h3 class="group-hover:text-accent-earth-text text-base font-medium transition-colors sm:text-lg">
						{project.name}
					</h3>
					{#if project.category}
						<span class="text-muted-foreground shrink-0 rounded-full border border-[var(--border-faint)] px-2.5 py-0.5 text-xs font-medium">
							{project.category}
						</span>
					{/if}
				</div>

				<p class="text-muted-foreground line-clamp-2 text-xs sm:text-sm">{project.description}</p>

				{#if project.startDate || project.endDate}
					<div class="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
							<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
						</svg>
						{#if project.startDate}
							<span class="text-xs">
								{labels['card.started-label']}
								{year(project.startDate)}{project.endDate ? ` - ${year(project.endDate)}` : ''}
							</span>
						{/if}
					</div>
				{/if}
			</div>

			<div class="flex flex-wrap gap-1.5">
				{#each project.techstack.slice(0, 4) as tech (tech)}
					<span class="text-accent-earth-text hover:bg-bg-hover inline-flex items-center rounded-sm bg-[var(--accent-dim)] px-2 py-1 text-xs font-medium transition-colors">
						{tech}
					</span>
				{/each}
				{#if project.techstack.length > 4}
					<span class="bg-bg-hover text-muted-foreground inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-medium">
						+{project.techstack.length - 4}
					</span>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

<div class="space-y-8">
	{#if featuredProjects.length > 0}
		<div class="space-y-6">
			<div class="flex items-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-5 w-5">
					<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
				</svg>
				<h2 class="text-lg font-medium sm:text-xl">{labels.featured}</h2>
			</div>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each featuredProjects as project, index (project.slug)}
					<div class="project-card-enter" style="animation-delay: {index * 100}ms">
						{@render projectCard(project)}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="space-y-6">
		{#if featuredProjects.length > 0}
			<h2 class="text-lg font-medium sm:text-xl">{labels.all}</h2>
		{/if}

		<div class="space-y-4">
			<div class="flex flex-col gap-4 sm:flex-row">
				<div class="relative flex-1">
					<input
						type="text"
						placeholder={labels['search.placeholder']}
						bind:value={filters.search}
						class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] py-2 pr-3 pl-10 text-sm"
					/>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform">
						<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
					</svg>
				</div>

				<button
					type="button"
					onclick={() => (showFilters = !showFilters)}
					class="hover:bg-bg-hover flex items-center gap-2 rounded-md border border-[var(--border-subtle)] px-4 py-2 transition-colors"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
						<line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" />
						<line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" />
						<line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" />
						<line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" />
					</svg>
					{showFilters ? labels['filters.hide'] : labels['filters.show']}
				</button>
			</div>

			{#if showFilters}
				<div class="bg-bg-surface grid grid-cols-1 gap-4 rounded-lg border border-[var(--border-subtle)] p-4 md:grid-cols-3">
					{#if unique.categories.length > 0}
						<div>
							<label for="filter-category" class="mb-2 block text-xs font-medium sm:text-sm">
								{labels['filters.category']}
							</label>
							<select
								id="filter-category"
								bind:value={filters.category}
								class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
							>
								<option value="all">{labels['filters.all-categories']}</option>
								{#each unique.categories as category (category)}
									<option value={category}>{category}</option>
								{/each}
							</select>
						</div>
					{/if}

					<div>
						<label for="filter-status" class="mb-2 block text-xs font-medium sm:text-sm">
							{labels['filters.status']}
						</label>
						<select
							id="filter-status"
							bind:value={filters.status}
							class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
						>
							<option value="all">{labels['filters.all-statuses']}</option>
							{#each unique.statuses as status (status)}
								<option value={status}>{statusLabel(status)}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="filter-tech" class="mb-2 block text-xs font-medium sm:text-sm">
							{labels['filters.technology']}
						</label>
						<select
							id="filter-tech"
							bind:value={filters.techStack}
							class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
						>
							<option value="all">{labels['filters.all-technologies']}</option>
							{#each unique.techStacks as tech (tech)}
								<option value={tech}>{tech}</option>
							{/each}
						</select>
					</div>
				</div>
			{/if}

			<div class="text-muted-foreground flex items-center justify-between text-xs sm:text-sm">
				<span>
					{#if hasActiveFilters}
						{formatMessage(labels['results.found'], { count: filteredProjects.length }, locale)}
					{:else}
						{formatMessage(labels['results.showing'], { count: regularProjects.length }, locale)}
					{/if}
				</span>
				{#if hasActiveFilters}
					<button
						type="button"
						onclick={clearFilters}
						class="text-accent-earth-text hover:text-accent-earth-hover transition-colors"
					>
						{labels['filters.clear']}
					</button>
				{/if}
			</div>
		</div>

		{#if regularProjects.length === 0}
			<div class="py-12 text-center">
				<div class="mb-4 text-6xl">🔍</div>
				<h3 class="mb-2 text-base font-medium sm:text-lg">{labels['empty.title']}</h3>
				<p class="text-muted-foreground mb-4 text-xs sm:text-sm">{labels['empty.description']}</p>
				{#if hasActiveFilters}
					<button
						type="button"
						onclick={clearFilters}
						class="border-accent-earth-hover bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
					>
						{labels['empty.show-all']}
					</button>
				{/if}
			</div>
		{:else}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each regularProjects as project, index (project.slug)}
					<div class="project-card-enter" style="animation-delay: {index * 100}ms">
						{@render projectCard(project)}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.project-card-enter {
		animation: project-enter 0.5s ease both;
	}

	@media (prefers-reduced-motion: reduce) {
		.project-card-enter {
			animation: none;
		}
	}

	@keyframes project-enter {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
