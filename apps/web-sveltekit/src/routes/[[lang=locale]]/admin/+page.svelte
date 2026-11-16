<script lang="ts">
	import AdminDashboard from '#lib/components/admin/admin-dashboard.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<AdminDashboard labels={data.labels} locale={data.locale} />
