<script lang="ts">
	import UsesPageClient from '#lib/components/uses/uses-page-client.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalPath} />
</svelte:head>

<main class="mx-auto w-full max-w-6xl px-4 pt-28 pb-20 sm:px-8">
	<UsesPageClient
		title={data.title}
		description={data.description}
		mdxHtml={data.html}
		locale={data.locale}
	/>
</main>
