<script lang="ts">
	import AdminPageHeader from '#lib/components/admin/admin-page-header.svelte'
	import UsersTable from '#lib/components/admin/users-table.svelte'
	import { trpc } from '#lib/trpc-client.ts'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	type AdminUser = RouterOutputs['users']['getUsers']['users'][number]

	let status = $state<'pending' | 'success' | 'error'>('pending')
	let users = $state<AdminUser[]>([])

	let isLoading = $derived(status === 'pending')
	let isError = $derived(status === 'error')
	let isSuccess = $derived(status === 'success')

	$effect(() => {
		trpc.users.getUsers
			.query()
			.then((payload) => {
				users = (payload as { users: AdminUser[] }).users
				status = 'success'
			})
			.catch(() => (status = 'error'))
	})
</script>

<div class="space-y-6">
	<AdminPageHeader title={data.labels['page-header.title']} description={data.labels['page-header.description']} labels={data.labels} />

	{#if isLoading}
		<div class="space-y-3">
			<div class="bg-bg-hover h-9 w-64 animate-pulse rounded-md"></div>
			<div class="bg-bg-hover h-40 w-full animate-pulse rounded-lg"></div>
		</div>
	{/if}
	{#if isError}
		<div>{data.labels['failed-to-fetch-users-data']}</div>
	{/if}
	{#if isSuccess}
		<UsersTable data={users} labels={data.labels} locale={data.locale} />
	{/if}
</div>
