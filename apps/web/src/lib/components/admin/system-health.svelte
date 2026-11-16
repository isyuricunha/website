<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type HealthData = RouterOutputs['system']['getSystemHealth']
	type StatsData = RouterOutputs['system']['getSystemStats']
	type ErrorLog = RouterOutputs['system']['getErrorLogs']['logs'][number]

	let autoRefresh = $state(false)
	let selectedCheckType = $state('all')
	let lastCheckedAt = $state(new Date().toLocaleString())
	let healthData = $state<HealthData | null>(null)
	let statsData = $state<StatsData | null>(null)
	let errorLogs = $state<RouterOutputs['system']['getErrorLogs'] | null>(null)
	let healthLoading = $state(true)
	let statsLoading = $state(true)
	let isResolving = $state(false)
	let isResolvingAll = $state(false)
	let interval: ReturnType<typeof setInterval> | undefined

	async function fetchAll() {
		const health = trpc.system.getSystemHealth
			.query()
			.then((data) => {
				healthData = data as HealthData
				healthLoading = false
			})
			.catch(() => (healthLoading = false))
		const stats = trpc.system.getSystemStats
			.query()
			.then((data) => {
				statsData = data as StatsData
				statsLoading = false
			})
			.catch(() => (statsLoading = false))
		const errors = trpc.system.getErrorLogs
			.query({ resolved: false, limit: 10 })
			.then((data) => (errorLogs = data as RouterOutputs['system']['getErrorLogs']))
			.catch(() => {})
		await Promise.all([health, stats, errors])
	}

	function refresh() {
		fetchAll()
		lastCheckedAt = new Date().toLocaleString()
		toastSuccess(labels['messages.refreshed'])
	}

	function resolveError(errorId: string) {
		isResolving = true
		trpc.system.resolveError
			.mutate({ errorId })
			.then(async () => {
				toastSuccess(labels['messages.error-resolved'])
				await fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.resolve-error-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isResolving = false))
	}

	function resolveAllErrors() {
		isResolvingAll = true
		trpc.system.resolveAllErrors
			.mutate()
			.then(async () => {
				toastSuccess(labels['messages.all-errors-resolved'])
				await fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.resolve-all-errors-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isResolvingAll = false))
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'healthy':
				return labels['status.healthy']
			case 'warning':
				return labels['status.warning']
			case 'critical':
				return labels['status.critical']
			default:
				return labels['status.unknown']
		}
	}

	function getStatusIcon(status: string) {
		if (status === 'healthy') {
			return '<circle cx="12" cy="12" r="10" class="text-status-success" /><polyline points="9 12 11.5 14.5 15.5 10" />'
		}
		if (status === 'warning') {
			return '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" />'
		}
		if (status === 'critical') {
			return '<circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />'
		}
		return '<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />'
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'healthy':
				return 'text-status-success bg-status-success-soft'
			case 'warning':
				return 'text-accent-gold bg-action-primary-soft'
			case 'critical':
				return 'text-status-danger bg-status-danger-soft'
			default:
				return 'text-text-secondary bg-bg-surface'
		}
	}

	function formatResponseTime(ms: number) {
		if (ms < 1000) return `${ms}ms`
		return `${(ms / 1000).toFixed(2)}s`
	}

	function formatUptime(percentage: number) {
		return `${percentage.toFixed(2)}%`
	}

	let history = $derived(healthData?.history ?? [])

	let availableCheckTypes = $derived.by(() => {
		const set = new Set<string>()
		for (const row of history) {
			if (row?.checkType) set.add(row.checkType)
		}
		return Array.from(set).toSorted((a, b) => a.localeCompare(b))
	})

	let filteredHistory = $derived(
		selectedCheckType === 'all' ? history : history.filter((row) => row.checkType === selectedCheckType)
	)

	let historyStats = $derived.by(() => {
		const stats = { healthy: 0, warning: 0, critical: 0, unknown: 0 }
		for (const row of filteredHistory) {
			if (row.status === 'healthy') stats.healthy += 1
			else if (row.status === 'warning') stats.warning += 1
			else if (row.status === 'critical') stats.critical += 1
			else stats.unknown += 1
		}
		return stats
	})

	$effect(() => {
		fetchAll()
		if (autoRefresh) {
			interval = setInterval(() => {
				fetchAll()
				lastCheckedAt = new Date().toLocaleString()
			}, 30_000)
		}
		return () => clearInterval(interval)
	})
</script>

