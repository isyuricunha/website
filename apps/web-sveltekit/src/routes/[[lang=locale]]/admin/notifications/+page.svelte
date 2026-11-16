<script lang="ts">
	import NotificationManagement from '#lib/components/admin/notification-management.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<NotificationManagement labels={data.labels} locale={data.locale} />
