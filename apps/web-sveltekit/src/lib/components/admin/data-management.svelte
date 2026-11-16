<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type DataStats = RouterOutputs['dataManagement']['getDataManagementStats']
	type Backups = RouterOutputs['dataManagement']['getDatabaseBackups']
	type Exports = RouterOutputs['dataManagement']['getDataExports']

	let selectedTab = $state('overview')

	let dataStats = $state<DataStats | null>(null)
	let backups = $state<Backups | null>(null)
	let exportsData = $state<Exports | null>(null)

	let statsLoading = $state(true)
	let backupsLoading = $state(true)
	let exportsLoading = $state(true)
	let statsError = $state(false)
	let backupsError = $state(false)
	let exportsError = $state(false)

	let isCreatingBackup = $state(false)
	let isCreatingExport = $state(false)
	let isRunningCheck = $state(false)

	function fetchAll() {
		trpc.dataManagement.getDataManagementStats
			.query()
			.then((data) => {
				dataStats = data as DataStats
				statsLoading = false
			})
			.catch(() => {
				statsError = true
				statsLoading = false
			})
		trpc.dataManagement.getDatabaseBackups
			.query({})
			.then((data) => (backups = data as Backups))
			.catch(() => (backupsError = true))
			.finally(() => (backupsLoading = false))
		trpc.dataManagement.getDataExports
			.query({})
			.then((data) => (exportsData = data as Exports))
			.catch(() => (exportsError = true))
			.finally(() => (exportsLoading = false))
	}

	function createBackup(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const type = formData.get('type') as 'full' | 'incremental' | 'differential'
		const description = formData.get('description') as string

		isCreatingBackup = true
		trpc.dataManagement.createDatabaseBackup
			.mutate({ type, description: description || undefined })
			.then(() => {
				toastSuccess(labels['messages.backup-started'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.backup-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isCreatingBackup = false))
	}

	function createExport(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const name = formData.get('name') as string
		const format = formData.get('format') as 'csv' | 'json' | 'xml' | 'sql' | 'excel'
		const tablesInput = formData.get('tables') as string

		if (!name || !format || !tablesInput) {
			toastError(labels['messages.export-required'])
			return
		}

		const tables = tablesInput
			.split(',')
			.map((table) => table.trim())
			.filter(Boolean)

		isCreatingExport = true
		trpc.dataManagement.createDataExport
			.mutate({ name, format, tables })
			.then(() => {
				toastSuccess(labels['messages.export-started'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.export-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isCreatingExport = false))
	}

	function runQualityCheck(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const name = formData.get('name') as string
		const tableName = formData.get('tableName') as string
		const rulesInput = formData.get('rules') as string

		if (!name || !tableName || !rulesInput) {
			toastError(labels['messages.quality-required'])
			return
		}

		const rules = rulesInput
			.split(',')
			.map((entry) => {
				const [field, ruleType] = entry.trim().split(':')
				return { field: field?.trim(), rule: ruleType?.trim() as 'not_null' | 'unique' | 'format' | 'range' }
			})
			.filter((rule) => rule.field && rule.rule)
			.map((rule) => ({ field: rule.field as string, rule: rule.rule }))

		if (rules.length === 0) {
			toastError(labels['messages.rules-invalid'])
			return
		}

		isRunningCheck = true
		trpc.dataManagement.runDataQualityCheck
			.mutate({ name, tableName, checkRules: rules })
			.then(() => {
				toastSuccess(labels['messages.quality-started'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.quality-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isRunningCheck = false))
	}

	function statusBadge(status: string) {
		switch (status) {
			case 'completed':
				return 'bg-status-success-soft text-status-success'
			case 'in_progress':
			case 'processing':
			case 'running':
				return 'bg-status-info-soft text-status-info'
			case 'pending':
				return 'bg-action-primary-soft text-accent-gold'
			case 'failed':
				return 'bg-status-danger-soft text-status-danger'
			default:
				return 'border border-[var(--border-faint)]'
		}
	}

	function formatFileSize(bytes: number) {
		if (bytes === 0) return labels['file-size.zero']
		const k = 1024
		const sizes = [labels['file-size.bytes'], 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return Number((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	function statusLabel(status: string) {
		switch (status) {
			case 'completed':
				return labels['status.completed']
			case 'in_progress':
				return labels['status.in-progress']
			case 'processing':
				return labels['status.processing']
			case 'running':
				return labels['status.running']
			case 'pending':
				return labels['status.pending']
			case 'failed':
				return labels['status.failed']
			default:
				return status
		}
	}

	function backupTypeLabel(type: string) {
		switch (type) {
			case 'full':
				return labels['backup-types.full']
			case 'incremental':
				return labels['backup-types.incremental']
			case 'differential':
				return labels['backup-types.differential']
			default:
				return type
		}
	}

	$effect(() => {
		fetchAll()
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
		</div>

		{#if statsError}
			<div class="text-destructive text-sm">{labels['stats.error']}</div>
		{/if}

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.database-backups']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{dataStats?.backups.total ?? '—'}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.completed-count'], { count: dataStats?.backups.completed ?? '—' }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.backup-size']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{dataStats ? formatFileSize(dataStats.backups.totalSize) : '—'}</div>
					<p class="text-text-secondary text-xs">{labels['stats.total-storage-used']}</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.data-exports']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{dataStats?.exports.total ?? '—'}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.completed-count'], { count: dataStats?.exports.completed ?? '—' }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.records-exported']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{dataStats ? dataStats.exports.totalRecords.toLocaleString() : '—'}</div>
					<p class="text-text-secondary text-xs">{labels['stats.total-records-processed']}</p>
				</div>
			</div>
		</div>

		<div class="bg-bg-hover grid w-full grid-cols-2 rounded-md p-1 sm:grid-cols-4">
			{#each ['overview', 'backups', 'exports', 'quality'] as tab (tab)}
				<button type="button" class="rounded-md px-2 py-1.5 text-sm transition-colors {selectedTab === tab ? 'bg-bg-base text-text-primary shadow' : 'text-text-secondary hover:text-text-primary'}" onclick={() => (selectedTab = tab)}>
					{labels[`tabs.${tab}`]}
				</button>
			{/each}
		</div>

		{#if selectedTab === 'overview'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['overview.recent-backups.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['overview.recent-backups.description']}</p>
					</div>
					<div class="p-6">
						{#if backupsLoading}
							<div>{labels['backups.loading']}</div>
						{:else if backupsError}
							<div class="text-destructive text-sm">{labels['backups.error']}</div>
						{:else}
							<div class="space-y-3">
								{#if (backups?.backups.length ?? 0) > 0}
									{#each (backups?.backups ?? []).slice(0, 5) as backup (backup.id)}
										<div class="flex items-center justify-between">
											<div class="flex items-center space-x-2">
												<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadge(backup.status)}">{statusLabel(backup.status)}</span>
												<span class="text-sm">
													{formatMessage(labels['backups.backup-label'], { type: backupTypeLabel(backup.type) }, locale)}
												</span>
											</div>
											<span class="text-text-secondary text-xs">{new Date(backup.createdAt).toLocaleDateString()}</span>
										</div>
									{/each}
								{:else}
									<div class="text-text-secondary text-sm">{labels['backups.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['overview.recent-exports.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['overview.recent-exports.description']}</p>
					</div>
					<div class="p-6">
						{#if exportsLoading}
							<div>{labels['exports.loading']}</div>
						{:else if exportsError}
							<div class="text-destructive text-sm">{labels['exports.error']}</div>
						{:else}
							<div class="space-y-3">
								{#if (exportsData?.exports.length ?? 0) > 0}
									{#each (exportsData?.exports ?? []).slice(0, 5) as exportItem (exportItem.id)}
										<div class="flex items-center justify-between">
											<div class="flex items-center space-x-2">
												<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadge(exportItem.status)}">{statusLabel(exportItem.status)}</span>
												<span class="text-sm">{exportItem.name}</span>
											</div>
											<span class="text-text-secondary text-xs">{new Date(exportItem.createdAt).toLocaleDateString()}</span>
										</div>
									{/each}
								{:else}
									<div class="text-text-secondary text-sm">{labels['exports.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'backups'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['backups.create-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['backups.create-description']}</p>
					</div>
					<div class="p-6">
						<form onsubmit={createBackup} class="space-y-4">
							<div>
								<label for="backupType" class="text-sm font-medium">{labels['fields.backup-type']}</label>
								<select id="backupType" name="type" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
									<option value="full">{labels['backup-types.full-backup']}</option>
									<option value="incremental">{labels['backup-types.incremental-backup']}</option>
									<option value="differential">{labels['backup-types.differential-backup']}</option>
								</select>
							</div>
							<div>
								<label for="backupDescription" class="text-sm font-medium">{labels['fields.description-optional']}</label>
								<input id="backupDescription" name="description" placeholder={labels['fields.backup-description-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<button type="submit" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={isCreatingBackup}>
								{isCreatingBackup ? labels['actions.creating-backup'] : labels['actions.create-backup']}
							</button>
						</form>
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['backups.list-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['backups.list-description']}</p>
					</div>
					<div class="p-6">
						{#if backupsLoading}
							<div>{labels['backups.loading']}</div>
						{:else if backupsError}
							<div class="text-destructive text-sm">{labels['backups.error']}</div>
						{:else}
							<div class="space-y-3">
								{#if (backups?.backups.length ?? 0) > 0}
									{#each backups?.backups ?? [] as backup (backup.id)}
										<div class="rounded border border-[var(--border-faint)] p-3">
											<div class="mb-2 flex items-center justify-between">
												<div class="flex items-center space-x-2">
													<span class="font-medium">
														{formatMessage(labels['backups.backup-label'], { type: backupTypeLabel(backup.type) }, locale)}
													</span>
												</div>
												<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadge(backup.status)}">{statusLabel(backup.status)}</span>
											</div>
											{#if backup.name}
												<div class="text-text-secondary mb-2 text-sm">{backup.name}</div>
											{/if}
											<div class="flex items-center justify-between text-sm">
												<span class="text-text-secondary">
													{backup.fileSize ? formatFileSize(backup.fileSize) : labels['file-size.unknown']}
												</span>
												<span class="text-text-secondary">{new Date(backup.createdAt).toLocaleString()}</span>
											</div>
											{#if backup.completedAt}
												<div class="text-text-secondary mt-1 text-xs">
													{formatMessage(labels['date.completed'], { date: new Date(backup.completedAt).toLocaleString() }, locale)}
												</div>
											{/if}
										</div>
									{/each}
								{:else}
									<div class="text-text-secondary text-center">{labels['backups.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'exports'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['exports.create-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['exports.create-description']}</p>
					</div>
					<div class="p-6">
						<form onsubmit={createExport} class="space-y-4">
							<div>
								<label for="exportName" class="text-sm font-medium">{labels['fields.export-name']}</label>
								<input id="exportName" name="name" required placeholder={labels['fields.export-name-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="exportFormat" class="text-sm font-medium">{labels['fields.format']}</label>
								<select id="exportFormat" name="format" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
									<option value="csv">CSV</option>
									<option value="json">JSON</option>
									<option value="xml">XML</option>
									<option value="excel">Excel</option>
								</select>
							</div>
							<div>
								<label for="exportTables" class="text-sm font-medium">{labels['fields.tables']}</label>
								<input id="exportTables" name="tables" required placeholder={labels['fields.tables-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<button type="submit" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={isCreatingExport}>
								{isCreatingExport ? labels['actions.creating-export'] : labels['actions.create-export']}
							</button>
						</form>
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['exports.list-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['exports.list-description']}</p>
					</div>
					<div class="p-6">
						{#if exportsLoading}
							<div>{labels['exports.loading']}</div>
						{:else if exportsError}
							<div class="text-destructive text-sm">{labels['exports.error']}</div>
						{:else}
							<div class="space-y-3">
								{#if (exportsData?.exports.length ?? 0) > 0}
									{#each exportsData?.exports ?? [] as exportItem (exportItem.id)}
										<div class="rounded border border-[var(--border-faint)] p-3">
											<div class="mb-2 flex items-center justify-between">
												<div class="flex items-center space-x-2">
													<span class="font-medium">{exportItem.name}</span>
												</div>
												<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadge(exportItem.status)}">{statusLabel(exportItem.status)}</span>
											</div>
											<div class="text-text-secondary mb-2 text-sm">
												{formatMessage(labels['exports.format'], { format: exportItem.format.toUpperCase() }, locale)}
											</div>
											<div class="flex items-center justify-between text-sm">
												<span class="text-text-secondary">
													{exportItem.recordCount
														? formatMessage(labels['exports.records'], { count: exportItem.recordCount.toLocaleString() }, locale)
														: labels['exports.processing']}
												</span>
												<span class="text-text-secondary">{new Date(exportItem.createdAt).toLocaleString()}</span>
											</div>
											{#if exportItem.completedAt}
												<div class="text-text-secondary mt-1 text-xs">
													{formatMessage(labels['date.completed'], { date: new Date(exportItem.completedAt).toLocaleString() }, locale)}
												</div>
											{/if}
											{#if exportItem.fileSize}
												<div class="text-text-secondary text-xs">
													{formatMessage(labels['file-size.size'], { size: formatFileSize(exportItem.fileSize) }, locale)}
												</div>
											{/if}
										</div>
									{/each}
								{:else}
									<div class="text-text-secondary text-center">{labels['exports.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'quality'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['quality.create-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['quality.create-description']}</p>
					</div>
					<div class="p-6">
						<form onsubmit={runQualityCheck} class="space-y-4">
							<div>
								<label for="qualityCheckName" class="text-sm font-medium">{labels['fields.check-name']}</label>
								<input id="qualityCheckName" name="name" required placeholder={labels['fields.check-name-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="qualityTableName" class="text-sm font-medium">{labels['fields.table-name']}</label>
								<input id="qualityTableName" name="tableName" required placeholder={labels['fields.table-name-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="qualityRules" class="text-sm font-medium">{labels['fields.rules']}</label>
								<textarea id="qualityRules" name="rules" rows="3" required placeholder={labels['fields.rules-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
								<div class="text-text-secondary mt-1 text-xs">{labels['fields.rules-help']}</div>
							</div>
							<button type="submit" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={isRunningCheck}>
								{isRunningCheck ? labels['actions.running-check'] : labels['actions.run-quality-check']}
							</button>
						</form>
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['quality.overview-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['quality.overview-description']}</p>
					</div>
					<div class="p-6">
						<div class="text-text-secondary py-8 text-center">
							<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto mb-4 h-12 w-12 opacity-50">
								<circle cx="12" cy="12" r="10" /><polyline points="9 12 11.5 14.5 15.5 10" />
							</svg>
							<p>{labels['quality.empty-title']}</p>
							<p class="mt-2 text-sm">{labels['quality.empty-description']}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
