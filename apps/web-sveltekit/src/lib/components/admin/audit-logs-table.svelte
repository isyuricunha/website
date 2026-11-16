<script lang="ts">
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'

	let {
		data,
		labels
	}: {
		data: RouterOutputs['admin']['getAuditLogs']['logs']
		labels: Record<string, string>
	} = $props()

	type AuditLog = RouterOutputs['admin']['getAuditLogs']['logs'][number]

	let searchTerm = $state('')
	let debouncedSearchTerm = $state('')
	let debounceTimer: ReturnType<typeof setTimeout> | undefined
	let sortColumn = $state<'createdAt' | 'action' | 'admin' | 'targetType' | 'targetId' | 'ipAddress'>('createdAt')
	let sortDirection = $state<'asc' | 'desc'>('desc')
	let page = $state(1)
	let pageSize = $state(10)

	function updateSearchTerm(value: string) {
		searchTerm = value
		clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			debouncedSearchTerm = value
			page = 1
		}, 300)
	}

	function clearSearch() {
		searchTerm = ''
		debouncedSearchTerm = ''
		page = 1
	}

	let filteredData = $derived.by(() => {
		if (!debouncedSearchTerm) return data
		const query = debouncedSearchTerm.toLowerCase()
		return data.filter((log) => {
			const createdAt = log.createdAt ? new Date(log.createdAt).toLocaleString() : ''
			const details = log.details ? JSON.stringify(log.details) : ''
			return (
				log.action.toLowerCase().includes(query) ||
				(log.targetType ?? '').toLowerCase().includes(query) ||
				(log.targetId ?? '').toLowerCase().includes(query) ||
				(log.adminUser?.email ?? '').toLowerCase().includes(query) ||
				(log.adminUser?.name ?? '').toLowerCase().includes(query) ||
				(log.ipAddress ?? '').toLowerCase().includes(query) ||
				(log.userAgent ?? '').toLowerCase().includes(query) ||
				createdAt.toLowerCase().includes(query) ||
				details.toLowerCase().includes(query)
			)
		})
	})

	let sortedData = $derived.by(() => {
		const rows = [...filteredData]
		rows.sort((a, b) => {
			let aValue: string
			let bValue: string
			if (sortColumn === 'createdAt') {
				aValue = String(new Date(a.createdAt).getTime())
				bValue = String(new Date(b.createdAt).getTime())
			} else if (sortColumn === 'admin') {
				aValue = a.adminUser?.email ?? ''
				bValue = b.adminUser?.email ?? ''
			} else {
				aValue = String(a[sortColumn] ?? '')
				bValue = String(b[sortColumn] ?? '')
			}
			const result = aValue.localeCompare(bValue)
			return sortDirection === 'asc' ? result : -result
		})
		return rows
	})

	let totalPages = $derived(Math.max(1, Math.ceil(sortedData.length / pageSize)))
	let pagedData = $derived(sortedData.slice((page - 1) * pageSize, page * pageSize))

	function toggleSort(column: string) {
		const col = column as typeof sortColumn
		if (sortColumn === col) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
		} else {
			sortColumn = col
			sortDirection = 'asc'
		}
	}

	function sortIcon(column: string) {
		if (sortColumn !== column) return ''
		return sortDirection === 'asc' ? '▲' : '▼'
	}

	let columns = $derived([
		{ id: 'createdAt', label: labels['columns.createdAt'] },
		{ id: 'action', label: labels['columns.action'] },
		{ id: 'admin', label: labels['columns.admin'] },
		{ id: 'targetType', label: labels['columns.targetType'] },
		{ id: 'targetId', label: labels['columns.targetId'] },
		{ id: 'ipAddress', label: labels['columns.ipAddress'] }
	])
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-2">
			<div class="relative">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary absolute top-2.5 left-2 h-4 w-4">
					<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
				</svg>
				<input
					aria-label={labels['search-placeholder']}
					placeholder={labels['search-placeholder']}
					value={searchTerm}
					oninput={(e) => updateSearchTerm(e.currentTarget.value)}
					class="bg-bg-hover w-80 rounded-md border border-[var(--border-faint)] py-2 pr-8 pl-8 text-sm"
				/>
				{#if searchTerm}
					<button type="button" class="hover:bg-bg-hover absolute top-1 right-1 h-6 w-6 rounded p-0" aria-label={labels['search-placeholder']} onclick={clearSearch}>
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
							<path d="M18 6 6 18" /><path d="m6 6 12 12" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
	</div>

	<div class="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
		<table class="w-full text-sm">
			<thead>
				<tr class="bg-bg-hover border-b border-[var(--border-subtle)]">
					{#each columns as column (column.id)}
						<th class="p-3 text-left font-medium">
							<button type="button" class="hover:text-text-primary inline-flex items-center gap-1" onclick={() => toggleSort(column.id)}>
								{column.label}
								<span class="text-[10px]">{sortIcon(column.id)}</span>
							</button>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each pagedData as log (log.id)}
					<tr class="bg-bg-surface hover:bg-bg-hover border-b border-[var(--border-subtle)] transition-colors">
						<td class="text-muted-foreground p-3">{new Date(log.createdAt).toLocaleString()}</td>
						<td class="p-3">
							<span class="bg-bg-hover inline-flex rounded-full px-2 py-0.5 text-xs font-medium">{log.action}</span>
						</td>
						<td class="p-3">{log.adminUser?.email ?? ''}</td>
						<td class="text-muted-foreground p-3">{log.targetType ?? ''}</td>
						<td class="text-muted-foreground p-3">{log.targetId ?? ''}</td>
						<td class="text-muted-foreground p-3">{log.ipAddress ?? ''}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="text-muted-foreground flex items-center justify-between text-xs">
		<span>{sortedData.length}</span>
		<div class="flex items-center gap-2">
			<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-2 py-1 transition-colors disabled:opacity-50" disabled={page <= 1} onclick={() => (page = page - 1)}>
				←
			</button>
			<span>{page} / {totalPages}</span>
			<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-2 py-1 transition-colors disabled:opacity-50" disabled={page >= totalPages} onclick={() => (page = page + 1)}>
				→
			</button>
		</div>
	</div>
</div>
