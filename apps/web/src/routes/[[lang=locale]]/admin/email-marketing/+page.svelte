<script lang="ts">
	import EmailMarketingManagement from '#lib/components/admin/email-marketing-management.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<EmailMarketingManagement labels={data.labels} locale={data.locale} />
