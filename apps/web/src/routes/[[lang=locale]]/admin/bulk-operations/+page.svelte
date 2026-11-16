<script lang="ts">
	import BulkOperations from '#lib/components/admin/bulk-operations.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<BulkOperations labels={data.labels} locale={data.locale} />
