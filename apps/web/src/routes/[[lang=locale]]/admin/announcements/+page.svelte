<script lang="ts">
	import AnnouncementManagement from '#lib/components/admin/announcement-management.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<AnnouncementManagement labels={data.labels} locale={data.locale} />
