<script lang="ts">
	import ContactForm from '#lib/components/contact/contact-form.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	const socialLinks = [
		{ key: 'github', href: 'https://github.com/isyuricunha', github: true },
		{ key: 'twitter', href: 'https://x.com/isyuricunha', x: true },
		{ key: 'linkedin', href: 'https://linkedin.com/in/isyuricunha', linkedin: true }
	]
</script>

<svelte:head>
	<title>{data.labels['page-title']}</title>
	<meta name="description" content={data.labels['page-description']} />
	<link rel="canonical" href={data.canonicalPath} />
</svelte:head>

<main class="mx-auto max-w-5xl px-6 py-16">
	<h1 class="mb-3 text-3xl font-bold tracking-tight">{data.labels['page-title']}</h1>
	<p class="text-muted-foreground mb-10">{data.labels['page-description']}</p>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<ContactForm labels={data.labels} locale={data.locale} />

		<div class="space-y-6">
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
				<h3 class="flex items-center gap-2 text-base font-medium sm:text-lg">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-5">
						<rect width="20" height="16" x="2" y="4" rx="2" />
						<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
					</svg>
					{data.labels['direct.title']}
				</h3>
				<p class="text-muted-foreground mt-1 text-xs sm:text-sm">{data.labels['direct.description']}</p>
				<div class="mt-4 space-y-4">
					<div class="bg-bg-surface flex items-center gap-3 rounded-lg border border-[var(--border-faint)] p-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-muted-foreground size-4">
							<rect width="20" height="16" x="2" y="4" rx="2" />
							<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
						</svg>
						<div>
							<p class="text-sm font-medium">{data.labels['direct.email-label']}</p>
							<a href="mailto:me@yuricunha.com" class="text-accent-earth-text text-xs hover:underline sm:text-sm">
								me@yuricunha.com
							</a>
						</div>
					</div>
					<div class="text-muted-foreground text-xs sm:text-sm">
						<p class="mb-2">{data.labels['direct.response-time']}</p>
						<p>{data.labels['direct.urgent']}</p>
					</div>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
				<h3 class="flex items-center gap-2 text-base font-medium sm:text-lg">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-5">
						<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
					{data.labels['social.title']}
				</h3>
				<p class="text-muted-foreground mt-1 text-xs sm:text-sm">{data.labels['social.description']}</p>
				<div class="mt-4 space-y-3">
					{#each socialLinks as social (social.key)}
						<a
							href={social.href}
							target="_blank"
							rel="noopener noreferrer"
							class="hover:bg-bg-hover group flex items-center gap-3 rounded-lg p-3 transition-colors"
						>
							<div class="text-muted-foreground group-hover:text-foreground">
								{#if social.github}
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-5">
										<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
									</svg>
								{:else if social.x}
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-5">
										<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
									</svg>
								{:else}
									<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-5">
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
									</svg>
								{/if}
							</div>
							<div class="flex-1">
								<p class="text-sm font-medium">{data.labels[`social.${social.key}.name`]}</p>
								<p class="text-muted-foreground text-xs">{data.labels[`social.${social.key}.description`]}</p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>
</main>
