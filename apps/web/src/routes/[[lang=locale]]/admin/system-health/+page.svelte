<script lang="ts">
	import SystemHealthDashboard from '#lib/components/admin/system-health.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<SystemHealthDashboard labels={data.labels} locale={data.locale} />
