<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { useSession } from '#lib/auth-client.ts'
	import SignIn from '#lib/components/guestbook/sign-in.svelte'

	let { labels }: { labels: Record<string, string> } = $props()

	const session = useSession()

	type Notification = {
		id: string
		title: string
		message: string
		read: boolean
		createdAt: string | Date
		actionUrl: string | null
	}

	let unreadOnly = $state(false)
	let signInOpen = $state(false)
	let data = $state<{ notifications: Notification[] } | null>(null)
	let isLoading = $state(false)
	let isFetching = $state(false)
	let isMarkingAll = $state(false)

	async function fetchNotifications() {
		isLoading = true
		isFetching = true
		try {
			data = await trpc.communication.getNotifications.query({ unreadOnly, limit: 50, offset: 0 })
		} catch {
			data = null
		} finally {
			isLoading = false
			isFetching = false
		}
	}

	async function markRead(notificationId: string) {
		try {
			await trpc.communication.markNotificationRead.mutate({ notificationId })
			await fetchNotifications()
		} catch {
			// Request-scoped failure: keep the current list untouched.
		}
	}

	async function markAllRead() {
		isMarkingAll = true
		try {
			await trpc.communication.markAllNotificationsRead.mutate()
			await fetchNotifications()
		} catch {
			// Request-scoped failure: keep the current list untouched.
		} finally {
			isMarkingAll = false
		}
	}

	function formatDateTime(value: string | Date) {
		return new Date(value).toLocaleString()
	}

	let notifications = $derived(data?.notifications ?? [])
	let unreadCount = $derived(notifications.filter((n) => !n.read).length)
	let enabled = $derived(Boolean($session.data))

	$effect(() => {
		if (enabled) fetchNotifications()
	})
</script>

{#if $session.isPending}
	<!-- Session probe still resolving; render nothing like the React isPending gate. -->
{:else if !enabled}
	<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
		<div class="p-6 pb-0">
			<h2 class="flex items-center gap-2 text-lg font-medium">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
					<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
				</svg>
				{labels.title}
			</h2>
			<p class="text-muted-foreground text-sm">{labels['sign-in']}</p>
		</div>
		<div class="p-6">
			<button
				type="button"
				onclick={() => (signInOpen = true)}
				class="bg-bg-hover hover:bg-bg-base inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
			>
				{labels['sign-in']}
			</button>
		</div>
	</div>
	<SignIn labels={labels} bind:open={signInOpen} showTrigger={false} />
{:else}
	<div class="space-y-6">
		<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
			<div class="space-y-1">
				<h1 class="text-2xl font-medium tracking-tighter">{labels.title}</h1>
				<p class="text-muted-foreground text-sm">{isFetching ? labels.refreshing : ''}</p>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<button
					type="button"
					onclick={() => {
						unreadOnly = !unreadOnly
						fetchNotifications()
					}}
					class="inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm font-medium transition-colors {unreadOnly
						? 'bg-accent-earth text-text-inverse'
						: ''}"
				>
					{labels.unread}
				</button>
				<button
					type="button"
					onclick={markAllRead}
					disabled={isMarkingAll || unreadCount === 0}
					class="inline-flex items-center gap-2 rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
						<polyline points="20 6 9 17 4 12" />
					</svg>
					{labels['mark-all-read']}
				</button>
			</div>
		</div>

		{#if isLoading}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="py-6 text-center text-sm">{labels.loading}</div>
			</div>
		{:else if notifications.length === 0}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="py-6 text-center">
					<p class="text-muted-foreground text-sm">{labels.empty}</p>
				</div>
			</div>
		{:else}
			<div class="space-y-3">
				{#each notifications as n (n.id)}
					<div class="bg-bg-surface rounded-lg border {n.read ? 'border-[var(--border-subtle)]' : 'border-[var(--accent-border)]'}">
						<div class="p-6 pb-3">
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0 space-y-1">
									<h3 class="truncate text-base font-medium">{n.title}</h3>
									<p class="text-muted-foreground text-xs">{formatDateTime(n.createdAt)}</p>
								</div>
								<div class="flex items-center gap-2">
									{#if !n.read}
										<span class="bg-bg-hover inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
											{labels.unread}
										</span>
										<button
											type="button"
											onclick={() => markRead(n.id)}
											disabled={isFetching}
											class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] p-2 transition-colors disabled:opacity-50"
											aria-label={labels['mark-all-read']}
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
												<polyline points="20 6 9 17 4 12" />
											</svg>
										</button>
									{/if}
								</div>
							</div>
						</div>
						<div class="p-6 pt-0">
							<p class="text-sm">{n.message}</p>
							{#if n.actionUrl}
								<a
									href={n.actionUrl}
									class="text-accent-earth-text mt-2 inline-block text-sm underline"
									target="_blank"
									rel="noreferrer"
								>
									{n.actionUrl}
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
