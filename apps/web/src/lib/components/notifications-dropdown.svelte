<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { authClient } from '#lib/auth-client.ts'
	import { dialogs, openSignIn } from '#lib/dialogs.svelte.ts'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import { i18n } from '@isyuricunha/i18n/config'
	import { goto } from '$app/navigation'

	let { locale }: { locale: string } = $props()

	let open = $state(false)
	let panel: HTMLDivElement | undefined = $state()
	let trigger: HTMLButtonElement | undefined = $state()

	const session = authClient.useSession()
	const enabled = $derived(!$session.isPending && Boolean($session.data))

	type NotificationItem = {
		id: string
		title: string
		message: string
		read: boolean
		actionUrl: string | null
	}

	let unreadCount = $state(0)
	let items = $state<NotificationItem[]>([])
	let markAllPending = $state(false)

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

	async function loadNotifications() {
		if (!enabled) return
		try {
			const meta = (await trpc.communication.getNotifications.query({
				unreadOnly: true,
				limit: 1,
				offset: 0
			})) as { total?: number }
			unreadCount = meta.total ?? 0

			const list = (await trpc.communication.getNotifications.query({
				unreadOnly: false,
				limit: 10,
				offset: 0
			})) as { notifications?: NotificationItem[] }
			items = list.notifications ?? []
		} catch {
			// fail-closed rate limiting without a reachable redis: keep last state
		}
	}

	// Load once when signed in; refresh on open.
	$effect(() => {
		if (enabled) void loadNotifications()
	})

	$effect(() => {
		if (open && enabled) void loadNotifications()
	})

	function handleTriggerClick() {
		open = !open
	}

	function onWindowClick(event: MouseEvent) {
		if (!open) return
		const target = event.target as HTMLElement
		if (panel?.contains(target) || trigger?.contains(target)) return
		open = false
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') open = false
	}

	async function markRead(notificationId: string) {
		const item = items.find((n) => n.id === notificationId)
		if (item && !item.read) {
			items = items.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
			unreadCount = Math.max(0, unreadCount - 1)
		}
		await trpc.communication.markNotificationRead.mutate({ notificationId })
		void loadNotifications()
	}

	async function markAllRead() {
		markAllPending = true
		items = items.map((n) => ({ ...n, read: true }))
		unreadCount = 0
		await trpc.communication.markAllNotificationsRead.mutate()
		markAllPending = false
		void loadNotifications()
	}
</script>

<svelte:document onclick={onWindowClick} onkeydown={onWindowKeydown} />

<div class="relative">
	<button
		bind:this={trigger}
		type="button"
		aria-label={t('component.notifications.aria')}
		aria-expanded={open}
		class="text-foreground hover:bg-bg-hover relative inline-flex size-9 items-center justify-center rounded-lg p-0 transition-colors"
		onclick={handleTriggerClick}
	>
		<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.261 19.907a7.5 7.5 0 0 0 7.233-2.016M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3.158"></path><path d="M11.25 18.5a3.5 3.5 0 1 1 7 0v1a1.5 1.5 0 0 0 1.5 1.5H21a1.5 1.5 0 0 0 1.5-1.5v-.5a4.5 4.5 0 0 0-4.5-4.5h-6.75Z"></path></svg>
		{#if enabled && unreadCount > 0}
			<span class="bg-accent-earth text-text-inverse absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] leading-5 font-medium">
				{unreadCount > 99 ? '99+' : unreadCount}
			</span>
		{/if}
	</button>

	{#if open}
		<div bind:this={panel} class="bg-bg-elevated shadow-feature-card absolute top-full right-0 z-50 mt-2 w-96 rounded-lg border border-[var(--border-default)]">
			<div class="flex items-center justify-between px-4 py-3">
				<span class="text-sm font-medium">{t('component.notifications.title')}</span>
				{#if enabled}
					<span class="bg-muted rounded-full px-2 py-0.5 text-xs font-medium">{unreadCount}</span>
				{/if}
			</div>
			<div class="border-[var(--border-default)] border-t"></div>

			{#if !enabled}
				<div class="flex flex-col gap-3 px-4 py-3">
					<div class="text-muted-foreground text-sm">{t('component.notifications.sign-in')}</div>
					<button
						type="button"
						class="focus-visible:ring-ring h-9 rounded-lg bg-accent px-3 text-sm font-medium text-text-inverse transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:outline-none"
						onclick={() => {
							open = false
							openSignIn()
						}}
					>
						{t('common.sign-in')}
					</button>
				</div>
			{:else if items.length === 0}
				<div class="text-muted-foreground px-4 py-3 text-sm">{t('component.notifications.empty')}</div>
			{:else}
				<div class="max-h-80 overflow-y-auto p-1">
					<div class="space-y-1">
						{#each items as n (n.id)}
							{@const inner = `<span class="inline-block">${''}</span>`}
							{#if n.actionUrl}
								<a
									href={n.actionUrl}
									class="hover:bg-bg-hover flex w-full items-start gap-2 rounded-lg p-3 transition-colors"
									onclick={() => {
										if (!n.read) void markRead(n.id)
									}}
								>
									<div class="flex min-w-0 flex-1 flex-col gap-0.5">
										<div class="flex items-center gap-2">
											<span class="truncate text-sm font-medium">{n.title}</span>
											{#if !n.read}
												<span class="text-accent-earth-text rounded-full bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-semibold">
													{t('component.notifications.unread')}
												</span>
											{/if}
										</div>
										<span class="text-muted-foreground line-clamp-2 text-xs">{n.message}</span>
									</div>
								</a>
							{:else}
								<div
									class="hover:bg-bg-hover flex w-full cursor-pointer items-start gap-2 rounded-lg p-3 transition-colors"
									onclick={() => {
										if (!n.read) void markRead(n.id)
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter') void markRead(n.id)
									}}
									role="button"
									tabindex="0"
								>
									<div class="flex min-w-0 flex-1 flex-col gap-0.5">
										<div class="flex items-center gap-2">
											<span class="truncate text-sm font-medium">{n.title}</span>
											{#if !n.read}
												<span class="text-accent-earth-text rounded-full bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-semibold">
													{t('component.notifications.unread')}
												</span>
											{/if}
										</div>
										<span class="text-muted-foreground line-clamp-2 text-xs">{n.message}</span>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
				<div class="border-[var(--border-default)] border-t"></div>
				<div class="flex items-center justify-between gap-2 px-3 py-2">
					<button
						type="button"
						disabled={markAllPending || unreadCount === 0}
						class="focus-visible:ring-ring flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-bg-hover focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
						onclick={markAllRead}
					>
						<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
						{t('component.notifications.mark-all-read')}
					</button>
					<button
						type="button"
						class="focus-visible:ring-ring rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-bg-hover focus-visible:ring-2 focus-visible:outline-none"
						onclick={() => {
							open = false
							goto('/notifications')
						}}
					>
						{t('component.notifications.view-all')}
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
