<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import { exportToCSV, USER_EXPORT_COLUMNS } from '@isyuricunha/trpc-server/utils/csv/csv-export'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'
	import ConfirmationDialog from './confirmation-dialog.svelte'
	import UserEditModal from './user-edit-modal.svelte'

	let { data, labels, locale }: { data: AdminUser[]; labels: Record<string, string>; locale: string } = $props()

	type AdminUser = RouterOutputs['users']['getUsers']['users'][number]

	let searchTerm = $state('')
	let debouncedSearchTerm = $state('')
	let debounceTimer: ReturnType<typeof setTimeout> | undefined
	let roleFilter = $state('all')
	let sortColumn = $state<'name' | 'email' | 'role' | 'createdAt' | 'status'>('createdAt')
	let sortDirection = $state<'asc' | 'desc'>('desc')
	let page = $state(1)
	let pageSize = $state(10)
	let menuUser = $state<string | null>(null)
	let editModalOpen = $state(false)
	let editingUser = $state<AdminUser | null>(null)
	let confirmDialog = $state<{
		open: boolean
		title: string
		description: string
		variant?: 'default' | 'destructive'
		action: () => void
	}>({ open: false, title: '', description: '', action: () => {} })
	let isMutating = $state(false)

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

	async function runMutation(input: { userId: string }, mutation: (input: { userId: string }) => Promise<unknown>, successKey: string, errorKey: string) {
		isMutating = true
		try {
			await mutation(input)
			toastSuccess(labels[successKey])
		} catch {
			toastError(labels[errorKey])
		} finally {
			isMutating = false
		}
	}

	function deleteUser(userId: string, username: string) {
		confirmDialog = {
			open: true,
			title: labels.delete,
			description: formatMessage(labels['confirm-delete-with-name'], { name: username }, locale),
			variant: 'destructive',
			action: () => {
				confirmDialog = { ...confirmDialog, open: false }
				runMutation({ userId }, (input) => trpc.users.deleteUser.mutate(input), 'delete-success', 'delete-error')
			}
		}
	}

	function banUser(userId: string, username: string) {
		confirmDialog = {
			open: true,
			title: labels.ban,
			description: formatMessage(labels['confirm-ban-with-name'], { name: username }, locale),
			variant: 'destructive',
			action: () => {
				confirmDialog = { ...confirmDialog, open: false }
				runMutation({ userId }, (input) => trpc.users.banUser.mutate(input), 'ban-success', 'ban-error')
			}
		}
	}

	function unbanUser(userId: string, username: string) {
		confirmDialog = {
			open: true,
			title: labels.unban,
			description: formatMessage(labels['confirm-unban-with-name'], { name: username }, locale),
			action: () => {
				confirmDialog = { ...confirmDialog, open: false }
				runMutation({ userId }, (input) => trpc.users.unbanUser.mutate(input), 'unban-success', 'unban-error')
			}
		}
	}

	function resetPassword(userId: string) {
		runMutation({ userId }, (input) => trpc.users.sendPasswordReset.mutate(input), 'reset-password-success', 'reset-password-error')
	}

	function editUser(user: AdminUser) {
		editingUser = user
		editModalOpen = true
		menuUser = null
	}

	function exportCsv() {
		exportToCSV(filteredData, `users-${new Date().toISOString().split('T')[0]}`, USER_EXPORT_COLUMNS as never)
		toastSuccess(labels['export-success'])
	}

	let filteredData = $derived.by(() => {
		const term = debouncedSearchTerm.toLowerCase()
		let rows = data
		if (term) {
			rows = rows.filter(
				(user) =>
					user.name?.toLowerCase().includes(term) ||
					user.email.toLowerCase().includes(term) ||
					(user.username?.toLowerCase().includes(term) ?? false) ||
					user.role.toLowerCase().includes(term)
			)
		}
		if (roleFilter !== 'all') {
			rows = rows.filter((user) => user.role === roleFilter)
		}
		return rows
	})

	let sortedData = $derived.by(() => {
		const rows = [...filteredData]
		rows.sort((a, b) => {
			const get = (user: AdminUser) =>
				sortColumn === 'status' ? String(user.banned) : String(user[sortColumn] ?? '')
			const result = get(a).localeCompare(get(b))
			return sortDirection === 'asc' ? result : -result
		})
		return rows
	})

	let totalPages = $derived(Math.max(1, Math.ceil(sortedData.length / pageSize)))
	let pagedData = $derived(sortedData.slice((page - 1) * pageSize, page * pageSize))

	function toggleSort(column: 'name' | 'email' | 'role' | 'createdAt' | 'status') {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
		} else {
			sortColumn = column
			sortDirection = 'asc'
		}
	}

	function sortIcon(column: string) {
		if (sortColumn !== column) return ''
		return sortDirection === 'asc' ? '▲' : '▼'
	}

	function localizedHref(url: string) {
		return locale === 'en' ? url : `/${locale}${url}`
	}

	function userHref(id: string) {
		return localizedHref(`/u/${data.find((user) => user.id === id)?.username ?? id}`)
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
					<button
						type="button"
						class="hover:bg-bg-hover absolute top-1 right-1 h-6 w-6 rounded p-0"
						aria-label={labels.search}
						onclick={clearSearch}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-3 w-3">
							<path d="M18 6 6 18" /><path d="m6 6 12 12" />
						</svg>
					</button>
				{/if}
			</div>
			<select bind:value={roleFilter} class="bg-bg-hover rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" aria-label={labels.role}>
				<option value="all">{labels['filter-all-roles']}</option>
				<option value="user">{labels['roles.user']}</option>
				<option value="admin">{labels['roles.admin']}</option>
			</select>
		</div>
		<button
			type="button"
			class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors"
			onclick={exportCsv}
		>
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
					{#each [['name', 'name'], ['email', 'email'], ['role', 'role'], ['createdAt', 'createdAt'], ['status', 'status']] as [column, labelKey] (column)}
						<th class="p-3 text-left font-medium">
							<button type="button" class="hover:text-text-primary inline-flex items-center gap-1" onclick={() => toggleSort(column as never)}>
								{labels[labelKey]}
								<span class="text-[10px]">{sortIcon(column)}</span>
							</button>
						</th>
					{/each}
					<th class="p-3 text-left font-medium">{labels.actions}</th>
				</tr>
			</thead>
			<tbody>
				{#each pagedData as user (user.id)}
					<tr class="bg-bg-surface hover:bg-bg-hover border-b border-[var(--border-subtle)] transition-colors">
						<td class="p-3 font-medium">
							<a href={userHref(user.id)} class="hover:text-accent-earth-text transition-colors">
								{user.name ?? user.username ?? user.email}
							</a>
						</td>
						<td class="text-muted-foreground p-3">{user.email}</td>
						<td class="p-3">
							<span class="inline-flex rounded-full border border-[var(--border-faint)] px-2 py-0.5 text-xs font-medium {user.role === 'admin' ? 'text-accent-earth-text border-[var(--accent-border)] bg-[var(--accent-dim)]' : ''}">
								{user.role === 'admin' ? labels['roles.admin'] : labels['roles.user']}
							</span>
						</td>
						<td class="text-muted-foreground p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
						<td class="p-3">
							<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {user.banned ? 'bg-red-500/15 text-red-500' : 'bg-[var(--accent-dim)] text-accent-earth-text'}">
								{user.banned ? labels.banned : labels.active}
							</span>
						</td>
						<td class="relative p-3">
							<button
								type="button"
								class="hover:bg-bg-hover inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
								aria-label={labels['open-menu']}
								onclick={() => (menuUser = menuUser === user.id ? null : user.id)}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
									<circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
								</svg>
							</button>
							{#if menuUser === user.id}
								<div class="bg-bg-popover absolute right-3 z-30 mt-1 w-44 rounded-md border border-[var(--border-faint)] p-1 shadow-lg">
									<button type="button" class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors" onclick={() => editUser(user)}>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4">
											<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L2 18v3h3z" />
										</svg>
										{labels.edit}
									</button>
									<button type="button" class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors" onclick={() => { resetPassword(user.id); menuUser = null }}>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4">
											<rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
										</svg>
										{labels['reset-password']}
									</button>
									{#if user.banned}
										<button type="button" class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors" onclick={() => { unbanUser(user.id, user.name ?? user.email); menuUser = null }}>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4">
												<circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" />
											</svg>
											{labels.unban}
										</button>
									{:else}
										<button type="button" class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors" onclick={() => { banUser(user.id, user.name ?? user.email); menuUser = null }}>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4">
												<circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" />
											</svg>
											{labels.ban}
										</button>
									{/if}
									<button type="button" class="hover:bg-bg-hover text-destructive flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors" onclick={() => { deleteUser(user.id, user.name ?? user.email); menuUser = null }}>
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
		<span>
			{formatMessage(labels['rows-count'], { count: sortedData.length }, locale)}
		</span>
		<div class="flex items-center gap-2">
			<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-2 py-1 transition-colors disabled:opacity-50" disabled={page <= 1} onclick={() => (page = page - 1)}>
				{labels['prev-page']}
			</button>
			<span>{page} / {totalPages}</span>
			<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-2 py-1 transition-colors disabled:opacity-50" disabled={page >= totalPages} onclick={() => (page = page + 1)}>
				{labels['next-page']}
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

<UserEditModal user={editingUser} bind:open={editModalOpen} {labels} />
