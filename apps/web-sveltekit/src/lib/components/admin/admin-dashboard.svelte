<script lang="ts">
	import { goto } from '$app/navigation'
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import AdminIcon from './admin-icon.svelte'
	import AnnouncementWidget from '#lib/components/announcement/announcement-widget.svelte'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type Stats = {
		totals: { users: number; comments: number; guestbookEntries: number; admins: number }
		recent: { users: number; comments: number }
		weekly: { users: number; comments: number }
		trends?: { users?: number; comments?: number }
		growth?: { engagementRate?: number }
	}

	let stats = $state<Stats | null>(null)
	let isLoading = $state(true)
	let hasError = $state(false)
	let refreshing = $state(false)

	function formatTrend(trend: number): string {
		if (trend > 0) return `+${trend}%`
		if (trend < 0) return `${trend}%`
		return '0%'
	}

	async function fetchStats() {
		try {
			stats = await trpc.admin.getStats.query()
			hasError = false
		} catch {
			hasError = true
		} finally {
			isLoading = false
			refreshing = false
		}
	}

	function refresh() {
		refreshing = true
		fetchStats()
			.then(() => toastSuccess(labels['messages.refresh-success']))
			.catch(() => toastError(labels['messages.refresh-error']))
	}

	let widgetLabels = $derived({
		'widget.title': labels['widget.title'],
		'widget.description': labels['widget.description'],
		'widget.loading': labels['widget.loading'],
		'widget.empty': labels['widget.empty'],
		'widget.dismiss': labels['widget.dismiss'],
		'widget.high-priority': labels['widget.high-priority']
	})

	let statCards = $derived(
		stats
			? [
					{
						title: labels['stats.total-users.title'],
						value: stats.totals.users,
						description: formatMessage(labels['stats.this-month'], { count: stats.recent.users }, locale),
						icon: 'users',
						trend: stats.trends?.users ?? 0,
						href: '/admin/users'
					},
					{
						title: labels['stats.total-comments.title'],
						value: stats.totals.comments,
						description: formatMessage(labels['stats.this-month'], { count: stats.recent.comments }, locale),
						icon: 'messages-square',
						trend: stats.trends?.comments ?? 0,
						href: '/admin/comments'
					},
					{
						title: labels['stats.guestbook-entries.title'],
						value: stats.totals.guestbookEntries,
						description: labels['stats.guestbook-entries.description'],
						icon: 'bar-chart-3',
						trend: 0,
						href: '/admin'
					},
					{
						title: labels['stats.admin-users.title'],
						value: stats.totals.admins,
						description: labels['stats.admin-users.description'],
						icon: 'shield',
						trend: 0,
						href: '/admin/users'
					}
				]
			: []
	)

	function localizedHref(url: string) {
		return locale === 'en' ? url : `/${locale}${url}`
	}

	$effect(() => {
		fetchStats()
	})
</script>

