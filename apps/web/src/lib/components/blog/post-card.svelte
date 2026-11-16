<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import { i18n } from '@isyuricunha/i18n/config'

	type Props = {
		slug: string
		title: string
		summary: string
		date: string
		locale: string
		featured?: boolean
	}

	let { slug, title, summary, date, locale, featured = false }: Props = $props()

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

	const formattedDate = $derived(
		new Intl.DateTimeFormat(locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(`${date.slice(0, 10)}T12:00:00`))
	)

	type StatsStatus = 'pending' | 'success' | 'error'
	let likes = $state<{ status: StatsStatus; count: number }>({ status: 'pending', count: 0 })
	let views = $state<{ status: StatsStatus; count: number }>({ status: 'pending', count: 0 })

	$effect(() => {
		let cancelled = false
		void (async () => {
			try {
				const result = await trpc.likes.get.query({ slug })
				if (cancelled) return
				likes = { status: 'success', count: result.likes }
			} catch {
				if (!cancelled) likes = { status: 'error', count: 0 }
			}
			try {
				const result = await trpc.views.get.query({ slug })
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

	function statsLabel(kind: 'likes' | 'views', status: StatsStatus, count: number) {
		if (status === 'pending') return null
		if (status === 'error') return t('common.error')
		return kind === 'likes' ? t('common.likes', { count }) : t('common.views', { count })
	}
</script>

<a
	href={`/blog/${slug}`}
	class="bg-bg-surface shadow-feature-card hover:bg-bg-hover group relative overflow-hidden rounded-lg border border-[var(--border-subtle)] transition-colors"
>
	{#if featured}
		<div class="absolute top-2 right-2 z-10">
			<span class="text-accent-earth-text border-[var(--accent-border)] bg-[var(--accent-dim)] inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px]">
				<svg class="mr-0.5 h-2 w-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.39 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
				{t('component.filtered-posts.featured')}
			</span>
		</div>
	{/if}

	<div class="aspect-[16/9] w-full overflow-hidden">
		<img
			src={`/images/blog/${slug}/cover.png`}
			alt={title}
			width="1200"
			height="630"
			loading="lazy"
			class="absolute inset-0 h-full w-full object-cover brightness-[0.78] saturate-[0.85] transition-transform group-hover:scale-[1.03]"
		/>
	</div>

	<div class="p-4">
		<div class="text-text-tertiary mb-2 flex items-center justify-between gap-1.5 font-mono text-[10px]">
			{formattedDate}
			<div class="flex gap-1.5">
				{#if likes.status === 'pending'}
					<div class="shimmer h-3 w-10 rounded"></div>
				{:else if likes.status === 'error'}
					<div>{t('common.error')}</div>
				{:else}
					<div>{t('common.likes', { count: likes.count })}</div>
				{/if}
				<div>&middot;</div>
				{#if views.status === 'pending'}
					<div class="shimmer h-3 w-10 rounded"></div>
				{:else if views.status === 'error'}
					<div>{t('common.error')}</div>
				{:else}
					<div>{t('common.views', { count: views.count })}</div>
				{/if}
			</div>
		</div>
		<h3 class="group-hover:text-accent-earth-text mb-1 text-sm font-medium transition-colors duration-150">
			{title}
		</h3>
		<p class="text-muted-foreground line-clamp-2 text-xs">{summary}</p>
	</div>
</a>
