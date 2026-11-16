<script lang="ts">
	import FilteredPosts from '#lib/components/blog/filtered-posts.svelte'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import { i18n } from '@isyuricunha/i18n/config'
	import PageTitle from '#lib/components/blog/page-title.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let t = $state<(key: string, variables?: Record<string, string | number>) => string>(
		(key) => key
	)

	$effect(() => {
		let cancelled = false
		void (async () => {
			const [messages, fallback] = await Promise.all([
				loadMessages(data.locale),
				loadMessages(i18n.defaultLocale)
			])
			if (cancelled) return
			t = createTranslator(data.locale, messages as never, fallback as never)
		})()
		return () => {
			cancelled = true
		}
	})

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

	<nav aria-label="Breadcrumb" class="mb-6 flex items-center gap-2 text-sm">
		<a
			href={data.locale === 'en' ? '/' : `/${data.locale}`}
			class="text-muted-foreground inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
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

	<PageTitle title={data.title} description={data.description} />

	<FilteredPosts posts={data.posts} locale={data.locale} />
