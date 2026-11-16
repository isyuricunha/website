<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { flags } from '#lib/flags.ts'
	import { formatMessage } from '#lib/i18n/format.ts'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	let status = $state<'pending' | 'success' | 'error'>('pending')
	let seconds = $state(0)

	let hours = $derived(status === 'success' ? Math.round(seconds / 60 / 60) : 0)

	function fetchHours() {
		if (!flags.stats) return
		trpc.wakatime.get
			.query()
			.then((data) => {
				seconds = data.seconds
				status = 'success'
			})
			.catch(() => (status = 'error'))
	}

	$effect(() => {
		fetchHours()
	})
</script>

<div class="shadow-feature-card bg-bg-surface flex flex-col gap-4 rounded-lg p-4 sm:gap-6 sm:p-5 lg:p-6">
	<div class="flex items-center gap-2">
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text size-[18px]">
			<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
		</svg>
		<h2 class="text-sm font-medium sm:text-base">{labels['about-me.coding-hours']}</h2>
	</div>
	<div class="flex grow items-center justify-center text-3xl font-medium sm:text-4xl">
		{#if status === 'pending'}
			--
		{:else if status === 'error'}
			{labels['common-error']}
		{:else}
			{formatMessage(labels['about-me.coding-hours-value'], { count: hours }, locale)}
		{/if}
	</div>
</div>
