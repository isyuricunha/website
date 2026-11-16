<script lang="ts">
	import AdminPageHeader from '#lib/components/admin/admin-page-header.svelte'
	import CommentsTable from '#lib/components/admin/comments-table.svelte'
	import { trpc } from '#lib/trpc-client.ts'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	type AdminComment = RouterOutputs['comments']['getComments']['comments'][number]

	let status = $state<'pending' | 'success' | 'error'>('pending')
	let comments = $state<AdminComment[]>([])

	let isLoading = $derived(status === 'pending')
	let isError = $derived(status === 'error')
	let isSuccess = $derived(status === 'success')

	$effect(() => {
		trpc.comments.getComments
			.query()
			.then((payload) => {
				comments = (payload as { comments: AdminComment[] }).comments
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
		<div>{data.labels['failed-to-fetch-comments-data']}</div>
	{/if}
	{#if isSuccess}
		<CommentsTable data={comments} labels={data.labels} locale={data.locale} />
	{/if}
</div>
