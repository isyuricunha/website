<script lang="ts">
	import { createTranslator } from '#lib/i18n/translator'
	import { loadMessages } from '#lib/i18n/catalog'
	import { i18n } from '@isyuricunha/i18n/config'
	import { trpc } from '#lib/trpc-client.ts'

	type PostLike = {
		slug: string
		title: string
		summary: string
		date: string
	}

	type Props = {
		strings: { card: string; title: string; more: string; error: string }
		locale: string
		featured: PostLike
		supporting: PostLike | null
	}

	let { strings, locale, featured, supporting }: Props = $props()

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

	// Frontmatter dates are plain YYYY-MM-DD. Parsing without a time treats
	// them as UTC midnight, which shifts the day a day back in UTC-3.
	const formatDate = (date: string) => {
		const parsed = new Date(`${date.slice(0, 10)}T12:00:00`)
		return new Intl.DateTimeFormat(locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(parsed)
	}

	type StatsStatus = 'pending' | 'success' | 'error'
	let likes = $state<{ status: StatsStatus; count: number }>({ status: 'pending', count: 0 })
	let views = $state<{ status: StatsStatus; count: number }>({ status: 'pending', count: 0 })

	$effect(() => {
		let cancelled = false
		void (async () => {
			try {
				const result = await trpc.likes.get.query({ slug: featured.slug })
				if (cancelled) return
				likes = { status: 'success', count: result.likes }
			} catch {
				if (!cancelled) likes = { status: 'error', count: 0 }
			}
			try {
				const result = await trpc.views.get.query({ slug: featured.slug })
				if (cancelled) return
				views = { status: 'success', count: result.views }
			} catch {
				if (!cancelled) views = { status: 'error', count: 0 }
			}
		})()
		return () => {
			cancelled = true
		}
	})
</script>

<section class="editorial-section">
	<div class="editorial-text">
		<span class="label-mono">{strings.card}</span>
		<h2>{strings.title}</h2>
		<p>{featured.summary}</p>
		<a href="/blog" class="cta-link">
			{strings.more}
			{' '}
			<span class="yu-arrow" aria-hidden="true">&rarr;</span>
		</a>
	</div>

	<div class="space-y-4">
		<a href={`/blog/${featured.slug}`} class="app-window yu-lift group block">
			<div class="app-window-chrome">
				<span class="window-dot"></span>
				<span class="window-dot"></span>
				<span class="window-dot"></span>
				<span class="label-mono ml-2 truncate">{formatDate(featured.date)}</span>
			</div>
			<div class="bg-bg-surface relative aspect-[16/9] overflow-hidden">
				<img
					src={`/images/blog/${featured.slug}/cover.png`}
					alt={featured.title}
					width="1200"
					height="630"
					loading="lazy"
					class="absolute inset-0 h-full w-full object-cover brightness-[0.75] saturate-[0.85]"
				/>
			</div>
			<div class="p-5">
				<div class="text-text-tertiary mb-3 flex items-center gap-1.5 font-mono text-[11px]">
					{#if likes.status === 'pending'}
						<div class="shimmer h-3 w-10 rounded"></div>
					{:else if likes.status === 'error'}
						<div>{strings.error}</div>
					{:else}
						<div>{t('common.likes', { count: likes.count })}</div>
					{/if}
					<div>&middot;</div>
					{#if views.status === 'pending'}
						<div class="shimmer h-3 w-10 rounded"></div>
					{:else if views.status === 'error'}
						<div>{strings.error}</div>
					{:else}
						<div>{t('common.views', { count: views.count })}</div>
					{/if}
				</div>
				<div class="flex items-start justify-between gap-4">
					<div>
						<h3 class="text-base font-medium sm:text-lg">{featured.title}</h3>
						<p class="mt-2 text-sm">{featured.summary}</p>
					</div>
					<svg
						class="text-accent-earth-text mt-1 size-4 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M7 7h10v10"></path><path d="M7 17 17 7"></path>
					</svg>
				</div>
			</div>
		</a>

		{#if supporting}
			<a
				href={`/blog/${supporting.slug}`}
				class="cursor-card shadow-feature-card block rounded-lg p-5"
			>
				<span class="label-mono">{formatDate(supporting.date)}</span>
				<h3 class="mt-3 text-base font-medium">{supporting.title}</h3>
				<p class="mt-2 line-clamp-2 text-sm">{supporting.summary}</p>
			</a>
		{/if}
	</div>
</section>
