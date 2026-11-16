<script lang="ts">
	import PostCard from '#lib/components/blog/post-card.svelte'
	import SocialShare from '#lib/components/social-share.svelte'
	import { getRecommendedPosts } from '#lib/recommendations.ts'
	import { trpc } from '#lib/trpc-client.ts'
	import { toastError } from '#lib/toasts.svelte.ts'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import { i18n } from '@isyuricunha/i18n/config'
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

	const formatDate = (date: string) => {
		const parsed = new Date(`${date.slice(0, 10)}T12:00:00`)
		return new Intl.DateTimeFormat(data.locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(parsed)
	}

	const shareHashtags = $derived(
		t('blog.share.hashtags')
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)
	)

	// Reading progress bar: 0 at the top, 1 when the page bottom reaches the
	// viewport end. articleHeight tracks the content wrapper via bind.
	let scrollY = $state(0)
	let viewportHeight = $state(1)
	let articleHeight = $state(1)
	const progress = $derived(
		Math.min(1, Math.max(0, scrollY / Math.max(1, articleHeight - viewportHeight)))
	)

	// Like button: taps are debounced, capped at 3 per visitor like the
	// original like-button component.
	let likes = $state<{
		status: 'pending' | 'success' | 'error'
		likes: number
		currentUserLikes: number
	} | null>(null)
	let cacheCount = $state(0)
	let likePending = $state(false)
	let debounceTimer: ReturnType<typeof setTimeout> | undefined

	const likeValue = $derived(likes ? likes.currentUserLikes + cacheCount : 0)

	// Views/comments counters and a single view increment per mount.
	let views = $state<{ status: 'pending' | 'success' | 'error'; views: number }>({
		status: 'pending',
		views: 0
	})
	let commentsCount = $state<{ status: 'pending' | 'success' | 'error'; comments: number }>({
		status: 'pending',
		comments: 0
	})
	let statsStarted = $state(false)

	let activeId = $state('')

	const slug = $derived(data.post.slug)
	const recommended = $derived(getRecommendedPosts({ slug, locale: data.locale, limit: 3 }))

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: data.post.title,
		description: data.post.summary,
		datePublished: data.post.date
	})

	$effect(() => {
		if (statsStarted) return
		statsStarted = true
		let cancelled = false
		void (async () => {
			try {
				const result = await trpc.views.get.query({ slug })
				if (!cancelled) views = { status: 'success', views: result.views }
			} catch {
				if (!cancelled) views = { status: 'error', views: 0 }
			}
			try {
				const result = await trpc.comments.getTotalCommentsCount.query({ slug })
				if (!cancelled) commentsCount = { status: 'success', comments: result.comments }
			} catch {
				if (!cancelled) commentsCount = { status: 'error', comments: 0 }
			}
			try {
				await trpc.views.increment.mutate({ slug })
			} catch {
				// view increment failure is non-fatal
			}
		})()
		return () => {
			cancelled = true
		}
	})

	const editUrl = $derived(
		`https://github.com/isyuricunha/website/blob/main/apps/web/src/content/blog/${data.locale === 'en' ? 'en' : data.locale}/${slug}.mdx?plain=1`
	)

	function handleLikeClick() {
		if (likePending || !likes) return
		if (likes.currentUserLikes + cacheCount >= 3) {
			toastError(t('blog.like-limit-reached'))
			return
		}
		const value = cacheCount === 3 ? cacheCount : cacheCount + 1
		cacheCount = value
		if (debounceTimer) clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			likePending = true
			void trpc.likes.patch
				.mutate({ slug, value })
				.then(() => {
					if (likes) {
						likes = {
							...likes,
							likes: likes.likes + value,
							currentUserLikes: likes.currentUserLikes + value
						}
					}
				})
				.catch(() => toastError(t('common.error')))
				.finally(() => {
					likePending = false
					cacheCount = 0
				})
		}, 1000)
	}

	function scrollToId(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
	}
</script>

<svelte:head>
	<title>{data.post.title}</title>
	<meta name="description" content={data.post.summary} />
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div
	class="bg-foreground fixed inset-x-0 top-0 z-50 h-1 origin-[0%]"
	style={`transform: scaleX(${progress});`}
	aria-hidden="true"
></div>

