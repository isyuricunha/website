<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.head.title}</title>
	<meta name="description" content={data.head.description} />
</svelte:head>

{#if data.doc}
	<main class="mx-auto max-w-3xl px-6 py-10">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-2xl font-bold tracking-tight">{data.doc.title}</h1>
			<a
				href={data.editUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
					<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.108a.5.5 0 0 0 .623.622l4.108-1.32a2 2 0 0 0 .83-.497z" />
					<path d="m15 5 4 4" />
				</svg>
				Edit on GitHub
			</a>
		</div>

		<article class="prose w-full">
			{@html data.doc.html}
		</article>

		<nav aria-label="Documentation navigation" class="border-t-[0.5px] border-[var(--border-faint)] mt-12 flex justify-between pt-8">
			{#if data.prev}
				<a href={data.prev.href} class="group text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4 transition-transform group-hover:-translate-x-0.5">
						<path d="m15 18-6-6 6-6" />
					</svg>
					<span>{data.prev.text}</span>
				</a>
			{:else}
				<div></div>
			{/if}
			{#if data.next}
				<a href={data.next.href} class="group text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
					<span>{data.next.text}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4 transition-transform group-hover:translate-x-0.5">
						<path d="m9 18 6-6-6-6" />
					</svg>
				</a>
			{:else}
				<div></div>
			{/if}
		</nav>
	</main>
{:else}
	<main class="mx-auto max-w-3xl px-6 py-16">
		<h1 class="text-2xl font-bold">Not found</h1>
		<p class="text-muted-foreground mt-2">This documentation page does not exist.</p>
	</main>
{/if}
