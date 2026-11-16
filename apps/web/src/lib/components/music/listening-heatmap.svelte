<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'

	let { labels }: { labels: Record<string, string> } = $props()

	type RecentTrack = { playedAt: string }

	let tracks = $state<RecentTrack[] | null>(null)
	let isLoading = $state(true)
	let hasError = $state(false)
	let isRefreshing = $state(false)

	const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

	function cellColors(v: number, max: number) {
		const ratio = max === 0 ? 0 : v / max
		if (ratio === 0) return 'bg-bg-surface'
		if (ratio < 0.25) return 'bg-[var(--accent-dim)] opacity-25'
		if (ratio < 0.5) return 'bg-[var(--accent-dim)] opacity-50'
		if (ratio < 0.75) return 'bg-[var(--accent-dim)] opacity-75'
		return 'bg-[var(--accent-dim)]'
	}

	let byDay = $derived.by(() => {
		const counts: number[] = Array.from({ length: 7 }, () => 0)
		const playedTracks = tracks ?? []
		for (const track of playedTracks) {
			const d = new Date(track.playedAt)
			const idx = d.getDay()
			if (typeof counts[idx] === 'number') counts[idx] = (counts[idx] ?? 0) + 1
		}
		const max = counts.reduce((m, v) => Math.max(m, v), 0)
		return { byDay: counts, max }
	})

	async function fetchTracks() {
		try {
			tracks = await trpc.lastfm.getRecentlyPlayed.query()
			hasError = false
		} catch {
			hasError = true
		} finally {
			isLoading = false
			isRefreshing = false
		}
	}

	function refresh() {
		isRefreshing = true
		fetchTracks()
	}

	$effect(() => {
		fetchTracks()
	})
</script>

<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
	<div class="p-6 pb-0">
		<h3 class="text-base font-medium sm:text-lg">{labels['heatmap.title']}</h3>
		<p class="text-text-secondary text-xs sm:text-sm">{labels['heatmap.subtitle']}</p>
		<div class="mt-6 flex flex-wrap items-center gap-5 sm:gap-7">
			<button
				type="button"
				onclick={refresh}
				disabled={isRefreshing}
				class="text-text-secondary hover:text-text-primary text-sm disabled:opacity-50"
			>
				{labels.refresh}
			</button>
		</div>
	</div>
	<div class="p-6">
		{#if isLoading}
			<div class="space-y-2">
				{#each Array.from({ length: 7 }) as _, i (i)}
					<div class="yu-skeleton h-5 w-full"></div>
				{/each}
			</div>
		{:else if hasError}
			<p class="text-text-secondary text-sm">{labels.error}</p>
		{:else if !tracks?.length}
			<p class="text-text-secondary text-sm">{labels['no-data']}</p>
		{:else}
			<div class="space-y-6">
				<div class="relative grid w-full grid-cols-7 gap-3 sm:gap-4">
					<div
						aria-hidden="true"
						class="bg-bg-hover pointer-events-none absolute inset-x-0 top-[38%] -z-10 h-9 -translate-y-1/2 rounded-md sm:top-[40%] sm:h-11"
					></div>
					{#each byDay.byDay as v, dayIdx (`col-${dayIdx}`)}
						{@const dayKey = dayKeys[dayIdx] ?? 'sun'}
						<div class="flex flex-col items-center gap-2">
							<div
								class="ring-border/50 aspect-square w-full rounded-md ring-1 transition duration-150 hover:scale-[1.04] hover:ring-4 hover:ring-[var(--accent-border)] {cellColors(v, byDay.max)}"
								title="{labels[`days.${dayKey}`]} · {v}"
							></div>
							<div class="text-text-secondary text-center text-[11px] leading-none">
								{labels[`days.${dayKey}`]}
							</div>
						</div>
					{/each}
				</div>

				<div class="flex items-center gap-2">
					<span class="text-text-secondary text-[10px]">{labels['legend.low']}</span>
					<div class="flex items-center gap-0.5">
						{#each ['bg-bg-surface', 'bg-[var(--accent-dim)] opacity-25', 'bg-[var(--accent-dim)] opacity-50', 'bg-[var(--accent-dim)] opacity-75', 'bg-[var(--accent-dim)]'] as cls, i (i)}
							<div class="ring-border/50 h-3 w-3 rounded-[3px] ring-1 {cls}"></div>
						{/each}
					</div>
					<span class="text-text-secondary text-[10px]">{labels['legend.high']}</span>
				</div>
			</div>
		{/if}
	</div>
</div>
