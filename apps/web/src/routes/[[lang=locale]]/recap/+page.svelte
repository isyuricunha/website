<script lang="ts">
	import RecapCoding from '#lib/components/recap/recap-coding.svelte'
	import RecapContent from '#lib/components/recap/recap-content.svelte'
	import RecapListening from '#lib/components/recap/recap-listening.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalPath} />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-16">
	<h1 class="mb-3 text-3xl font-bold tracking-tight">{data.labels['title']}</h1>
	<p class="text-muted-foreground mb-10">{data.labels['description']}</p>

	<div class="space-y-20">
		<section class="cursor-reveal">
			<RecapCoding labels={data.labels} />
		</section>

		<section class="border-t-[0.5px] border-[var(--border-faint)] pt-20">
			<RecapListening labels={data.labels} />
		</section>

		<section class="border-t-[0.5px] border-[var(--border-faint)] pt-20">
			<RecapContent labels={data.labels} locale={data.locale} />
		</section>
	</div>
</main>
