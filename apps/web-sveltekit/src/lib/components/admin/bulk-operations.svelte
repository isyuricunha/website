<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import { getSelectionState, reconcileSelection } from '@isyuricunha/trpc-server/utils/admin/integrity'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'
	import ConfirmationDialog from './confirmation-dialog.svelte'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type BulkUser = RouterOutputs['bulk']['getUsersForBulkOperation']['users'][number]
	type BulkOperationStatus = RouterOutputs['bulk']['listBulkOperations'][number]

	let selectedUsers = $state<string[]>([])
	let searchTerm = $state('')
	let selectedAction = $state<'delete' | 'ban' | 'unban' | 'update_role'>('ban')
	let newRole = $state<'user' | 'admin'>('user')
	let selectAllRef = $state<HTMLInputElement | undefined>()
	let confirmDialog = $state<{
		open: boolean
		title: string
		description: string
		variant?: 'default' | 'destructive'
		action: () => void
	}>({ open: false, title: '', description: '', action: () => {} })

	let usersData = $state<RouterOutputs['bulk']['getUsersForBulkOperation'] | null>(null)
	let operations = $state<BulkOperationStatus[]>([])
	let usersLoading = $state(true)
	let operationsLoading = $state(true)
	let operationsError = $state(false)
	let isMutating = $state(false)
	let isCancelling = $state(false)
	let searchTimer: ReturnType<typeof setTimeout> | undefined

	function fetchUsers() {
		trpc.bulk.getUsersForBulkOperation
			.query({ search: searchTerm || undefined, excludeAdmins: true, limit: 100 })
			.then((data) => {
				usersData = data as RouterOutputs['bulk']['getUsersForBulkOperation']
				usersLoading = false
			})
			.catch(() => (usersLoading = false))
	}

	function fetchOperations() {
		trpc.bulk.listBulkOperations
			.query({ limit: 20, offset: 0 })
			.then((data) => {
				operations = data as unknown as BulkOperationStatus[]
				operationsLoading = false
			})
			.catch(() => {
				operationsError = true
				operationsLoading = false
			})
	}

	let visibleUserIds = $derived(usersData?.users.map((user) => user.id) ?? [])
	let visibleSelectedUsers = $derived(reconcileSelection(selectedUsers, visibleUserIds))
	let selectionState = $derived(getSelectionState(visibleSelectedUsers, visibleUserIds))

	function exportJson(fileName: string, data: unknown) {
		const content = JSON.stringify(data, null, 2)
		const blob = new Blob([content], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const anchor = document.createElement('a')
		anchor.href = url
		anchor.download = fileName
		anchor.click()
		URL.revokeObjectURL(url)
	}

	function handleExportOperation(operation: BulkOperationStatus) {
		exportJson(`bulk-operation-${operation.id}.json`, { ...operation, exportedAt: new Date().toISOString() })
	}

	function handleBulkAction() {
		if (visibleSelectedUsers.length === 0) {
			toastError(labels['messages.select-users'])
			return
		}

		confirmDialog = {
			open: true,
			title: labels['confirm.bulk-action-title'],
			description: formatMessage(labels['confirm.bulk-action'], {
				action: getActionLabel(selectedAction),
				count: visibleSelectedUsers.length
			}, locale),
			variant: 'destructive',
			action: () => {
				confirmDialog = { ...confirmDialog, open: false }
				const parameters = selectedAction === 'update_role' ? { role: newRole } : undefined
				isMutating = true
				trpc.bulk.bulkUserAction
					.mutate({ userIds: visibleSelectedUsers, action: selectedAction, parameters })
					.then((result) => {
						const summary = (result as { summary: { successful: number; total: number } }).summary
						toastSuccess(formatMessage(labels['messages.completed'], { successful: summary.successful, total: summary.total }, locale))
						selectedUsers = []
						fetchUsers()
						fetchOperations()
					})
					.catch((error: { message?: string }) => toastError(error.message || labels['messages.failed']))
					.finally(() => (isMutating = false))
			}
		}
	}

	function handleCancelOperation(operationId: string) {
		confirmDialog = {
			open: true,
			title: labels['confirm.cancel-operation-title'],
			description: labels['confirm.cancel-operation'],
			variant: 'destructive',
			action: () => {
				confirmDialog = { ...confirmDialog, open: false }
				isCancelling = true
				trpc.bulk.cancelBulkOperation
					.mutate({ operationId })
					.then(() => {
						toastSuccess(labels['messages.cancelled'])
						fetchOperations()
					})
					.catch((error: { message?: string }) => toastError(error.message || labels['messages.cancel-failed']))
					.finally(() => (isCancelling = false))
			}
		}
	}

	function getActionLabel(action: string) {
		switch (action) {
			case 'delete':
				return labels['actions.delete-users']
			case 'ban':
				return labels['actions.ban-users']
			case 'unban':
				return labels['actions.unban-users']
			case 'update_role':
				return labels['actions.update-role']
			default:
				return action
		}
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'completed':
				return labels['status.completed']
			case 'failed':
				return labels['status.failed']
			case 'running':
				return labels['status.running']
			case 'cancelled':
				return labels['status.cancelled']
			case 'pending':
				return labels['status.pending']
			default:
				return status
		}
	}

	function getStatusIcon(status: string) {
		if (status === 'completed') return '<circle cx="12" cy="12" r="10" /><polyline points="9 12 11.5 14.5 15.5 10" />'
		if (status === 'failed') return '<circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />'
		if (status === 'running') return '<polygon points="6 3 20 12 6 21 6 3" />'
		if (status === 'cancelled') return '<circle cx="12" cy="12" r="10" /><line x1="10" x2="14" y1="9" y2="15" /><line x1="14" x2="10" y1="9" y2="15" />'
		return '<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />'
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'completed':
				return 'bg-status-success-soft text-status-success'
			case 'failed':
				return 'bg-status-danger-soft text-status-danger'
			case 'running':
				return 'bg-status-info-soft text-status-info'
			case 'cancelled':
				return 'bg-bg-surface text-text-secondary'
			default:
				return 'bg-bg-surface text-text-secondary'
		}
	}

	function formatDate(date: Date | string | undefined) {
		if (!date) return labels['date.never']
		return new Date(date).toLocaleString()
	}

	function hasActiveOperation() {
		return operations.some((operation) => operation.status === 'pending' || operation.status === 'running')
	}

	$effect(() => {
		if (selectAllRef) selectAllRef.indeterminate = selectionState.indeterminate
	})

	$effect(() => {
		fetchUsers()
		fetchOperations()
	})

	$effect(() => {
		if (!hasActiveOperation()) return
		const timer = setInterval(fetchOperations, 2000)
		return () => clearInterval(timer)
	})
