<script lang="ts">
	import ProjectCards from '#lib/components/projects/project-cards.svelte'
	import GithubRepos from '#lib/components/github-repos.svelte'
	import { SITE_NAME, SITE_URL } from '#lib/constants.ts'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		'@id': `${SITE_URL}${data.canonicalPath}`,
		name: data.labels.title,
		description: data.labels.description,
		url: `${SITE_URL}${data.canonicalPath}`,
		isPartOf: {
			'@type': 'WebSite',
			name: data.siteName,
			url: SITE_URL
		},
		hasPart: data.projects.map((project) => ({
			'@type': 'SoftwareApplication',
			name: project.name,
			description: project.description,
			url: `${SITE_URL}${data.locale === 'en' ? '' : `/${data.locale}`}/projects/${project.slug}`,
			applicationCategory: 'WebApplication'
		}))
	})
</script>

<svelte:head>
	<title>{data.labels.title}</title>
	<meta name="description" content={data.labels.description} />
	<link rel="canonical" href={data.canonicalPath} />
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}<\/script>`}
</svelte:head>

<main class="mx-auto max-w-6xl px-6 py-16">
	<h1 class="mb-3 text-3xl font-bold tracking-tight">{data.labels.title}</h1>
	<p class="text-muted-foreground mb-10">{data.labels.description}</p>

	<ProjectCards projects={data.projects} locale={data.locale} labels={data.labels} />

	<section class="mt-12">
		<h2 class="mb-6 text-lg font-medium tracking-tighter sm:text-xl">
			{data.labels['all-repos']}
		</h2>
		{#if data.repos.length === 0}
			<p class="text-muted-foreground text-sm sm:text-base">{data.labels['repos.empty']}</p>
		{:else}
			<GithubRepos repos={data.repos} />
		{/if}
	</section>
</main>
