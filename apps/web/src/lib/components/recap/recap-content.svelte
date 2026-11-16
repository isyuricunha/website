<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'

	type Props = {
		labels: Record<string, string>
		locale: string
	}

	let { labels, locale }: Props = $props()

	type ViewedPosts = Awaited<ReturnType<typeof trpc.recap.topViewed.query>>
	type LikedPosts = Awaited<ReturnType<typeof trpc.recap.topLiked.query>>

	let summary = $state<Awaited<ReturnType<typeof trpc.recap.summary.query>> | null>(null)
	let topViewed = $state<ViewedPosts | null>(null)
	let topLiked = $state<LikedPosts | null>(null)
	let status = $state<'pending' | 'error' | 'success'>('pending')

	$effect(() => {
		Promise.all([
			trpc.recap.summary.query(undefined),
			trpc.recap.topViewed.query({ locale, limit: 5 }),
			trpc.recap.topLiked.query({ locale, limit: 5 })
		])
			.then(([summaryResult, viewedResult, likedResult]) => {
				summary = summaryResult
				topViewed = viewedResult
				topLiked = likedResult
				status = 'success'
			})
			.catch(() => {
				status = 'error'
			})
	})

	const listCard = 'bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6'
	const cardTitle = 'text-base font-medium'
	const showState = (list: unknown[] | null) =>
		status === 'pending' ? labels['loading'] : status === 'error' || !list || list.length === 0 ? labels['no-data'] : null

	const formatCount = (value: number | null | undefined) => (value ?? 0).toLocaleString()
</script>

<div class="grid min-w-0 gap-8 lg:grid-cols-2">
	<div class="space-y-6">
		<div class={listCard}>
			<p class="text-text-secondary text-sm">{labels['content.total-posts']}</p>
			<p class="text-4xl font-medium tracking-tighter">
				{summary ? formatCount(summary.totalPosts) : '—'}
			</p>
			<p class="text-text-secondary mt-2 text-sm">{labels['content.published-last-year']}</p>
		</div>
	</div>

	<div class={listCard}>
		<h3 class={cardTitle}>{labels['content.most-read']}</h3>
		<div class="mt-4">
			{#if showState(topViewed)}
				<p class="text-text-secondary text-sm">{showState(topViewed)}</p>
			{:else}
				<ul class="space-y-3">
					{#each (topViewed ?? []) as post, index (post.slug)}
						<li class="flex min-w-0 items-center justify-between gap-4 text-sm">
							<a href={`/blog/${post.slug}`} class="truncate hover:underline">
								{index + 1}. {post.title}
							</a>
							<span class="text-text-secondary shrink-0 tabular-nums">
								{formatCount(post.views)} {labels['content.views']}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	<div class={listCard}>
		<h3 class={cardTitle}>{labels['content.most-liked']}</h3>
		<div class="mt-4">
			{#if showState(topLiked)}
				<p class="text-text-secondary text-sm">{showState(topLiked)}</p>
			{:else}
				<ul class="space-y-3">
					{#each (topLiked ?? []) as post, index (post.slug)}
						<li class="flex min-w-0 items-center justify-between gap-4 text-sm">
							<a href={`/blog/${post.slug}`} class="truncate hover:underline">
								{index + 1}. {post.title}
							</a>
							<span class="text-text-secondary shrink-0 tabular-nums">
								{formatCount(post.likes)} {labels['content.likes']}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>
