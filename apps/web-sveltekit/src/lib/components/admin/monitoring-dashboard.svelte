<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type MonitoringStats = RouterOutputs['monitoring']['getMonitoringStats']
	type PerformanceMetrics = RouterOutputs['monitoring']['getPerformanceMetrics']
	type ApiUsage = RouterOutputs['monitoring']['getApiUsage']
	type ErrorTracking = RouterOutputs['monitoring']['getErrorTracking']
	type ResourceUsage = RouterOutputs['monitoring']['getResourceUsage']
	type AnalyticsEvents = RouterOutputs['monitoring']['getAnalyticsEvents']

	type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d'

	function isTimeRange(value: string): value is TimeRange {
		return value === '1h' || value === '6h' || value === '24h' || value === '7d' || value === '30d'
	}

	let selectedTab = $state('overview')
	let timeRange = $state<TimeRange>('24h')

	let monitoringStats = $state<MonitoringStats | null>(null)
	let performanceMetrics = $state<PerformanceMetrics | null>(null)
	let apiUsage = $state<ApiUsage | null>(null)
	let errorTracking = $state<ErrorTracking | null>(null)
	let resourceUsage = $state<ResourceUsage | null>(null)
	let analyticsEvents = $state<AnalyticsEvents | null>(null)

	let statsLoading = $state(true)
	let metricsLoading = $state(true)
	let apiLoading = $state(true)
	let errorsLoading = $state(true)
	let resourceLoading = $state(true)
	let analyticsLoading = $state(true)
	let statsError = $state(false)
	let metricsError = $state(false)
	let apiError = $state(false)
	let errorsError = $state(false)
	let resourceError = $state(false)
	let analyticsError = $state(false)

	let isResolving = $state(false)
	let isResolvingAll = $state(false)
	let snapshotInFlight = $state(false)
	let hasSentPageView = $state(false)
	let interval: ReturnType<typeof setInterval> | undefined

	function fetchAll() {
		trpc.monitoring.getMonitoringStats
			.query()
			.then((data) => {
				monitoringStats = data as MonitoringStats
				statsLoading = false
			})
			.catch(() => {
				statsError = true
				statsLoading = false
			})
		trpc.monitoring.getPerformanceMetrics
			.query({ timeRange })
			.then((data) => {
				performanceMetrics = data as PerformanceMetrics
				metricsLoading = false
			})
			.catch(() => {
				metricsError = true
				metricsLoading = false
			})
		trpc.monitoring.getApiUsage
			.query({ timeRange })
			.then((data) => {
				apiUsage = data as ApiUsage
				apiLoading = false
			})
			.catch(() => {
				apiError = true
				apiLoading = false
			})
		trpc.monitoring.getErrorTracking
			.query({ timeRange })
			.then((data) => {
				errorTracking = data as ErrorTracking
				errorsLoading = false
			})
			.catch(() => {
				errorsError = true
				errorsLoading = false
			})
		trpc.monitoring.getResourceUsage
			.query({ timeRange })
			.then((data) => {
				resourceUsage = data as ResourceUsage
				resourceLoading = false
			})
			.catch(() => {
				resourceError = true
				resourceLoading = false
			})
		trpc.monitoring.getAnalyticsEvents
			.query({ timeRange })
			.then((data) => {
				analyticsEvents = data as AnalyticsEvents
				analyticsLoading = false
			})
			.catch(() => {
				analyticsError = true
				analyticsLoading = false
			})
	}

	async function recordSnapshot() {
		if (snapshotInFlight) return
		snapshotInFlight = true
		try {
			await trpc.monitoring.recordResourceSnapshot.mutate()
		} finally {
			snapshotInFlight = false
		}
	}

	function resolveError(errorId: string) {
		isResolving = true
		trpc.monitoring.resolveError
			.mutate({ errorId })
			.then(() => {
				toastSuccess(labels['messages.error-resolved'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.resolve-error-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isResolving = false))
	}

	function resolveAllErrors() {
		isResolvingAll = true
		trpc.monitoring.resolveAllErrors
			.mutate()
			.then(() => {
				toastSuccess(labels['messages.all-errors-resolved'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.resolve-all-errors-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isResolvingAll = false))
	}

	function severityBadge(severity: string) {
		switch (severity) {
			case 'critical':
			case 'high':
				return 'bg-red-500/15 text-red-500'
			case 'medium':
				return 'bg-bg-hover text-text-secondary'
			default:
				return 'border border-[var(--border-faint)]'
		}
	}

	let anyError = $derived(statsError || metricsError || apiError || errorsError || resourceError || analyticsError)

	// Polling every 30s like the React refetchInterval; the page view and the
	// first resource snapshot fire once.
	$effect(() => {
		if (!hasSentPageView) {
			hasSentPageView = true
			trpc.monitoring.recordAnalyticsEvent
				.mutate({
					eventType: 'page_view',
					page: '/admin/monitoring',
					properties: { tab: selectedTab, timeRange }
				})
				.catch(() => {})
		}
		void recordSnapshot()
		fetchAll()
		interval = setInterval(() => {
			void recordSnapshot()
			fetchAll()
		}, 30_000)
		return () => clearInterval(interval)
	})
</script>

{#if statsLoading}
	<div class="p-6">{labels.loading}</div>
{:else}
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-medium">{labels.title}</h1>
				<p class="text-text-secondary">{labels.description}</p>
			</div>
			<select
				bind:value={timeRange}
				aria-label={labels['time-range.last-24-hours']}
				class="bg-bg-hover w-[180px] rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
				onchange={() => fetchAll()}
			>
				<option value="1h">{labels['time-range.last-hour']}</option>
				<option value="6h">{labels['time-range.last-6-hours']}</option>
				<option value="24h">{labels['time-range.last-24-hours']}</option>
				<option value="7d">{labels['time-range.last-7-days']}</option>
				<option value="30d">{labels['time-range.last-30-days']}</option>
			</select>
		</div>

		{#if anyError}
			<div class="text-destructive text-sm">{labels.error}</div>
		{/if}

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.performance']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{monitoringStats?.performance.avgResponseTime?.toFixed(0) ?? '—'}ms</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.metrics-recorded'], { count: monitoringStats?.performance.totalMetrics ?? '—' }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.api-requests']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{monitoringStats?.api.totalRequests ?? '—'}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.error-rate'], { rate: monitoringStats?.api.errorRate?.toFixed(1) ?? '—' }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.errors']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{monitoringStats?.errors.total ?? '—'}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.unresolved'], { count: monitoringStats?.errors.unresolved ?? '—' }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.active-alerts']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{monitoringStats?.alerts.total ?? '—'}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.critical-alerts'], { count: monitoringStats?.alerts.critical ?? '—' }, locale)}
					</p>
				</div>
			</div>
		</div>

		<div class="bg-bg-hover grid w-full grid-cols-2 rounded-md p-1 sm:grid-cols-3 lg:grid-cols-6">
			{#each ['overview', 'performance', 'api', 'errors', 'resources', 'analytics'] as tab (tab)}
				<button
					type="button"
					class="rounded-md px-2 py-1.5 text-sm transition-colors {selectedTab === tab ? 'bg-bg-base text-text-primary shadow' : 'text-text-secondary hover:text-text-primary'}"
					onclick={() => (selectedTab = tab)}
				>
					{labels[`tabs.${tab}`]}
				</button>
			{/each}
		</div>

		{#if selectedTab === 'overview'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['overview.system-health.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['overview.system-health.description']}</p>
					</div>
					<div class="space-y-4 p-6">
						<div class="flex items-center justify-between">
							<span>{labels['overview.system-health.api-response-time']}</span>
							<span class="bg-accent-earth text-text-inverse rounded-full px-2.5 py-0.5 text-xs font-medium">
								{monitoringStats?.api.avgResponseTime?.toFixed(0) ?? '—'}ms
							</span>
						</div>
						<div class="flex items-center justify-between">
							<span>{labels['overview.system-health.error-rate']}</span>
							<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {(monitoringStats?.api.errorRate ?? 0) > 5 ? 'bg-red-500/15 text-red-500' : 'bg-accent-earth text-text-inverse'}">
								{monitoringStats?.api.errorRate?.toFixed(1) ?? '—'}%
							</span>
						</div>
						<div class="flex items-center justify-between">
							<span>{labels['overview.system-health.critical-errors']}</span>
							<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {(monitoringStats?.errors.critical ?? 0) > 0 ? 'bg-red-500/15 text-red-500' : 'bg-accent-earth text-text-inverse'}">
								{monitoringStats?.errors.critical ?? '—'}
							</span>
						</div>
						<div class="flex items-center justify-between">
							<span>{labels['overview.system-health.active-alerts']}</span>
							<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {(monitoringStats?.alerts.total ?? 0) > 0 ? 'bg-bg-hover text-text-secondary' : 'bg-accent-earth text-text-inverse'}">
								{monitoringStats?.alerts.total ?? '—'}
							</span>
						</div>
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['overview.recent-activity.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['overview.recent-activity.description']}</p>
					</div>
					<div class="p-6">
						{#if analyticsLoading}
							<div>{labels['overview.recent-activity.loading']}</div>
						{:else if analyticsError}
							<div class="text-destructive text-sm">{labels.error}</div>
						{:else}
							<div class="space-y-3">
								{#each (analyticsEvents?.events ?? []).slice(0, 5) as event (event.id)}
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-2">
											<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-xs font-medium">{event.eventType}</span>
											<span class="text-sm">{event.user?.name || labels['common.system']}</span>
										</div>
										<span class="text-text-secondary text-xs">{new Date(event.createdAt).toLocaleString()}</span>
									</div>
								{/each}
								{#if (analyticsEvents?.events.length ?? 0) === 0}
									<div class="text-text-secondary text-sm">{labels['overview.recent-activity.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'performance'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['performance.metrics.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['performance.metrics.description']}</p>
					</div>
					<div class="p-6">
						{#if metricsLoading}
							<div>{labels['performance.metrics.loading']}</div>
						{:else if metricsError}
							<div class="text-destructive text-sm">{labels.error}</div>
						{:else}
							<div class="space-y-4">
								{#each Object.entries(performanceMetrics?.metrics ?? {}) as [type, data] (type)}
									<div class="rounded border border-[var(--border-faint)] p-3">
										<div class="mb-2 flex items-center justify-between">
											<span class="font-medium capitalize">{type.replace('_', ' ')}</span>
											<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-xs font-medium">
												{data.latest?.value?.toFixed(2) ?? '—'}
											</span>
										</div>
										<div class="text-text-secondary grid grid-cols-3 gap-2 text-sm">
											<div>{formatMessage(labels['metrics.avg'], { value: data.avg?.toFixed(2) ?? '—' }, locale)}</div>
											<div>{formatMessage(labels['metrics.min'], { value: data.min?.toFixed(2) ?? '—' }, locale)}</div>
											<div>{formatMessage(labels['metrics.max'], { value: data.max?.toFixed(2) ?? '—' }, locale)}</div>
										</div>
									</div>
								{/each}
								{#if Object.keys(performanceMetrics?.metrics ?? {}).length === 0}
									<div class="text-text-secondary text-center">{labels['performance.metrics.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['performance.resources.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['performance.resources.description']}</p>
					</div>
					<div class="p-6">
						{#if resourceLoading}
							<div>{labels['resources.loading']}</div>
						{:else if resourceError}
							<div class="text-destructive text-sm">{labels.error}</div>
						{:else}
							<div class="space-y-4">
								{#each Object.entries(resourceUsage?.usage ?? {}) as [type, data] (type)}
									<div class="rounded border border-[var(--border-faint)] p-3">
										<div class="mb-2 flex items-center justify-between">
											<span class="font-medium capitalize">{type}</span>
											<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {data.alerts > 0 ? 'bg-red-500/15 text-red-500' : 'bg-accent-earth text-text-inverse'}">
												{data.currentUsage?.toFixed(1) ?? '—'}%
											</span>
										</div>
										<div class="text-text-secondary grid grid-cols-2 gap-2 text-sm">
											<div>{formatMessage(labels['metrics.avg-percent'], { value: data.avgUsage?.toFixed(1) ?? '—' }, locale)}</div>
											<div>{formatMessage(labels['metrics.max-percent'], { value: data.maxUsage?.toFixed(1) ?? '—' }, locale)}</div>
										</div>
										{#if data.alerts > 0}
											<div class="text-destructive mt-1 text-xs">
												{formatMessage(labels['performance.resources.threshold-breaches'], { count: data.alerts }, locale)}
											</div>
										{/if}
									</div>
								{/each}
								{#if Object.keys(resourceUsage?.usage ?? {}).length === 0}
									<div class="text-text-secondary text-center">{labels['performance.resources.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'api'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['api.stats.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['api.stats.description']}</p>
					</div>
					<div class="p-6">
						{#if apiLoading}
							<div>{labels['api.loading']}</div>
						{:else if apiError}
							<div class="text-destructive text-sm">{labels.error}</div>
						{:else}
							<div class="space-y-4">
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div class="text-center">
										<div class="text-2xl font-medium">{apiUsage?.stats.totalRequests ?? '—'}</div>
										<div class="text-text-secondary text-sm">{labels['api.stats.total-requests']}</div>
									</div>
									<div class="text-center">
										<div class="text-2xl font-medium">{apiUsage?.stats.uniqueUsers ?? '—'}</div>
										<div class="text-text-secondary text-sm">{labels['api.stats.unique-users']}</div>
									</div>
								</div>
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div class="text-center">
										<div class="text-2xl font-medium">{apiUsage?.stats.avgResponseTime?.toFixed(0) ?? '—'}ms</div>
										<div class="text-text-secondary text-sm">{labels['api.stats.avg-response-time']}</div>
									</div>
									<div class="text-center">
										<div class="text-2xl font-medium">{apiUsage?.stats.errorRate?.toFixed(1) ?? '—'}%</div>
										<div class="text-text-secondary text-sm">{labels['api.stats.error-rate']}</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['api.top-endpoints.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['api.top-endpoints.description']}</p>
					</div>
					<div class="p-6">
						{#if apiLoading}
							<div>{labels['api.top-endpoints.loading']}</div>
						{:else if apiError}
							<div class="text-destructive text-sm">{labels.error}</div>
						{:else}
							<div class="space-y-3">
								{#each Object.entries(apiUsage?.stats.topEndpoints ?? {}).toSorted(([, a], [, b]) => Number(b) - Number(a)).slice(0, 5) as [endpoint, count] (endpoint)}
									<div class="flex items-center justify-between">
										<span class="font-mono text-sm">{endpoint}</span>
										<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-xs font-medium">{count}</span>
									</div>
								{/each}
								{#if Object.keys(apiUsage?.stats.topEndpoints ?? {}).length === 0}
									<div class="text-text-secondary text-center">{labels['api.top-endpoints.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'errors'}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="p-6 pb-0">
					<div class="flex items-center justify-between gap-2">
						<div>
							<h3 class="font-medium">{labels['errors.title']}</h3>
							<p class="text-muted-foreground text-sm">{labels['errors.description']}</p>
						</div>
						<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors disabled:opacity-50" disabled={isResolvingAll} onclick={resolveAllErrors}>
							{labels['actions.resolve-all']}
						</button>
					</div>
				</div>
				<div class="p-6">
					{#if errorsLoading}
						<div>{labels['errors.loading']}</div>
					{:else if errorsError}
						<div class="text-destructive text-sm">{labels.error}</div>
					{:else}
						<div class="space-y-4">
							{#each errorTracking?.errors ?? [] as error (error.id)}
								<div class="rounded-lg border border-[var(--border-subtle)] p-4">
									<div class="mb-2 flex items-center justify-between">
										<div class="flex items-center space-x-2">
											<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {severityBadge(error.errorType || 'unknown')}">
												{error.errorType || 'unknown'}
											</span>
											<span class="font-medium">{error.message}</span>
										</div>
										<div class="flex items-center space-x-2">
											<span class="text-text-secondary text-sm">{new Date(error.firstSeen).toLocaleString()}</span>
											{#if !error.resolved}
												<button type="button" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50" onclick={() => resolveError(error.id)} disabled={isResolving}>
													{labels['actions.resolve']}
												</button>
											{/if}
										</div>
									</div>
									{#if error.errorType}
										<div class="text-text-secondary mb-1 text-sm">
											{formatMessage(labels['errors.type'], { type: error.errorType }, locale)}
										</div>
									{/if}
									{#if error.user}
										<div class="text-text-secondary mb-1 text-sm">
											{formatMessage(labels['errors.user'], { name: error.user.name, email: error.user.email }, locale)}
										</div>
									{/if}
									{#if error.fingerprint}
										<div class="text-text-secondary text-xs">
											{formatMessage(labels['errors.fingerprint'], { fingerprint: error.fingerprint }, locale)}
										</div>
									{/if}
									{#if error.resolved}
										<span class="mt-2 inline-flex rounded-full border border-[var(--border-faint)] px-2.5 py-0.5 text-xs font-medium">
											{formatMessage(labels['errors.resolved'], { date: error.resolvedAt ? new Date(error.resolvedAt).toLocaleString() : '' }, locale)}
										</span>
									{/if}
								</div>
							{/each}
							{#if (errorTracking?.errors.length ?? 0) === 0}
								<div class="text-text-secondary text-center">{labels['errors.empty']}</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{:else if selectedTab === 'resources'}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="p-6 pb-0">
					<h3 class="font-medium">{labels['resources.title']}</h3>
					<p class="text-muted-foreground text-sm">{labels['resources.description']}</p>
				</div>
				<div class="p-6">
					{#if resourceLoading}
						<div>{labels['resources.loading']}</div>
					{:else if resourceError}
						<div class="text-destructive text-sm">{labels.error}</div>
					{:else}
						<div class="grid gap-4 md:grid-cols-2">
							{#each Object.entries(resourceUsage?.usage ?? {}) as [type, data] (type)}
								<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
									<div class="p-6 pb-2">
										<h4 class="text-lg font-medium capitalize">{type}</h4>
									</div>
									<div class="p-6 pt-0">
										<div class="space-y-2">
											<div class="flex justify-between">
												<span>{labels['resources.current-usage']}</span>
												<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {data.currentUsage > 80 ? 'bg-red-500/15 text-red-500' : 'bg-accent-earth text-text-inverse'}">
													{data.currentUsage?.toFixed(1) ?? '—'}%
												</span>
											</div>
											<div class="flex justify-between">
												<span>{labels['resources.average']}</span>
												<span>{data.avgUsage?.toFixed(1) ?? '—'}%</span>
											</div>
											<div class="flex justify-between">
												<span>{labels['resources.peak']}</span>
												<span>{data.maxUsage?.toFixed(1) ?? '—'}%</span>
											</div>
											<div class="flex justify-between">
												<span>{labels['resources.alerts']}</span>
												<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {data.alerts > 0 ? 'bg-red-500/15 text-red-500' : 'border border-[var(--border-faint)]'}">
													{data.alerts ?? '—'}
												</span>
											</div>
										</div>
									</div>
								</div>
							{/each}
							{#if Object.keys(resourceUsage?.usage ?? {}).length === 0}
								<div class="text-text-secondary col-span-2 text-center">{labels['resources.empty']}</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{:else if selectedTab === 'analytics'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['analytics.event-types.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['analytics.event-types.description']}</p>
					</div>
					<div class="p-6">
						{#if analyticsLoading}
							<div>{labels['analytics.event-types.loading']}</div>
						{:else if analyticsError}
							<div class="text-destructive text-sm">{labels.error}</div>
						{:else}
							<div class="space-y-3">
								{#each Object.entries(analyticsEvents?.eventTypes ?? {}).toSorted(([, a], [, b]) => Number(b) - Number(a)) as [type, count] (type)}
									<div class="flex items-center justify-between">
										<span class="text-sm">{type}</span>
										<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-xs font-medium">{count}</span>
									</div>
								{/each}
								{#if Object.keys(analyticsEvents?.eventTypes ?? {}).length === 0}
									<div class="text-text-secondary text-center">{labels['analytics.event-types.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['analytics.recent-events.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['analytics.recent-events.description']}</p>
					</div>
					<div class="p-6">
						{#if analyticsLoading}
							<div>{labels['analytics.recent-events.loading']}</div>
						{:else if analyticsError}
							<div class="text-destructive text-sm">{labels.error}</div>
						{:else}
							<div class="space-y-3">
								{#each (analyticsEvents?.events ?? []).slice(0, 10) as event (event.id)}
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-2">
											<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-xs font-medium">{event.eventType}</span>
											<span class="text-sm">{event.user?.name || labels['common.anonymous']}</span>
										</div>
										<span class="text-text-secondary text-xs">{new Date(event.createdAt).toLocaleString()}</span>
									</div>
								{/each}
								{#if (analyticsEvents?.events.length ?? 0) === 0}
									<div class="text-text-secondary text-center">{labels['analytics.recent-events.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