{#if healthLoading || statsLoading}
	<div class="space-y-6">
		<div class="animate-pulse">
			<div class="bg-bg-hover mb-4 h-8 w-1/4 rounded"></div>
			<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{#each Array.from({ length: 4 }) as _, i (i)}
					<div class="bg-bg-hover h-24 rounded"></div>
				{/each}
			</div>
			<div class="space-y-3">
				{#each Array.from({ length: 3 }) as _, i (i)}
					<div class="bg-bg-hover h-20 rounded"></div>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-medium">{labels.title}</h1>
				<p class="text-text-secondary">{labels.description}</p>
			</div>
			<div class="flex items-center gap-2">
				<label class="text-text-secondary flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={autoRefresh} class="rounded border-[var(--border-subtle)]" />
					{labels['auto-refresh']}
				</label>
				<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors" onclick={refresh}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4">
						<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
					</svg>
					{labels['actions.refresh']}
				</button>
			</div>
		</div>

		{#if healthData}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
							{@html getStatusIcon(healthData.overallStatus)}
						</svg>
						<div>
							<h2 class="text-lg font-medium">
								{formatMessage(labels['overall.status'], { status: getStatusLabel(healthData.overallStatus) }, locale)}
							</h2>
							<p class="text-text-secondary text-sm">
								{formatMessage(labels['overall.last-checked'], { date: lastCheckedAt }, locale)}
							</p>
						</div>
					</div>
					{#if statsData}
						<div class="text-right">
							<div class="text-2xl font-medium">{formatUptime(statsData.health.uptime)}</div>
							<div class="text-text-secondary text-sm">{labels['overall.uptime']}</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		{#if statsData}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
					<div class="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-status-success h-8 w-8">
							<circle cx="12" cy="12" r="10" /><polyline points="9 12 11.5 14.5 15.5 10" />
						</svg>
						<div class="ml-4">
							<p class="text-text-secondary text-sm font-medium">{labels['stats.healthy-checks']}</p>
							<p class="text-2xl font-medium">{statsData.health.healthy}</p>
						</div>
					</div>
				</div>
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
					<div class="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-gold h-8 w-8">
							<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" />
						</svg>
						<div class="ml-4">
							<p class="text-text-secondary text-sm font-medium">{labels['stats.warnings']}</p>
							<p class="text-2xl font-medium">{statsData.health.warning}</p>
						</div>
					</div>
				</div>
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
					<div class="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-status-danger h-8 w-8">
							<circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
						</svg>
						<div class="ml-4">
							<p class="text-text-secondary text-sm font-medium">{labels['stats.critical-issues']}</p>
							<p class="text-2xl font-medium">{statsData.health.critical}</p>
						</div>
					</div>
				</div>
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
					<div class="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-status-danger h-8 w-8">
							<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
						</svg>
						<div class="ml-4">
							<p class="text-text-secondary text-sm font-medium">{labels['stats.unresolved-errors']}</p>
							<p class="text-2xl font-medium">{statsData.errors.unresolved}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if healthData}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="border-b border-[var(--border-subtle)] px-6 py-4">
					<h3 class="text-lg font-medium">{labels['service-health.title']}</h3>
				</div>
				<div class="p-6">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each healthData.checks as check, index (index)}
							<div class="rounded-lg border border-[var(--border-subtle)] p-4 {getStatusColor(check.status)}">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<h4 class="font-medium capitalize">{check.type.replace('_', ' ')}</h4>
									</div>
									<div class="text-right">
										<div class="mt-1 text-xs">{formatResponseTime(check.responseTime)}</div>
									</div>
								</div>
								<p class="text-text-secondary mt-1 text-sm">{check.message}</p>
								{#if check.details && Object.keys(check.details).length > 0}
									<div class="text-text-secondary mt-3 text-xs">
										<pre class="whitespace-pre-wrap">{JSON.stringify(check.details, null, 2)}</pre>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		{#if errorLogs && errorLogs.logs.length > 0}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="border-b border-[var(--border-subtle)] px-6 py-4">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-medium">{labels['recent-errors.title']}</h3>
						<div class="flex items-center gap-2">
							<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors disabled:opacity-50" disabled={isResolvingAll} onclick={resolveAllErrors}>
								{labels['actions.resolve-all']}
							</button>
							<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors">
								{labels['actions.view-all-errors']}
							</button>
						</div>
					</div>
				</div>
				<div class="divide-y divide-[var(--border-subtle)]">
					{#each errorLogs.logs.slice(0, 5) as error (error.id)}
						<div class="p-6">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="mb-2 flex items-center gap-2">
										<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {error.level === 'error' ? 'bg-status-danger-soft text-status-danger' : 'text-accent-gold bg-action-primary-soft'}">
											{error.level.toUpperCase()}
										</span>
										<span class="text-text-secondary text-sm">{new Date(error.createdAt).toLocaleString()}</span>
									</div>
									<p class="mb-1 text-sm font-medium">{error.message}</p>
									{#if error.url}
										<p class="text-text-secondary mb-1 text-xs">
											{formatMessage(labels['recent-errors.url'], { url: error.url }, locale)}
										</p>
									{/if}
									{#if error.user}
										<p class="text-text-secondary text-xs">
											{formatMessage(labels['recent-errors.user'], { name: error.user.name, email: error.user.email }, locale)}
										</p>
									{/if}
								</div>
								<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors disabled:opacity-50" disabled={isResolving} onclick={() => resolveError(error.id)}>
									{labels['actions.resolve']}
								</button>
							</div>
							{#if error.stack}
								<details class="mt-3">
									<summary class="text-text-secondary cursor-pointer text-xs">{labels['recent-errors.stack-trace']}</summary>
									<pre class="bg-bg-hover mt-2 overflow-x-auto rounded p-2 text-xs">{error.stack}</pre>
								</details>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
			<h3 class="mb-4 text-lg font-medium">{labels['trends.title']}</h3>
			<div class="space-y-4">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div class="text-text-secondary text-sm">
						{formatMessage(labels['trends.last-checks'], { count: filteredHistory.length }, locale)}
					</div>
					<div class="flex items-center gap-2">
						<label for="health-check-filter" class="text-text-secondary text-sm">{labels['trends.filter']}</label>
						<select bind:value={selectedCheckType} id="health-check-filter" class="bg-bg-base text-text-primary h-9 rounded-md border border-[var(--border-subtle)] px-3 text-sm">
							<option value="all">{labels['trends.all-services']}</option>
							{#each availableCheckTypes as checkType (checkType)}
								<option value={checkType}>{checkType}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
					<div class="bg-bg-base rounded-md border border-[var(--border-subtle)] p-3">
						<div class="text-text-secondary text-xs">{labels['trends.stats.healthy']}</div>
						<div class="text-text-primary text-lg font-medium">{historyStats.healthy}</div>
					</div>
					<div class="bg-bg-base rounded-md border border-[var(--border-subtle)] p-3">
						<div class="text-text-secondary text-xs">{labels['trends.stats.warnings']}</div>
						<div class="text-text-primary text-lg font-medium">{historyStats.warning}</div>
					</div>
					<div class="bg-bg-base rounded-md border border-[var(--border-subtle)] p-3">
						<div class="text-text-secondary text-xs">{labels['trends.stats.critical']}</div>
						<div class="text-text-primary text-lg font-medium">{historyStats.critical}</div>
					</div>
					<div class="bg-bg-base rounded-md border border-[var(--border-subtle)] p-3">
						<div class="text-text-secondary text-xs">{labels['trends.stats.unknown']}</div>
						<div class="text-text-primary text-lg font-medium">{historyStats.unknown}</div>
					</div>
				</div>

				{#if filteredHistory.length === 0}
					<div class="text-text-secondary flex h-40 items-center justify-center">
						<div class="text-center">
							<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto mb-2 h-12 w-12 opacity-50">
								<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
							</svg>
							<p>{labels['trends.empty-title']}</p>
							<p class="text-sm">{labels['trends.empty-description']}</p>
						</div>
					</div>
				{:else}
					<div class="overflow-x-auto rounded-md border border-[var(--border-subtle)]">
						<table class="w-full text-sm">
							<thead class="bg-bg-hover text-text-secondary text-left text-xs">
								<tr>
									<th class="px-3 py-2">{labels['trends.table.time']}</th>
									<th class="px-3 py-2">{labels['trends.table.service']}</th>
									<th class="px-3 py-2">{labels['trends.table.status']}</th>
									<th class="px-3 py-2">{labels['trends.table.latency']}</th>
									<th class="px-3 py-2">{labels['trends.table.message']}</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-[var(--border-subtle)]">
								{#each filteredHistory.slice(0, 15) as row (row.id)}
									<tr class="bg-bg-base">
										<td class="text-text-secondary px-3 py-2">{new Date(row.createdAt).toLocaleString()}</td>
										<td class="text-text-primary px-3 py-2 font-medium">{row.checkType}</td>
										<td class="px-3 py-2">
											<span class="inline-flex items-center gap-2 rounded-full px-2 py-0.5 {getStatusColor(row.status)}">
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
													{@html getStatusIcon(row.status)}
												</svg>
												<span class="text-xs font-medium">{getStatusLabel(row.status)}</span>
											</span>
										</td>
										<td class="text-text-secondary px-3 py-2">
											{typeof row.responseTime === 'number' ? formatResponseTime(row.responseTime) : '—'}
										</td>
										<td class="text-text-secondary px-3 py-2">{row.message}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
