<script lang="ts">
	import UserName from '#lib/components/user/user-name.svelte'
	import UserComments from '#lib/components/user/user-comments.svelte'
	import { SITE_URL } from '#lib/constants.ts'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		name: data.profile.name,
		description: data.profile.bio ?? data.labels['description'] ?? '',
		url: `${SITE_URL}${data.canonicalPath}`,
		mainEntity: {
			'@type': 'Person',
			name: data.profile.name,
			url: `${SITE_URL}${data.canonicalPath}`
		}
	})

	let avatarUrl = $derived(
		data.profile.image?.startsWith('http')
			? data.profile.image
			: `${SITE_URL}${data.profile.image}`
	)
</script>

<svelte:head>
	<title>{data.profile.name}</title>
	<meta name="description" content={data.profile.bio ?? data.labels['description'] ?? ''} />
	<link rel="canonical" href={data.canonicalPath} />
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}<\/script>`}
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16">
	<div class="mb-10">
		<h1 class="text-3xl font-bold tracking-tight">{data.profile.name}</h1>
		<p class="text-muted-foreground mt-2 mb-6 text-sm">
			{data.profile.bio ?? data.labels['description'] ?? ''}
		</p>
		<div class="max-w-3xl space-y-6">
			<div class="flex items-start justify-between gap-6">
				<div class="flex min-w-0 items-start gap-6">
					<img src={avatarUrl} alt={data.profile.name} width="80" height="80" class="size-20 shrink-0 rounded-full" />
					<div class="min-w-0">
						<div class="text-2xl font-medium tracking-tighter">
							<UserName name={data.profile.name} color={data.profile.nameColor} effect={data.profile.nameEffect} />
						</div>
						<div class="text-muted-foreground mt-1 text-sm">
							@{data.profile.username ?? data.profile.id}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<UserComments handle={data.handle} labels={data.labels} locale={data.locale} />
</main>
