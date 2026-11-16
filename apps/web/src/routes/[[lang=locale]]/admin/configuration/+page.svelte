<script lang="ts">
	import AiSettings from '#lib/components/admin/ai-settings.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<AiSettings labels={data.labels} />
