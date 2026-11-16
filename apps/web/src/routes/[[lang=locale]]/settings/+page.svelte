<script lang="ts">
	import SettingsForm from '#lib/components/settings/settings-form.svelte'
	import { SITE_URL } from '#lib/constants.ts'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: data.labels.title,
		description: data.labels.description,
		url: `${SITE_URL}${data.canonicalPath}`,
		mainEntity: {
			'@type': 'Person',
			name: data.siteName,
			url: SITE_URL
		}
	})
</script>

<svelte:head>
	<title>{data.labels.title}</title>
	<meta name="description" content={data.labels.description} />
	<link rel="canonical" href={data.canonicalPath} />
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}<\/script>`}
</svelte:head>

<main class="mx-auto max-w-xl px-6 py-16">
	{#if data.authEnabled}
		<div class="mb-8">
			<h1 class="text-3xl font-bold tracking-tight">{data.labels.title}</h1>
			<p class="text-muted-foreground mt-2 text-sm">{data.labels.description}</p>
		</div>
		<SettingsForm labels={data.labels} />
	{/if}
</main>