</script>

{#if usersLoading}
	<div class="space-y-6">
		<div class="animate-pulse">
			<div class="bg-bg-hover mb-4 h-8 w-1/4 rounded"></div>
			<div class="space-y-3">
				{#each Array.from({ length: 5 }) as _, i (i)}
					<div class="bg-bg-hover h-16 rounded"></div>
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
		</div>

		<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
			<div class="border-b border-[var(--border-subtle)] px-6 py-4">
				<h3 class="text-lg font-medium">{labels['user-actions.title']}</h3>
			</div>
			<div class="p-6">
				<div class="mb-6 flex flex-col gap-4 sm:flex-row">
					<div class="flex-1">
						<div class="relative">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary absolute top-2.5 left-2 h-4 w-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
							<input
								aria-label={labels['user-actions.search-placeholder']}
								placeholder={labels['user-actions.search-placeholder']}
								value={searchTerm}
								oninput={(e) => {
									searchTerm = e.currentTarget.value
									clearTimeout(searchTimer)
									searchTimer = setTimeout(fetchUsers, 300)
								}}
								class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] py-2 pl-8 pr-3 text-sm"
							/>
						</div>
					</div>
					<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4"><line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" /><line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" /><line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" /><line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" /></svg>
						{labels['user-actions.filters']}
					</button>
				</div>

				<div class="bg-bg-surface mb-6 flex flex-col gap-4 rounded-lg border border-[var(--border-faint)] p-4 sm:flex-row">
					<div class="flex-1">
						<label for="bulk-action" class="mb-2 block text-sm font-medium">{labels['user-actions.select-action']}</label>
						<select bind:value={selectedAction} id="bulk-action" class="bg-bg-base text-text-primary w-full rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm">
							<option value="ban">{labels['actions.ban-users']}</option>
							<option value="unban">{labels['actions.unban-users']}</option>
							<option value="update_role">{labels['actions.update-role']}</option>
							<option value="delete">{labels['actions.delete-users']}</option>
						</select>
					</div>

					{#if selectedAction === 'update_role'}
						<div class="flex-1">
							<label for="bulk-new-role" class="mb-2 block text-sm font-medium">{labels['user-actions.new-role']}</label>
							<select bind:value={newRole} id="bulk-new-role" class="bg-bg-base text-text-primary w-full rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm">
								<option value="user">{labels['roles.user']}</option>
								<option value="admin">{labels['roles.admin']}</option>
							</select>
						</div>
					{/if}

					<div class="flex items-end">
						<button type="button" class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" onclick={handleBulkAction} disabled={visibleSelectedUsers.length === 0 || isMutating}>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4"><polygon points="6 3 20 12 6 21 6 3" /></svg>
							{formatMessage(labels['actions.execute'], { count: visibleSelectedUsers.length }, locale)}
						</button>
					</div>
				</div>

				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-[var(--border-subtle)]">
						<thead class="bg-bg-hover">
							<tr>
								<th class="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
									<input
										bind:this={selectAllRef}
										type="checkbox"
										checked={selectionState.checked}
										aria-label={labels['table.select-all']}
										onchange={(e) => {
											selectedUsers = e.currentTarget.checked ? [...visibleUserIds] : []
										}}
										class="rounded border-[var(--border-subtle)]"
									/>
								</th>
								<th class="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{labels['table.user']}</th>
								<th class="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{labels['table.role']}</th>
								<th class="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{labels['table.joined']}</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-[var(--border-subtle)] bg-bg-base">
							{#each usersData?.users ?? [] as user (user.id)}
								<tr class="hover:bg-bg-surface">
									<td class="px-6 py-4 whitespace-nowrap">
										<input
											type="checkbox"
											checked={visibleSelectedUsers.includes(user.id)}
											aria-label="{labels['table.user']}: {user.name}"
											onchange={(e) => {
												selectedUsers = e.currentTarget.checked
													? [...visibleSelectedUsers, user.id]
													: visibleSelectedUsers.filter((id) => id !== user.id)
											}}
											class="rounded border-[var(--border-subtle)]"
										/>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center">
											{#if user.image}
												<img class="mr-3 h-8 w-8 rounded-full" src={user.image} alt={user.name ?? ''} width="32" height="32" />
											{/if}
											<div>
												<div class="text-sm font-medium">{user.name}</div>
												<div class="text-text-secondary text-sm">{user.email}</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {user.role === 'admin' ? 'text-status-agent bg-status-agent-soft' : 'bg-bg-surface text-text-secondary'}">
											{user.role}
										</span>
									</td>
									<td class="text-text-secondary px-6 py-4 text-sm whitespace-nowrap">{formatDate(user.createdAt)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if !usersData?.users || usersData.users.length === 0}
					<div class="py-12 text-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary mx-auto h-12 w-12"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
						<h3 class="mt-2 text-sm font-medium">{labels['user-actions.no-users']}</h3>
						<p class="text-text-secondary mt-1 text-sm">{labels['user-actions.no-users-hint']}</p>
					</div>
				{/if}
			</div>
		</div>

		<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
			<div class="border-b border-[var(--border-subtle)] px-6 py-4">
				<h3 class="text-lg font-medium">{labels['operations.title']}</h3>
			</div>
			<div class="divide-y divide-[var(--border-subtle)]">
				{#if operationsError}
					<div class="text-text-secondary p-6 text-center">{labels['operations.failed-to-load']}</div>
				{/if}

				{#if operationsLoading}
					<div class="text-text-secondary p-6 text-center">{labels['operations.loading']}</div>
				{/if}

				{#each operations as operation (operation.id)}
					<div class="p-6">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
									{@html getStatusIcon(operation.status)}
								</svg>
								<div>
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium">{getActionLabel(operation.type)}</span>
										<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(operation.status)}">
											{getStatusLabel(operation.status)}
										</span>
									</div>
									<div class="text-text-secondary text-sm">
										{formatMessage(labels['operations.summary'], {
											successful: operation.successfulItems,
											total: operation.totalItems,
											creator: operation.createdByUser?.name || labels['date.unknown'],
											date: operation.createdAt ? formatDate(operation.createdAt) : labels['date.unknown']
										}, locale)}
									</div>
								</div>
							</div>

							<div class="flex items-center gap-2">
								{#if operation.status === 'running' || operation.status === 'pending'}
									<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors" onclick={() => handleCancelOperation(operation.id)}>
										{labels['actions.cancel']}
									</button>
								{/if}
								{#if operation.status === 'completed' && operation.results != null}
									<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors" onclick={() => handleExportOperation(operation)}>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
										{labels['actions.export']}
									</button>
								{/if}
							</div>
						</div>

						{#if operation.status === 'running' || operation.status === 'pending'}
							<div class="mt-4">
								<div class="text-text-secondary mb-1 flex justify-between text-sm">
									<span>{labels['operations.progress']}</span>
									<span>{operation.processedItems}/{operation.totalItems}</span>
								</div>
								<div class="bg-bg-hover h-2 w-full rounded-full">
									<div class="bg-status-info h-2 rounded-full transition-all duration-300" style="width: {operation.progress}%"></div>
								</div>
							</div>
						{/if}

						{#if typeof operation.errorMessage === 'string' && operation.errorMessage.length > 0}
							<div class="bg-status-danger-soft mt-4 rounded-md border border-[var(--status-danger-border)] p-3">
								<div class="flex items-center gap-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-status-danger h-4 w-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
									<span class="text-status-danger text-sm">{operation.errorMessage}</span>
								</div>
							</div>
						{/if}
					</div>
				{/each}

				{#if !operationsLoading && !operationsError && operations.length === 0}
					<div class="text-text-secondary p-6 text-center">{labels['operations.empty']}</div>
				{/if}
			</div>
		</div>

		<ConfirmationDialog
			bind:open={confirmDialog.open}
			title={confirmDialog.title}
			description={confirmDialog.description}
			variant={confirmDialog.variant}
			onConfirm={confirmDialog.action}
			loading={isMutating || isCancelling}
			{labels}
		/>
	</div>
{/if}
