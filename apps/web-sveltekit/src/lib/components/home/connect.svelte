<script lang="ts">
	import { SITE_GITHUB_URL, SITE_X_URL } from '#lib/constants.ts'
	import Icon from '#lib/components/simple-icon.svelte'

	let { labels }: { labels: Record<string, string> } = $props()

	const socialLinks = [
		{ href: SITE_GITHUB_URL, title: 'GitHub', icon: 'siGithub' as const },
		{ href: SITE_X_URL, title: 'X', icon: 'siX' as const }
	]
</script>

<div class="shadow-feature-card bg-bg-surface flex flex-col gap-6 rounded-lg p-4 lg:p-6">
	<div class="flex items-center gap-2">
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text size-[18px]">
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
		</svg>
		<h2 class="text-sm font-medium">{labels['about-me.connect']}</h2>
	</div>
	<div class="flex flex-col gap-4 px-2">
		{#each socialLinks as link (link.href)}
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground hover:text-foreground flex w-fit items-center gap-3 transition-colors"
			>
				<Icon icon={link.icon} size={18} />
				<h3>{link.title}</h3>
			</a>
		{/each}
	</div>
</div>
