<script lang="ts">
	import Icon from '#lib/components/simple-icon.svelte'

	let { labels }: { labels: Record<string, string> } = $props()
</script>

<div class="shadow-feature-card bg-bg-surface flex flex-col gap-6 rounded-lg p-4 lg:p-6">
	<div class="flex items-center gap-2">
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text size-[18px]">
			<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
		</svg>
		<h2 class="text-sm font-medium">{labels['about-me.fav-framework']}</h2>
	</div>
	<div class="text-text-secondary flex items-center justify-center">
		<Icon icon="siLinuxserver" size={80} />
	</div>
</div>
