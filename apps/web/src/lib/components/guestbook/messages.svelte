<script lang="ts">
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'

	import { trpc } from '#lib/trpc-client.ts'

	type Message = RouterOutputs['guestbook']['getInfiniteMessages']['messages'][number]

	type Props = {
		labels: Record<string, string>
		locale: string
		currentUserId: string | null
		isAdmin: boolean
	}

	let { labels, locale, currentUserId, isAdmin }: Props = $props()

	type MessagePage = RouterOutputs['guestbook']['getInfiniteMessages']

	let pages = $state<MessagePage[]>([])
	let status = $state<'pending' | 'error' | 'success'>('pending')
	let errorMessage = $state('')
	let fetchingNext = $state(false)
	let nextCursor = $state<MessagePage['nextCursor']>(null)
	let sentinel: HTMLDivElement | undefined = $state()

	const formatDate = (value: string | Date) =>
		new Intl.DateTimeFormat(locale, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}).format(new Date(value))

	async function loadPage(cursor: MessagePage['nextCursor']) {
		status = 'pending'

		try {
			const result = await trpc.guestbook.getInfiniteMessages.query({ cursor })
			pages = cursor ? [...pages, result] : [result]
			nextCursor = result.nextCursor
			status = 'success'
		} catch (error) {
			status = 'error'
			errorMessage = error instanceof Error ? error.message : String(error)
		}

		fetchingNext = false
	}

	function fetchNext() {
		if (!nextCursor || fetchingNext) {
			return
		}

		fetchingNext = true
		void loadPage(nextCursor)
	}

	$effect(() => {
		void loadPage(null)
	})

	$effect(() => {
		if (!sentinel) {
			return
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					fetchNext()
				}
			},
			{ rootMargin: '100px' }
		)

		observer.observe(sentinel)

		return () => observer.disconnect()
	})

	const canDelete = (message: Message) => isAdmin || message.user.id === currentUserId
</script>

<div class="flex flex-col gap-6" data-testid="guestbook-messages-list">
	{#if status === 'error'}
		<div class="border-[var(--status-danger-border)] bg-status-danger-soft flex min-h-24 items-center justify-center rounded-lg border p-4">
			<p class="text-status-danger text-sm">{labels['failed-to-load-messages']}</p>
		</div>
	{:else if status === 'success' && pages[0]?.messages.length === 0}
		<p class="text-muted-foreground text-sm">{labels['no-messages']}</p>
	{:else if status === 'pending' && pages.length === 0}
		<div class="bg-bg-surface animate-pulse h-20 rounded-lg border border-[var(--border-subtle)]"></div>
		<div class="bg-bg-surface animate-pulse h-20 rounded-lg border border-[var(--border-subtle)]"></div>
	{/if}

	{#each pages as page, pageIndex (page.messages.map((m) => m.id).join('|'))}
		{#each page.messages as message, messageIndex (message.id)}
			<div
				class="bg-bg-surface card-enter rounded-lg border border-[var(--border-subtle)] p-4"
				style={`animation-delay:${(pageIndex * 10 + messageIndex) * 0.05}s`}
				data-testid="guestbook-message"
			>
				<div class="flex items-start justify-between gap-3">
					<div class="flex items-center gap-3">
						<img
							src={message.user.image ?? ''}
							alt={message.user.name ?? ''}
							width="40"
							height="40"
							loading="lazy"
							class="size-10 rounded-full border border-[var(--border-subtle)] object-cover"
						/>
						<div>
							<div class="text-sm font-medium">{message.user.name}</div>
							<div class="text-muted-foreground text-xs">{formatDate(message.createdAt)}</div>
						</div>
					</div>
					{#if canDelete(message)}
						<button
							type="button"
							class="text-muted-foreground hover:text-foreground rounded-md p-2 text-xs transition-colors"
							onclick={() => void trpc.guestbook.delete.mutate({ id: message.id }).then(() => void loadPage(null))}
						>
							{labels['delete'] ?? 'Delete'}
						</button>
					{/if}
				</div>
				<p class="mt-3 text-sm whitespace-pre-wrap">{message.body}</p>
			</div>
		{/each}
	{/each}

	<div bind:this={sentinel} aria-hidden="true"></div>

	{#if fetchingNext}
		<div class="bg-bg-surface animate-pulse h-20 rounded-lg border border-[var(--border-subtle)]"></div>
	{/if}
</div>
