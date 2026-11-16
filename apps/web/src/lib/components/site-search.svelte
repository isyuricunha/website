<script lang="ts">
	import { allPosts, allProjects } from 'content-collections'
	import { i18n } from '@isyuricunha/i18n/config'
	import { goto } from '$app/navigation'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'

	type Props = { locale: string }

	let { locale }: Props = $props()

	type SearchResult = {
		id: string
		title: string
		description: string
		href: string
		type: 'post' | 'project' | 'page'
		iconKind: 'file' | 'user' | 'music' | 'code' | 'calendar'
		date?: string
	}

	let query = $state('')
	let isOpen = $state(false)
	let recentSearches = $state<string[]>([])
	let selectedIndex = $state(-1)
	let t = $state<(key: string, variables?: Record<string, string | number>) => string>(
		(key) => key
	)

	const RECENT_SEARCHES_KEY = 'site_search_recent'
	const MAX_RECENT_SEARCHES = 5
	const RESULTS_LIMIT = 8

	let searchInput: HTMLInputElement | undefined = $state()

	const searchable = $derived.by(() => {
		const results: SearchResult[] = []
		for (const post of allPosts) {
			if (post.locale !== locale) continue
			results.push({
				id: post.slug,
				title: post.title,
				description: post.summary,
				href: `/blog/${post.slug}`,
				type: 'post',
				iconKind: 'file',
				date: post.date
			})
		}
		for (const project of allProjects) {
			if (project.locale !== locale) continue
			results.push({
				id: project.slug,
				title: project.name,
				description: project.description,
				href: `/projects#${project.slug}`,
				type: 'project',
				iconKind: 'code'
			})
		}
		const staticPages: Array<SearchResult> = [
			{
				id: 'about',
				title: t('layout.about'),
				description: t('about.description'),
				href: '/about',
				type: 'page',
				iconKind: 'user'
			},
			{
				id: 'now',
				title: t('layout.now'),
				description: t('now.description'),
				href: '/now',
				type: 'page',
				iconKind: 'calendar'
			},
			{
				id: 'uses',
				title: t('layout.uses'),
				description: t('uses.description'),
				href: '/uses',
				type: 'page',
				iconKind: 'code'
			},
			{
				id: 'music',
				title: t('layout.music'),
				description: t('music.description'),
				href: '/music',
				type: 'page',
				iconKind: 'music'
			}
		]
		results.push(...staticPages)
		return Array.from(new Map(results.map((r) => [r.href, r])).values())
	})

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

	// Recent searches persist in localStorage like the original implementation.
	$effect(() => {
		try {
			const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
			if (saved) {
				const parsed = JSON.parse(saved) as unknown
				if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
					recentSearches = parsed
				}
			}
		} catch (error) {
			console.error('Error loading recent searches:', error)
		}
	})

	// The mascot (Yue) can open the search with a pre-filled query.
	$effect(() => {
		const handleYueSearch = (event: Event) => {
			const customEvent = event as CustomEvent<{ query: string }>
			if (customEvent.detail?.query) {
				query = customEvent.detail.query
				isOpen = true
				selectedIndex = -1
			}
		}
		addEventListener('yue-open-search', handleYueSearch)
		return () => removeEventListener('yue-open-search', handleYueSearch)
	})

	function saveRecentSearch(searchTerm: string) {
		if (!searchTerm.trim()) return
		try {
			recentSearches = [
				searchTerm,
				...recentSearches.filter((s) => s !== searchTerm)
			].slice(0, MAX_RECENT_SEARCHES)
			localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches))
		} catch (error) {
			console.error('Error saving recent search:', error)
		}
	}

	const filteredResults = $derived.by(() => {
		if (!query.trim()) return []
		const searchTerm = query.toLowerCase()
		return searchable
			.filter(
				(item) =>
					item.title.toLowerCase().includes(searchTerm) ||
					item.description.toLowerCase().includes(searchTerm)
			)
			.slice(0, RESULTS_LIMIT)
	})

	const showRecentSearches = $derived(!query.trim() && recentSearches.length > 0)
	const totalItems = $derived(showRecentSearches ? recentSearches.length : filteredResults.length)
	const listOpen = $derived(isOpen && (showRecentSearches || filteredResults.length > 0))

	function handleResultClick(href: string, searchTerm?: string) {
		if (searchTerm) {
			saveRecentSearch(searchTerm)
		}
		isOpen = false
		query = ''
		selectedIndex = -1
		goto(href)
	}

	function handleRecentSearchClick(searchTerm: string) {
		query = searchTerm
		selectedIndex = -1
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false
			query = ''
			selectedIndex = -1
			return
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			selectedIndex = selectedIndex < totalItems - 1 ? selectedIndex + 1 : selectedIndex
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			selectedIndex = selectedIndex > -1 ? selectedIndex - 1 : -1
		}
		if (event.key === 'Enter' && selectedIndex >= 0) {
			event.preventDefault()
			if (showRecentSearches) {
				const term = recentSearches[selectedIndex]
				if (term) handleRecentSearchClick(term)
			} else {
				const result = filteredResults[selectedIndex]
				if (result) handleResultClick(result.href, query)
			}
		}
	}

	function highlight(text: string, searchTerm: string) {
		const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
		const normalized = searchTerm.toLowerCase()
		return { parts, normalized }
	}
