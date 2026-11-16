<script lang="ts">
	import PostCard from './post-card.svelte'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import { i18n } from '@isyuricunha/i18n/config'

	type PostLike = {
		slug: string
		title: string
		summary: string
		date: string
		readingTime?: number
		category?: string
		tags?: string[]
		featured?: boolean
	}

	let { posts, locale }: { posts: PostLike[]; locale: string } = $props()

	let searchValue = $state('')
	let selectedCategory = $state('all')
	let selectedTag = $state('all')
	let sortBy = $state<'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'reading-time'>(
		'date-desc'
	)
	let showFilters = $state(false)
	let currentPage = $state(1)
	const postsPerPage = 8

	let t = $state<(key: string, variables?: Record<string, string | number>) => string>(
		(key) => key
	)

	$effect(() => {
		let cancelled = false
		void (async () => {
			const [messages, fallback] = await Promise.all([
				loadMessages(locale),
				loadMessages(i18n.defaultLocale)
			])
			if (cancelled) return
			t = createTranslator(locale, messages as never, fallback as never)
		})()
		return () => {
			cancelled = true
		}
	})

	const formatDate = (date: string) => {
		const parsed = new Date(`${date.slice(0, 10)}T12:00:00`)
		return new Intl.DateTimeFormat(locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(parsed)
	}

	const { categories, tags } = $derived.by(() => {
		const categorySet = new Set<string>()
		const tagSet = new Set<string>()
		for (const post of posts) {
			if (post.category) categorySet.add(post.category)
			if (post.tags) {
				for (const tag of post.tags) tagSet.add(tag)
			}
		}
		const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)
		return {
			categories: Array.from(categorySet).sort(compare),
			tags: Array.from(tagSet).sort(compare)
		}
	})

	const filteredAndSorted = $derived.by(() => {
		const term = searchValue.trim().toLowerCase()
		const filtered = posts.filter((post) => {
			const matchesSearch =
				term === '' ||
				post.title.toLowerCase().includes(term) ||
				post.summary.toLowerCase().includes(term)
			const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
			const matchesTag = selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag))
			return matchesSearch && matchesCategory && matchesTag
		})
		return filtered.sort((a, b) => {
			switch (sortBy) {
				case 'date-desc':
					return new Date(b.date).getTime() - new Date(a.date).getTime()
				case 'date-asc':
					return new Date(a.date).getTime() - new Date(b.date).getTime()
				case 'title-asc':
					return a.title.localeCompare(b.title)
				case 'title-desc':
					return b.title.localeCompare(a.title)
				case 'reading-time':
					return (a.readingTime ?? 0) - (b.readingTime ?? 0)
				default:
					return 0
			}
		})
	})

	const featuredPosts = $derived(filteredAndSorted.filter((post) => post.featured))
	const regularPosts = $derived(filteredAndSorted.filter((post) => !post.featured))
	const totalPages = $derived(Math.max(1, Math.ceil(regularPosts.length / postsPerPage)))
	const paginatedPosts = $derived(
		regularPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
	)

	function clearAllFilters() {
		searchValue = ''
		selectedCategory = 'all'
		selectedTag = 'all'
		sortBy = 'date-desc'
		currentPage = 1
	}
</script>

<div class="mb-6 flex justify-end px-4 sm:px-0">
	<a
		href="/rss.xml"
		class="text-muted-foreground hover:bg-bg-hover hover:text-foreground inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors sm:text-sm"
	>
		<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 19a6 6 0 0 0-6-6"></path><path d="M19 19a12 12 0 0 0-12-12"></path><circle cx="6.5" cy="17.5" r="1.5" fill="currentColor" stroke="none"></circle></svg>
		{t('component.filtered-posts.rss')}
	</a>
</div>