<div class="space-y-16 py-16">
	<div class="space-y-12 sm:px-8">
		<h1 class="max-w-4xl text-[clamp(32px,4vw,52px)] font-normal tracking-tighter text-balance">
			{data.post.title}
		</h1>
		<div class="border-[var(--border-faint)] grid grid-cols-2 gap-6 border-y py-6 text-sm md:grid-cols-4">
			<div class="space-y-1">
				<div class="label-mono">{t('blog.header.written-by')}</div>
				<a
					href="https://github.com/isyuricunha"
					class="flex items-center gap-2 transition-colors hover:text-accent"
				>
					<img src="/images/avatar.png" class="size-6 rounded-full" alt="" />
					{t('metadata.site-title')}
				</a>
			</div>
			<div class="space-y-1">
				<div class="label-mono">{t('blog.header.published-on')}</div>
				<div>{formatDate(data.post.date)}</div>
			</div>
			<div class="space-y-1">
				<div class="label-mono">{t('blog.header.views')}</div>
				{#if views.status === 'pending'}
					<div class="shimmer h-4 w-14 rounded"></div>
				{:else if views.status === 'error'}
					<div>{t('common.error')}</div>
				{:else}
					<div>{views.views}</div>
				{/if}
			</div>
			<div class="space-y-1">
				<div class="label-mono">{t('blog.header.comments')}</div>
				{#if commentsCount.status === 'pending'}
					<div class="shimmer h-4 w-14 rounded"></div>
				{:else if commentsCount.status === 'error'}
					<div>{t('common.error')}</div>
				{:else}
					<div>{commentsCount.comments}</div>
				{/if}
			</div>
		</div>

		<div>
			<SocialShare
				title={data.post.title}
				url={`/blog/${slug}`}
				description={t('blog.share.description', {
					title: data.post.title,
					site: t('metadata.site-title')
				})}
				hashtags={shareHashtags}
				labels={data.labels as unknown as Record<string, string>}
			/>
		</div>

		<div class="overflow-hidden rounded-lg border border-[var(--border-subtle)]">
			<img
				src={`/images/blog/${slug}/cover.png`}
				alt={data.post.title}
				width="1200"
				height="630"
				class="aspect-[16/9] w-full object-cover"
			/>
		</div>
	</div>

	<div class="mt-8 flex flex-col justify-between lg:flex-row">
		<article bind:clientHeight={articleHeight} class="prose prose-invert w-full lg:w-[670px]">
			{@html data.post.html}
		</article>
		{#if data.post.toc.length > 0}
			<aside class="hidden lg:block lg:max-w-[270px] lg:min-w-[270px]">
				<div class="sticky top-24 space-y-6">
					<div class="pl-4">
						<div class="mb-4">{t('blog.on-this-page')}</div>
						<div class="space-y-1 text-sm">
							{#each data.post.toc as item (item.url)}
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground block w-full rounded px-2 py-1 text-left transition-colors {activeId === item.url ? 'text-foreground font-medium' : ''}"
									style={`padding-left: ${(item.depth - 1) * 12}px;`}
									onclick={() => scrollToId(item.url?.slice(1) ?? '')}
								>
									{item.title}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</aside>
		{/if}
	</div>

	{#if data.flags.likeButton}
		<div class="mt-12 flex justify-center">
			<button
				type="button"
				aria-label={t('blog.like')}
				class="bg-bg-surface text-text-primary hover:bg-bg-hover flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-lg transition-colors active:scale-[0.96]"
				onclick={handleLikeClick}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="28"
					height="28"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="text-accent-earth-text relative overflow-hidden"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<defs>
						<clipPath id="like-clip-path">
							<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
						</clipPath>
					</defs>
					<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
					<g clip-path="url(#like-clip-path)">
						<rect
							x="0"
							y="0"
							width="24"
							height="24"
							fill="currentColor"
							style={`transform: translateY(${100 - likeValue * 33}%);`}
						/>
					</g>
				</svg>
				{t('blog.like')}
				<span class="bg-[var(--border-default)] h-6 w-px"></span>
				{#if likes?.status === 'pending'}
					<div>--</div>
				{:else if likes?.status === 'error'}
					<div>{t('common.error')}</div>
				{:else if likes?.status === 'success'}
					<div>{likes.likes + cacheCount}</div>
				{/if}
			</button>
		</div>
	{/if}

	<div class="my-8 space-y-6">
		<div class="flex flex-col items-center justify-center gap-6 border-t pt-6 sm:flex-row">
			<SocialShare
				title={data.post.title}
				url={`/blog/${slug}`}
				description={t('blog.share.description', {
					title: data.post.title,
					site: t('metadata.site-title')
				})}
				hashtags={shareHashtags}
				labels={data.labels as unknown as Record<string, string>}
			/>
			<a href="/#newsletter" class="text-accent text-sm underline transition-opacity hover:opacity-80">
				{t('homepage.newsletter.title')}
			</a>
		</div>

		<div class="flex w-full flex-col items-center justify-between gap-2 py-4 text-sm sm:flex-row">
			<a href={editUrl} class="text-muted-foreground transition-colors hover:text-accent">
				{t('blog.footer.edit-on-github')}
			</a>
			<div class="text-muted-foreground flex items-center gap-2">
				<span>{t('blog.header.published-on')} {formatDate(data.post.date)}</span>
			</div>
		</div>
	</div>

	{#if recommended.length > 0}
		<section class="border-[var(--border-faint)] mt-10 border-t pt-10">
			<h2 class="mb-6 text-lg font-medium">{t('recommendations.title')}</h2>
			<div class="grid gap-4 md:grid-cols-3">
				{#each recommended as rec (rec.id)}
					<a
						href={rec.href}
						class="bg-bg-surface shadow-feature-card hover:bg-bg-hover group rounded-lg border border-[var(--border-subtle)] p-4 transition-colors"
					>
						<span class="text-muted-foreground label-mono">{t(`homepage.recently-updated.type.${rec.type}`)}</span>
						<h3 class="group-hover:text-accent-earth-text mt-2 text-sm font-medium">{rec.title}</h3>
						<p class="text-muted-foreground mt-2 line-clamp-2 text-xs">{rec.description}</p>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.flags.comment}
		<div class="border-[var(--border-faint)] mt-10 border-t pt-10">
			<h2 class="mb-6 text-lg font-medium">{t('blog.comments.title')}</h2>
			<!-- Full comment viewer port tracked in MIGRATION.md; the original
			     lists comments through the authenticated tRPC surface. -->
		</div>
	{/if}
</div>