</script>

<div class="relative">
	<div class="relative">
		<label for="site-search-input" class="sr-only">{t('site-search.label')}</label>
		<svg
			aria-hidden="true"
			class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>
		</svg>
		<input
			id="site-search-input"
			bind:this={searchInput}
			type="text"
			role="combobox"
			aria-autocomplete="list"
			aria-controls="site-search-results"
			aria-expanded={listOpen}
			aria-activedescendant={selectedIndex >= 0 ? `site-search-option-${selectedIndex}` : undefined}
			placeholder={t('site-search.placeholder')}
			bind:value={query}
			oninput={() => {
				selectedIndex = -1
				isOpen = query.length > 0 || recentSearches.length > 0
			}}
			onfocus={() => {
				isOpen = query.length > 0 || recentSearches.length > 0
			}}
			onkeydown={handleKeydown}
			class="border-input bg-bg-elevated placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-lg border px-3 pl-10 text-sm focus-visible:ring-2 focus-visible:outline-none"
		/>
	</div>

	{#if listOpen}
		<div
			class="fixed inset-0 z-40"
			role="presentation"
			onclick={() => {
				isOpen = false
				selectedIndex = -1
			}}
		></div>
		<div
			id="site-search-results"
			role="listbox"
			aria-label={t('site-search.results-label')}
			class="bg-bg-elevated shadow-feature-card absolute top-full z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-lg border border-[var(--border-default)]"
		>
			<div class="p-2">
				<div class="space-y-1">
					{#if showRecentSearches}
						<div class="text-muted-foreground border-b px-3 py-2 text-xs font-medium">
							{t('site-search.recent-searches')}
						</div>
						{#each recentSearches as searchTerm, index (index)}
							<button
								id={`site-search-option-${index}`}
								role="option"
								aria-selected={selectedIndex === index}
								type="button"
								class={`group w-full rounded-lg p-3 text-left transition-colors ${selectedIndex === index ? 'bg-accent' : 'hover:bg-muted/50'}`}
								onclick={() => handleRecentSearchClick(searchTerm)}
							>
								<div class="flex items-center gap-3">
									<svg
										aria-hidden="true"
										class="text-muted-foreground h-4 w-4"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>
									</svg>
									<span class="text-sm">{searchTerm}</span>
								</div>
							</button>
						{/each}
					{/if}

					{#each filteredResults as result, index (result.href)}
						{@const { parts, normalized } = highlight(result.title, query)}
						{@const desc = highlight(result.description, query)}
						<button
							id={`site-search-option-${index}`}
							role="option"
							aria-selected={selectedIndex === index}
							type="button"
							class={`group w-full rounded-lg p-3 text-left transition-colors ${selectedIndex === index ? 'bg-accent' : 'hover:bg-muted/50'}`}
							onclick={() => handleResultClick(result.href, query)}
						>
							<div class="flex items-start gap-3">
								<div class="text-muted-foreground group-hover:text-foreground mt-0.5 shrink-0">
									<span aria-hidden="true">
										{#if result.iconKind === 'file'}
											<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>
										{:else if result.iconKind === 'user'}
											<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
										{:else if result.iconKind === 'music'}
											<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
										{:else if result.iconKind === 'calendar'}
											<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
										{:else}
											<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
										{/if}
									</span>
								</div>
								<div class="min-w-0 flex-1">
									<div class="mb-1 flex items-center gap-2">
										<h4 class="group-hover:text-accent-earth-text truncate text-sm font-medium">
											{#each parts as part, pi (pi)}{#if part.toLowerCase() === normalized}<mark class="rounded bg-[var(--accent-dim)] px-0.5 text-accent-earth-text">{part}</mark>{:else}{part}{/if}{/each}
										</h4>
										<span class="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs">
											{t(`homepage.recently-updated.type.${result.type}`)}
										</span>
									</div>
									<p class="text-muted-foreground line-clamp-2 text-xs">
										{#each desc.parts as part, pi (pi)}{#if part.toLowerCase() === normalized}<mark class="rounded bg-[var(--accent-dim)] px-0.5 text-accent-earth-text">{part}</mark>{:else}{part}{/if}{/each}
									</p>
									{#if result.date}
										<div class="mt-1 flex items-center gap-1">
											<span class="text-muted-foreground text-xs">
												{new Date(result.date).toLocaleDateString(locale)}
											</span>
										</div>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{:else if isOpen && query.length > 0 && filteredResults.length === 0 && !showRecentSearches}
		<div
			class="fixed inset-0 z-40"
			role="presentation"
			onclick={() => {
				isOpen = false
				selectedIndex = -1
			}}
		></div>
		<div class="bg-bg-elevated shadow-feature-card absolute top-full z-50 mt-2 w-full rounded-lg border border-[var(--border-default)]">
			<div class="p-4 text-center">
				<svg aria-hidden="true" class="text-muted-foreground mx-auto mb-2 h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
				<p class="text-muted-foreground text-sm">{t('site-search.no-results')} "{query}"</p>
			</div>
		</div>
	{/if}
</div>
