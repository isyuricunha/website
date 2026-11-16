<script lang="ts">
	import AdminPageHeader from '#lib/components/admin/admin-page-header.svelte'
	import AuditLogsTable from '#lib/components/admin/audit-logs-table.svelte'
	import { trpc } from '#lib/trpc-client.ts'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	type AuditLog = RouterOutputs['admin']['getAuditLogs']['logs'][number]

	let status = $state<'pending' | 'success' | 'error'>('pending')
	let logs = $state<AuditLog[]>([])

	let isLoading = $derived(status === 'pending')
	let isError = $derived(status === 'error')
	let isSuccess = $derived(status === 'success')

	$effect(() => {
		trpc.admin.getAuditLogs
			.query()
			.then((payload) => {
				logs = (payload as { logs: AuditLog[] }).logs
				status = 'success'
			})
			.catch(() => (status = 'error'))
	})
</script>

<div class="space-y-6">
	<AdminPageHeader title={data.labels['page-header.title']} description={data.labels['page-header.description']} labels={data.labels} />

	{#if isLoading}
		<div class="space-y-3">
			<div class="bg-bg-hover h-9 w-80 animate-pulse rounded-md"></div>
			<div class="bg-bg-hover h-40 w-full animate-pulse rounded-lg"></div>
		</div>
	{/if}
	{#if isError}
		<div>{data.labels['failed-to-fetch']}</div>
	{/if}
	{#if isSuccess}
		<AuditLogsTable data={logs} labels={data.labels} />
	{/if}
</div>
