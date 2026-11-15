<script lang="ts">
	import GetInTouch from '#lib/components/home/get-in-touch.svelte'
	import Hero from '#lib/components/home/hero.svelte'
	import LatestArticles from '#lib/components/home/latest-articles.svelte'
	import SelectedProjects from '#lib/components/home/selected-projects.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalPath} />
</svelte:head>

<div>
	<Hero strings={data.hero.strings} reversedTitleOrder={data.hero.reversedTitleOrder} />

	{#if data.selectedProjects}
		<SelectedProjects
			strings={data.selectedProjects.strings}
			featured={data.selectedProjects.featured}
			supporting={data.selectedProjects.supporting}
		/>
	{/if}

	<!-- About-me cards land with the backend stage (WakaTime and other live
	     data via tRPC). -->
	{#if data.latestArticles}
		<LatestArticles
			strings={data.latestArticles.strings}
			locale={data.locale}
			featured={data.latestArticles.featured}
			supporting={data.latestArticles.supporting}
		/>
	{/if}

	<!-- RecentlyUpdated and NewsletterSignup land with the backend stage
	     (tRPC views/likes and newsletter endpoints). -->

	<GetInTouch strings={data.getInTouch.strings} />
</div>
