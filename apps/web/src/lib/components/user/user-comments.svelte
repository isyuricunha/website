<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'

	let { handle, labels, locale }: { handle: string; labels: Record<string, string>; locale: string } = $props()

	type Comment = {
		id: string
		body: string
		createdAt: string | Date
		type: 'comment' | 'reply'
		post: { title: string; url: string }
	}

	let comments = $state<Comment[]>([])
	let nextCursor = $state<string | null | undefined>(undefined)
	let status = $state<'pending' | 'success' | 'error'>('pending')
	let isFetchingNextPage = $state(false)
	let sentinel = $state<HTMLElement | undefined>()
	let observer: IntersectionObserver | undefined

	async function loadNextPage() {
		if (isFetchingNextPage || (nextCursor === null && status === 'success')) return
		isFetchingNextPage = true
		try {
			const page = await trpc.users.getInfiniteUserComments.query({
				handle,
				limit: 10,
				cursor: nextCursor ?? null
			} as never)
			comments = [...comments, ...page.comments]
			nextCursor = (page.nextCursor as string | null) ?? null
			status = 'success'
		} catch {
			status = 'error'
		} finally {
			isFetchingNextPage = false
		}
	}

	function formatRelative(value: string | Date) {
		return new Date(value).toLocaleString()
	}

	$effect(() => {
		loadNextPage()
		observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting) && nextCursor) loadNextPage()
		})
		if (sentinel) observer.observe(sentinel)
		return () => observer?.disconnect()
	})
</script>

<section class="space-y-6">
	<div>
		<h2 class="text-lg font-medium tracking-tighter">{labels['comments.title']}</h2>
		<p class="text-muted-foreground text-sm">{labels['comments.description']}</p>
	</div>

	{#if status === 'error'}
		<p class="text-muted-foreground text-sm">{labels['comments.error']}</p>
	{/if}

	{#if status === 'success' && comments.length === 0}
		<p class="text-muted-foreground text-sm">{labels['comments.empty']}</p>
	{/if}

	<div class="space-y-4">
		{#each comments as comment (comment.id)}
			<div class="bg-bg-surface hover:bg-bg-hover rounded-lg border border-[var(--border-subtle)] p-4 transition-colors">
				<div class="flex items-center justify-between gap-4">
					<a
						href={comment.post.url}
						class="hover:text-accent-earth-text truncate text-sm font-medium transition-colors"
					>
						{comment.post.title}
					</a>
					<div class="text-muted-foreground shrink-0 text-xs">{formatRelative(comment.createdAt)}</div>
				</div>

				<div class="text-muted-foreground mt-1 text-xs">
					{labels[comment.type === 'reply' ? 'comments.type.reply' : 'comments.type.comment']}
				</div>

				<p class="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
			</div>
		{/each}
	</div>

	<div class="flex items-center justify-center">
		{#if nextCursor}
			<span bind:this={sentinel} class="invisible"></span>
		{/if}
		{#if status === 'success' && !nextCursor && comments.length > 0}
			<p class="text-muted-foreground text-xs">{labels['comments.end']}</p>
		{/if}
	</div>

	{#if nextCursor}
		<div class="flex justify-center">
			<button
				type="button"
				class="bg-bg-hover hover:bg-bg-base rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
				disabled={isFetchingNextPage}
				onclick={loadNextPage}
			>
				{isFetchingNextPage ? labels['comments.loading'] : labels['comments.load-more']}
			</button>
		</div>
	{/if}
</section>
