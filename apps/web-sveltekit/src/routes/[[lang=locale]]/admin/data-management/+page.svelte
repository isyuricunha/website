<script lang="ts">
	import DataManagement from '#lib/components/admin/data-management.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<DataManagement labels={data.labels} locale={data.locale} />
