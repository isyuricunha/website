<script lang="ts">
	import MonitoringDashboard from '#lib/components/admin/monitoring-dashboard.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<MonitoringDashboard labels={data.labels} locale={data.locale} />
