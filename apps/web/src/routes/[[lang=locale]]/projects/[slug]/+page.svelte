<script lang="ts">
	import type { PageData } from './$types'

	let { data, params }: { data: PageData; params: { slug: string } } = $props()

	// Header entrance, the same slide-from-left the original animates with
	// framer-motion (x:-30, opacity:0 -> x:0, opacity:1), staggered 100ms
	// between the title block and the links row.
	let revealed = $state(false)
	$effect(() => {
		const id = requestAnimationFrame(() => (revealed = true))
		return () => cancelAnimationFrame(id)
	})

	const repo = $derived(data.project.github.split('/').pop() ?? data.project.github)

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: data.project.name,
		description: data.project.description,
		codeRepository: data.project.github
	})
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalPath} />
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div class="mx-auto max-w-3xl">
	<div class="border-[var(--border-faint)] space-y-8 border-b pt-10 pb-12">
		<div
			class="flex items-center gap-3"
			style={`opacity: ${revealed ? 1 : 0}; transform: translateX(${revealed ? 0 : -30}px); transition: opacity 0.5s ease-out, transform 0.5s ease-out;`}
		>
			<div class="flex flex-col gap-3">
				<span class="label-mono">{data.strings.label}</span>
				<h1 class="max-w-4xl text-[clamp(32px,4vw,52px)] font-normal tracking-tighter">
					{data.project.name}
				</h1>
				<p class="text-muted-foreground max-w-2xl">{data.project.description}</p>
			</div>
		</div>
		<div
			class="flex flex-col items-start gap-2 sm:flex-row sm:gap-4"
			style={`opacity: ${revealed ? 1 : 0}; transform: translateX(${revealed ? 0 : -30}px); transition: all 0.5s ease-out; transition-delay: 0.1s;`}
		>
			{#if data.project.homepage}
				<a href={data.project.homepage} class="cta-link group">
					{data.strings.visitWebsite}
					<svg
						class="ml-2 size-5 transition-transform group-hover:-rotate-12"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
				</a>
			{/if}
			<a href={data.project.github} class="cta-link group">
				isyuricunha/{repo}
				<svg
					class="ml-2 size-5 transition-transform group-hover:-rotate-12"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
			</a>
		</div>
	</div>

	<div class="my-12 overflow-hidden rounded-lg border border-[var(--border-subtle)]">
		<img
			src={`/images/projects/${params.slug}/cover.png`}
			alt={data.project.name}
			width="1280"
			height="832"
			loading="lazy"
			class="aspect-[16/9] w-full object-cover"
		/>
	</div>

	<div class="prose prose-invert w-full">
		{@html data.html}
	</div>
</div>
