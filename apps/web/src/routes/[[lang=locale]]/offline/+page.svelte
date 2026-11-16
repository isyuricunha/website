<script lang="ts">
	import RefreshButton from '#lib/components/offline/refresh-button.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.labels['title']}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
	<div class="mx-auto max-w-md space-y-6">
		<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-muted-foreground mx-auto size-16">
			<path d="m16.02 7.76-.02-.02" />
			<path d="M7.84 7.76a6 6 0 0 1 8.32 0" />
			<path d="M11.06 11.08a2 2 0 0 1 2.87.01" />
			<path d="M12.36 17.75H12.37" />
			<path d="M4.94 4.94a10 10 0 0 1 14.11 0" />
			<path d="M9 21.05" />
			<path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
			<path d="M21.98 8.85a15.02 15.02 0 0 0-6.2-2.97" />
			<path d="M2.33 14.98a8.99 8.99 0 0 1 2.54-1.9" />
			<path d="M21.67 15a9 9 0 0 0-6.63-2.98" />
		</svg>

		<div class="space-y-2">
			<h1 class="text-2xl font-medium tracking-tighter">{data.labels['title']}</h1>
			<p class="text-muted-foreground">{data.labels['description']}</p>
		</div>

		<div class="space-y-3">
			<RefreshButton labels={{ refresh: data.labels['refresh'] }} />

			<a
				href="/"
				class="text-text-secondary hover:bg-bg-hover hover:text-text-primary inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--border-default)] bg-transparent px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:border-[var(--border-strong)]"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
					<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
					<path d="M9 22V12h6v10" />
				</svg>
				{data.labels['go-home']}
			</a>
		</div>

		<div class="text-muted-foreground space-y-1 text-sm">
			<p>{data.labels['available.title']}</p>
			<ul class="list-inside list-disc space-y-1">
				<li>{data.labels['available.cached-pages']}</li>
				<li>{data.labels['available.loaded-content']}</li>
				<li>{data.labels['available.search']}</li>
			</ul>
		</div>
	</div>
</div>
