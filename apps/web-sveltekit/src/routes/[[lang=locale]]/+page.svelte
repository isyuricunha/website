<script lang="ts">
	import AboutMe from '#lib/components/home/about-me.svelte'
	import AnnouncementBanner from '#lib/components/announcement/announcement-banner.svelte'
	import GetInTouch from '#lib/components/home/get-in-touch.svelte'
	import Hero from '#lib/components/home/hero.svelte'
	import LatestArticles from '#lib/components/home/latest-articles.svelte'
	import NewsletterSignup from '#lib/components/home/newsletter-signup.svelte'
	import RecentlyUpdated from '#lib/components/home/recently-updated.svelte'
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
	<div class="mb-6">
		<AnnouncementBanner labels={data.aboutLabels} locale={data.locale} />
	</div>

	<Hero strings={data.hero.strings} reversedTitleOrder={data.hero.reversedTitleOrder} />

	{#if data.selectedProjects}
		<SelectedProjects
			strings={data.selectedProjects.strings}
			featured={data.selectedProjects.featured}
			supporting={data.selectedProjects.supporting}
		/>
	{/if}

	<AboutMe labels={data.aboutLabels} locale={data.locale} />

	{#if data.latestArticles}
		<LatestArticles
			strings={data.latestArticles.strings}
			locale={data.locale}
			featured={data.latestArticles.featured}
			supporting={data.latestArticles.supporting}
		/>
	{/if}

	<div class="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
		<RecentlyUpdated items={data.recentlyUpdated} labels={data.aboutLabels} />
		<NewsletterSignup labels={data.aboutLabels} />
	</div>

	<GetInTouch strings={data.getInTouch.strings} />
</div>
