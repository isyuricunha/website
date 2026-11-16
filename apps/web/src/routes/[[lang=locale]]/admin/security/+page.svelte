<script lang="ts">
	import SecurityManagement from '#lib/components/admin/security-management.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<SecurityManagement labels={data.labels} locale={data.locale} />