{#if featuredPosts.length > 0}
	<div class="mb-8 px-4 sm:mb-12 sm:px-0">
		<div class="mb-6 flex items-center gap-2">
			<svg class="text-accent-earth-text size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.39 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
			<h2 class="text-lg font-medium sm:text-xl">{t('component.filtered-posts.featured')}</h2>
		</div>
		<div class="grid gap-4 md:grid-cols-2">
			{#each featuredPosts as post (post.slug)}
				<PostCard
					slug={post.slug}
					title={post.title}
					summary={post.summary}
					date={post.date}
					locale={locale}
					featured
				/>
			{/each}
		</div>
	</div>
{/if}

<div class="mb-6 space-y-4 px-4 sm:mb-8 sm:px-0">
	<div class="relative">
		<input
			id="blog-search"
			type="text"
			bind:value={searchValue}
			oninput={() => (currentPage = 1)}
			placeholder={t('component.filtered-posts.placeholder')}
			aria-label={t('component.filtered-posts.placeholder')}
			class="border-input bg-bg-elevated placeholder:text-muted-foreground focus:border-[var(--accent-border)] h-11 w-full rounded-lg border pr-4 pl-10 text-sm transition-colors focus:outline-none sm:h-12 sm:pl-12"
		/>
		<svg class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2 sm:left-4 sm:size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
	</div>

	<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
		<button
			type="button"
			class="text-muted-foreground hover:bg-bg-hover hover:text-foreground flex min-h-[44px] items-center gap-2 self-start rounded-md px-3 py-2 text-sm transition-colors"
			onclick={() => (showFilters = !showFilters)}
		>
			<svg class="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
			<span class="text-sm">
				{showFilters
					? t('component.filtered-posts.toggle-filters.hide')
					: t('component.filtered-posts.toggle-filters.show')}
			</span>
		</button>

		<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
			<span class="text-muted-foreground text-xs whitespace-nowrap sm:text-sm">
				{t('component.filtered-posts.sort.label')}
			</span>
			<select
				bind:value={sortBy}
				onchange={() => (currentPage = 1)}
				aria-label={t('component.filtered-posts.sort.label')}
				class="border-input bg-bg-elevated focus-visible:ring-ring min-h-[44px] w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none sm:w-40"
			>
				<option value="date-desc">{t('component.filtered-posts.sort.options.date-desc')}</option>
				<option value="date-asc">{t('component.filtered-posts.sort.options.date-asc')}</option>
				<option value="title-asc">{t('component.filtered-posts.sort.options.title-asc')}</option>
				<option value="title-desc">{t('component.filtered-posts.sort.options.title-desc')}</option>
				<option value="reading-time">{t('component.filtered-posts.sort.options.reading-time')}</option>
			</select>
		</div>
	</div>

	{#if showFilters}
		<div class="bg-bg-surface grid grid-cols-1 gap-4 rounded-lg border border-[var(--border-subtle)] p-4 sm:grid-cols-2">
			{#if categories.length > 0}
				<div>
					<label class="mb-2 block text-xs font-medium sm:text-sm" for="filter-category">
						{t('component.filtered-posts.filters.category.label')}
					</label>
					<select
						id="filter-category"
						bind:value={selectedCategory}
						onchange={() => (currentPage = 1)}
						class="border-input bg-bg-elevated focus-visible:ring-ring min-h-[44px] w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
					>
						<option value="all">{t('component.filtered-posts.filters.category.all')}</option>
						{#each categories as category (category)}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>
			{/if}
			{#if tags.length > 0}
				<div>
					<label class="mb-2 block text-xs font-medium sm:text-sm" for="filter-tag">
						{t('component.filtered-posts.filters.tag.label')}
					</label>
					<select
						id="filter-tag"
						bind:value={selectedTag}
						onchange={() => (currentPage = 1)}
						class="border-input bg-bg-elevated focus-visible:ring-ring min-h-[44px] w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
					>
						<option value="all">{t('component.filtered-posts.filters.tag.all')}</option>
						{#each tags as tag (tag)}
							<option value={tag}>{tag}</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if filteredAndSorted.length === 0}
	<div class="flex flex-col items-center justify-center gap-4 py-16 text-center">
		<div class="text-4xl sm:text-6xl">📝</div>
		<h3 class="text-base font-medium sm:text-lg">{t('component.filtered-posts.no-posts-found')}</h3>
		<p class="text-muted-foreground mx-auto max-w-md text-xs sm:text-sm">
			{t('component.filtered-posts.empty.description')}
		</p>
		<button
			type="button"
			class="border-accent-earth-hover bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex min-h-[44px] items-center justify-center rounded-md border px-6 py-3 text-sm font-medium transition-colors"
			onclick={clearAllFilters}
		>
			{t('component.filtered-posts.empty.show-all')}
		</button>
	</div>
{:else if regularPosts.length > 0}
	<div class="px-4 sm:px-0">
		{#if featuredPosts.length > 0}
			<h2 class="mb-6 text-lg font-medium sm:text-xl">
				{t('component.filtered-posts.posts.all')}
			</h2>
		{/if}
		<div class="grid gap-4 md:grid-cols-2">
			{#each paginatedPosts as post (post.slug)}
				<PostCard
					slug={post.slug}
					title={post.title}
					summary={post.summary}
					date={post.date}
					locale={locale}
					featured={post.featured}
				/>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="mt-8 flex flex-wrap items-center justify-center gap-2">
				<button
					type="button"
					disabled={currentPage === 1}
					class="hover:bg-bg-hover border-[var(--border-subtle)] flex min-h-[44px] items-center gap-1 rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					onclick={() => (currentPage = Math.max(currentPage - 1, 1))}
				>
					{t('component.filtered-posts.pagination.previous')}
				</button>
				<div class="flex items-center gap-1">
					{#each Array(totalPages) as _, i (i + 1)}
						<button
							type="button"
							class={`min-h-[44px] min-w-[44px] rounded-md border px-3 py-2 text-sm ${currentPage === i + 1 ? 'border-accent-earth bg-accent-earth text-text-inverse' : 'hover:bg-bg-hover border-[var(--border-subtle)]'}`}
							onclick={() => (currentPage = i + 1)}
						>
							{i + 1}
						</button>
					{/each}
				</div>
				<button
					type="button"
					disabled={currentPage === totalPages}
					class="hover:bg-bg-hover border-[var(--border-subtle)] flex min-h-[44px] items-center gap-1 rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					onclick={() => (currentPage = Math.min(currentPage + 1, totalPages))}
				>
					{t('component.filtered-posts.pagination.next')}
				</button>
			</div>
		{/if}
	</div>
{/if}
