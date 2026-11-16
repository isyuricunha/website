<script lang="ts">
	import CommunicationManagement from '#lib/components/admin/communication-management.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<CommunicationManagement labels={data.labels} locale={data.locale} />
