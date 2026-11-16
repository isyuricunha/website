<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'

	type Props = {
		labels: Record<string, string>
	}

	let { labels }: Props = $props()

	type Stats = Awaited<ReturnType<typeof trpc.wakatime.getStats.query>>

	let data = $state<Stats | null>(null)
	let status = $state<'pending' | 'error' | 'success'>('pending')

	$effect(() => {
		trpc.wakatime.getStats
			.query(undefined)
			.then((result) => {
				data = result
				status = 'success'
			})
			.catch(() => {
				status = 'error'
			})
	})
</script>

<div class="grid min-w-0 gap-10 md:grid-cols-2">
	<div class="space-y-8">
		<div>
			<p class="text-text-secondary text-sm">{labels['coding.total']}</p>
			{#if status === 'pending'}
				<p class="text-text-secondary text-sm animate-pulse">{labels['loading']}</p>
			{:else if status === 'error' || !data}
				<p class="text-text-secondary text-sm">{labels['no-data']}</p>
			{:else}
				<p class="text-4xl font-medium tracking-tighter">{data.humanReadableTotal ?? '—'}</p>
				<p class="text-text-secondary mt-2 text-sm">{labels['coding.daily-average']}</p>
				<p class="text-2xl font-medium tracking-tighter">{data.humanReadableDailyAverage}</p>

				<div class="mt-8 space-y-3">
					<p class="text-text-secondary text-sm">{labels['coding.top-projects']}</p>
					<ul class="space-y-2">
						{#each data.projects as project (project.name)}
							<li class="flex items-center justify-between gap-4 text-sm">
								<span class="truncate">{project.name}</span>
								<span class="text-text-secondary shrink-0 tabular-nums">
									{project.percent?.toFixed(1)}%
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>

	<div class="min-w-0 space-y-3">
		<p class="text-text-secondary text-sm">{labels['coding.top-languages']}</p>
		{#if status === 'pending'}
			<p class="text-text-secondary text-sm animate-pulse">{labels['loading']}</p>
		{:else if status === 'error' || !data}
			<p class="text-text-secondary text-sm">{labels['no-data']}</p>
		{:else}
			<ul class="space-y-4">
				{#each data.languages as language (language.name)}
					<li class="space-y-1.5">
						<div class="flex items-center justify-between gap-4 text-sm">
							<span class="truncate">{language.name}</span>
							<span class="text-text-secondary shrink-0 tabular-nums">
								{language.percent?.toFixed(1)}%
							</span>
						</div>
						<div class="bg-bg-surface h-2 overflow-hidden rounded-full">
							<div
								class="bg-accent-earth h-full rounded-full transition-all duration-500"
								style={`width:${language.percent ?? 0}%`}
							></div>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
