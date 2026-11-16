<script lang="ts">
	import { i18n } from '@isyuricunha/i18n/config'
	import { page } from '$app/state'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	let pathname = $derived(page.url.pathname)

	let segments = $derived(pathname.split('/').filter(Boolean))

	// The locale prefix is routing, not a page: count only the path after it.
	let pathSegments = $derived(
		segments.length > 0 && i18n.locales.includes(segments[0] as never) ? segments.slice(1) : segments
	)

	function labelFor(segment: string) {
		if (segment === 'admin') return labels['nav.dashboard']
		const key = `nav.${segment.replaceAll('-', '_')}`
		return labels[key] ?? segment.replaceAll('-', ' ')
	}

	function hrefFor(index: number) {
		const base = pathSegments.slice(0, index + 1).join('/')
		return locale === 'en' ? `/${base}` : `/${locale}/${base}`
	}

	let breadcrumbs = $derived(pathSegments.map((segment, index) => ({
		href: hrefFor(index),
		label: labelFor(segment),
		isLast: index === pathSegments.length - 1
	})))
</script>

{#if breadcrumbs.length > 1}
	<nav class="text-text-tertiary mb-6 flex items-center space-x-1 text-sm">
		<a
			href={locale === 'en' ? '/admin' : `/${locale}/admin`}
			class="hover:text-text-primary flex items-center transition-colors"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
				<path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
			</svg>
			<span class="ml-1">{labels['nav.dashboard']}</span>
		</a>
		{#each breadcrumbs.slice(1) as breadcrumb (breadcrumb.href)}
			<div class="flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-1 h-4 w-4">
					<path d="m9 18 6-6-6-6" />
				</svg>
				{#if breadcrumb.isLast}
					<span class="text-text-primary font-medium">{breadcrumb.label}</span>
				{:else}
					<a href={breadcrumb.href} class="hover:text-text-primary transition-colors">
						{breadcrumb.label}
					</a>
				{/if}
			</div>
		{/each}
	</nav>
{/if}