{#if isLoading}
	<div class="space-y-6">
		<div>
			<h1 class="text-3xl font-medium">{labels['loading.title']}</h1>
			<p class="text-text-secondary">{labels['loading.description']}</p>
		</div>
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{#each Array.from({ length: 4 }) as _, i (i)}
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
						<span class="text-sm font-medium">{labels['loading.card']}</span>
						<div class="bg-bg-hover h-4 w-4 animate-pulse rounded"></div>
					</div>
					<div class="p-6">
						<div class="bg-bg-hover h-7 w-16 animate-pulse rounded"></div>
						<div class="bg-bg-hover mt-1 h-3 w-24 animate-pulse rounded"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else if hasError}
	<div class="space-y-6">
		<div>
			<h1 class="text-3xl font-medium">{labels['loading.title']}</h1>
			<p class="text-text-secondary">{labels['loading.description']}</p>
		</div>
		<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
			<div class="p-6 pt-6"><p class="text-destructive">{labels['loading.error']}</p></div>
		</div>
	</div>
{:else}
	<div class="space-y-8">
		<div class="flex flex-col gap-4 border-b-[0.5px] border-[var(--border-faint)] pb-8 sm:flex-row sm:items-end sm:justify-between">
			<div class="space-y-2">
				<span class="label-mono">{labels['status.live']}</span>
				<h1 class="text-text-primary text-[clamp(32px,4vw,44px)] font-medium tracking-tighter">
					{labels.title}
				</h1>
				<p class="text-text-secondary max-w-2xl text-[15px] leading-relaxed">{labels.description}</p>
			</div>
			<div class="flex items-center gap-3">
				<span class="text-accent-earth-text border-[var(--accent-border)] inline-flex items-center rounded-full border bg-[var(--accent-dim)] px-3 py-1.5 text-xs font-medium">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-1.5 h-3.5 w-3.5">
						<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
					</svg>
					{labels['status.live']}
				</span>
				<button
					type="button"
					onclick={refresh}
					disabled={refreshing}
					class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors duration-150 disabled:opacity-50"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4 {refreshing ? 'animate-spin' : ''}">
						<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
					</svg>
					{labels['actions.refresh']}
				</button>
			</div>
		</div>

		<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
			{#each statCards as stat (stat.title)}
				<button
					type="button"
					class="bg-bg-surface group relative cursor-pointer overflow-hidden rounded-lg border border-[var(--border-subtle)] p-0 text-left transition-colors hover:border-[var(--accent-border)]"
					onclick={() => goto(localizedHref(stat.href))}
				>
					<div class="flex flex-row items-center justify-between space-y-0 pb-3 p-6 pb-0">
						<span class="text-text-secondary group-hover:text-text-primary text-sm font-medium transition-colors">
							{stat.title}
						</span>
						<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2.5">
							<AdminIcon iconId={stat.icon} className="h-5 w-5" />
						</div>
					</div>
					<div class="space-y-3 p-6 pt-0">
						<div class="flex items-baseline justify-between">
							<div class="text-3xl font-medium tracking-tight">{stat.value.toLocaleString()}</div>
							<div class="text-accent-earth-text flex items-center gap-1 text-xs font-medium">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3.5 w-3.5">
									<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
								</svg>
								{formatTrend(stat.trend)}
							</div>
						</div>
						<p class="text-text-secondary text-xs leading-relaxed">{stat.description}</p>
						<div class="pt-1">
							<div class="bg-bg-hover h-1.5 overflow-hidden rounded-full">
								<div class="bg-accent-earth h-full rounded-full" style="width: {Math.min((stat.value / 1000) * 100, 100)}%"></div>
							</div>
						</div>
					</div>
				</button>
			{/each}
		</div>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] md:col-span-1">
				<div class="p-6 pb-0">
					<div class="flex items-center justify-between">
						<div class="space-y-1">
							<h3 class="flex items-center gap-2 text-base font-medium">
								<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
										<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
									</svg>
								</div>
								{labels['recent-activity.title']}
							</h3>
							<p class="text-muted-foreground text-xs">{labels['recent-activity.description']}</p>
						</div>
						<span class="bg-bg-hover inline-flex rounded-full px-2.5 py-1 text-xs font-medium">
							{labels['recent-activity.weekly']}
						</span>
					</div>
				</div>
				<div class="space-y-3 p-6">
					<div class="bg-bg-surface hover:bg-bg-hover flex items-center justify-between rounded-lg border border-[var(--border-subtle)] p-3 transition-colors duration-150">
						<div class="flex items-center gap-3">
							<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
								<AdminIcon iconId="users" className="h-4 w-4" />
							</div>
							<span class="text-sm font-medium">{labels['recent-activity.new-users']}</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-lg font-medium">{stats?.weekly.users ?? 0}</span>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-4 w-4">
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</div>
					</div>
					<div class="bg-bg-surface hover:bg-bg-hover flex items-center justify-between rounded-lg border border-[var(--border-subtle)] p-3 transition-colors duration-150">
						<div class="flex items-center gap-3">
							<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
								<AdminIcon iconId="messages-square" className="h-4 w-4" />
							</div>
							<span class="text-sm font-medium">{labels['recent-activity.new-comments']}</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-lg font-medium">{stats?.weekly.comments ?? 0}</span>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text h-4 w-4">
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] md:col-span-1">
				<div class="p-6 pb-0">
					<div class="mb-1 flex items-center gap-2">
						<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
								<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
							</svg>
						</div>
						<h3 class="text-base font-medium">{labels['quick-actions.title']}</h3>
					</div>
					<p class="text-muted-foreground text-xs">{labels['quick-actions.description']}</p>
				</div>
				<div class="space-y-2 p-6">
					{#each [
						{ key: 'manage-users', icon: 'users', href: '/admin/users' },
						{ key: 'moderate-comments', icon: 'messages-square', href: '/admin/comments' },
						{ key: 'monitoring', icon: 'activity', href: '/admin/monitoring' }
					] as action (action.key)}
						<button
							type="button"
							class="bg-bg-surface hover:bg-bg-hover group flex w-full items-start gap-3 rounded-lg border border-[var(--border-subtle)] p-3 text-left transition-colors duration-150 hover:border-[var(--accent-border)]"
							onclick={() => goto(localizedHref(action.href))}
						>
							<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
								<AdminIcon iconId={action.icon} className="h-4 w-4" />
							</div>
							<div class="flex-1 space-y-0.5">
								<div class="text-sm font-medium">{labels[`quick-actions.${action.key}.title`]}</div>
								<div class="text-text-secondary text-xs">
									{labels[`quick-actions.${action.key}.description`]}
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<div class="my-8 h-px w-full bg-[var(--border-faint)]"></div>

		<div class="grid gap-6 lg:grid-cols-2">
			<AnnouncementWidget labels={widgetLabels} locale={locale} maxItems={5} />

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="p-6 pb-0">
					<div class="mb-1 flex items-center gap-2">
						<div class="text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2">
							<AdminIcon iconId="bar-chart-3" className="h-4 w-4" />
						</div>
						<h3 class="text-base font-medium">{labels['system-health.title']}</h3>
					</div>
					<p class="text-muted-foreground text-xs">{labels['system-health.description']}</p>
				</div>
				<div class="space-y-4 p-6">
					<div class="space-y-2.5">
						<div class="flex justify-between text-sm">
							<span class="font-medium">{labels['system-health.engagement']}</span>
							<span class="text-accent-earth-text text-xs font-medium">
								{stats?.growth?.engagementRate ?? 0} {labels['system-health.per-user']}
							</span>
						</div>
						<div class="bg-bg-hover h-2 overflow-hidden rounded-full">
							<div class="bg-accent-earth h-full rounded-full" style="width: {Math.min((stats?.growth?.engagementRate ?? 0) * 100, 100)}%"></div>
						</div>
					</div>
					<div class="space-y-2.5">
						<div class="flex justify-between text-sm">
							<span class="font-medium">{labels['system-health.monthly-users']}</span>
							<span class="text-accent-earth-text text-xs font-medium">{stats?.recent?.users ?? 0}</span>
						</div>
						<div class="bg-bg-hover h-2 overflow-hidden rounded-full">
							<div class="bg-accent-earth h-full rounded-full" style="width: {Math.min(((stats?.recent?.users ?? 0) / Math.max(stats?.totals?.users ?? 1, 1)) * 100, 100)}%"></div>
						</div>
					</div>
					<div class="space-y-2.5">
						<div class="flex justify-between text-sm">
							<span class="font-medium">{labels['system-health.monthly-comments']}</span>
							<span class="text-text-secondary text-xs font-medium">{stats?.recent?.comments ?? 0}</span>
						</div>
						<div class="bg-bg-hover h-2 overflow-hidden rounded-full">
							<div class="bg-accent-earth h-full rounded-full" style="width: {Math.min(((stats?.recent?.comments ?? 0) / Math.max(stats?.totals?.comments ?? 1, 1)) * 100, 100)}%"></div>
						</div>
					</div>
					<button
						type="button"
						class="text-accent-earth-text mt-2 flex items-center gap-1 text-xs font-medium hover:underline"
						onclick={() => goto(localizedHref('/admin/system-health'))}
					>
						{labels['system-health.view-details']}
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
							<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
