<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import { exportToCSV, COMMENT_EXPORT_COLUMNS } from '@isyuricunha/trpc-server/utils/csv/csv-export'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'
	import ConfirmationDialog from './confirmation-dialog.svelte'

	let { data, labels, locale }: { data: AdminComment[]; labels: Record<string, string>; locale: string } = $props()

	type AdminComment = RouterOutputs['comments']['getComments']['comments'][number]

	let searchTerm = $state('')
	let debouncedSearchTerm = $state('')
	let debounceTimer: ReturnType<typeof setTimeout> | undefined
	let sortColumn = $state<'userId' | 'body' | 'type' | 'createdAt'>('createdAt')
	let sortDirection = $state<'asc' | 'desc'>('desc')
	let page = $state(1)
	let pageSize = $state(10)
	let menuComment = $state<string | null>(null)
	let isMutating = $state(false)
	let confirmDialog = $state<{
		open: boolean
		title: string
		description: string
		variant?: 'default' | 'destructive'
		action?: () => void
	}>({ open: false, title: '', description: '' })

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

	function deleteComment(commentId: string, commentBody: string) {
		const truncatedBody = commentBody && commentBody.length > 50 ? commentBody.slice(0, 50) + '...' : commentBody
		confirmDialog = {
			open: true,
			title: labels['delete-title'],
			description: formatMessage(labels['confirm-delete-with-body'], { body: truncatedBody }, locale),
			variant: 'destructive',
			action: () => {
				confirmDialog = { ...confirmDialog, open: false }
				isMutating = true
				trpc.comments.deleteComment
					.mutate({ commentId })
					.then(() => toastSuccess(labels['delete-success']))
					.catch(() => toastError(labels['delete-error']))
					.finally(() => (isMutating = false))
			}
		}
	}

	function exportCsv() {
		exportToCSV(filteredData, `comments-${new Date().toISOString().split('T')[0]}`, COMMENT_EXPORT_COLUMNS as never)
		toastSuccess(labels['export-success'])
	}

	let filteredData = $derived.by(() => {
		const term = debouncedSearchTerm.toLowerCase()
		if (!term) return data
		return data.filter(
			(comment) =>
				comment.body?.toLowerCase().includes(term) ||
				comment.userId?.toLowerCase().includes(term) ||
				comment.type?.toLowerCase().includes(term)
		)
	})

	let sortedData = $derived.by(() => {
		const rows = [...filteredData]
		rows.sort((a, b) => {
			const value = (comment: AdminComment) =>
				comment[sortColumn] instanceof Date
					? (comment[sortColumn] as unknown as Date).getTime()
					: comment[sortColumn]
			const aValue = value(a)
			const bValue = value(b)
			let result: number
			if (typeof aValue === 'number' && typeof bValue === 'number') {
				result = aValue - bValue
			} else {
				result = String(aValue ?? '').localeCompare(String(bValue ?? ''))
			}
			return sortDirection === 'asc' ? result : -result
		})
		return rows
	})

	let totalPages = $derived(Math.max(1, Math.ceil(sortedData.length / pageSize)))
	let pagedData = $derived(sortedData.slice((page - 1) * pageSize, page * pageSize))

	function toggleSort(column: string) {
		const col = column as 'userId' | 'body' | 'type' | 'createdAt'
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
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-2">
			<div class="relative">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary absolute top-2.5 left-2 h-4 w-4">
					<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
				</svg>
				<input
					aria-label={labels.search}
					placeholder={labels.search}
					value={searchTerm}
					oninput={(e) => updateSearchTerm(e.currentTarget.value)}
					class="bg-bg-hover w-64 rounded-md border border-[var(--border-faint)] py-2 pr-8 pl-8 text-sm"
				/>
				{#if searchTerm}
					<button type="button" class="hover:bg-bg-hover absolute top-1 right-1 h-6 w-6 rounded p-0" aria-label={labels.search} onclick={clearSearch}>
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
							<path d="M18 6 6 18" /><path d="m6 6 12 12" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
		<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors" onclick={exportCsv}>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
			</svg>
			{labels['export-csv']}
		</button>
	</div>

	<div class="overflow-hidden rounded-lg border border-[var(--border-subtle)]">
		<table class="w-full text-sm">
			<thead>
				<tr class="bg-bg-hover border-b border-[var(--border-subtle)]">
					{#each [['userId', 'userId'], ['body', 'body'], ['type', 'type'], ['createdAt', 'createdAt']] as [column, labelKey] (column)}
						<th class="p-3 text-left font-medium">
							<button type="button" class="hover:text-text-primary inline-flex items-center gap-1" onclick={() => toggleSort(column)}>
								{labels[labelKey]}
								<span class="text-[10px]">{sortIcon(column)}</span>
							</button>
						</th>
					{/each}
					<th class="p-3 text-left font-medium">{labels.actions}</th>
				</tr>
			</thead>
			<tbody>
				{#each pagedData as comment (comment.id)}
					<tr class="bg-bg-surface hover:bg-bg-hover border-b border-[var(--border-subtle)] transition-colors">
						<td class="text-muted-foreground p-3">{comment.userId}</td>
						<td class="p-3">
							<span class="line-clamp-2 block max-w-md">{comment.body}</span>
						</td>
						<td class="p-3">
							<span class="bg-bg-hover inline-flex rounded-full px-2 py-0.5 text-xs font-medium">{comment.type}</span>
						</td>
						<td class="text-muted-foreground p-3">{new Date(comment.createdAt).toLocaleString()}</td>
						<td class="relative p-3">
							<button
								type="button"
								class="hover:bg-bg-hover inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
								aria-label={labels['open-menu']}
								onclick={() => (menuComment = menuComment === comment.id ? null : comment.id)}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
									<circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
								</svg>
							</button>
							{#if menuComment === comment.id}
								<div class="bg-bg-popover absolute right-3 z-30 mt-1 w-40 rounded-md border border-[var(--border-faint)] p-1 shadow-lg">
									<button
										type="button"
										class="text-destructive hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
										onclick={() => {
											deleteComment(comment.id, comment.body ?? '')
											menuComment = null
										}}
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4">
											<path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
										</svg>
										{labels.delete}
									</button>
								</div>
							{/if}
						</td>
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

<ConfirmationDialog
	bind:open={confirmDialog.open}
	title={confirmDialog.title}
	description={confirmDialog.description}
	variant={confirmDialog.variant}
	onConfirm={confirmDialog.action}
	loading={isMutating}
	{labels}
/>
