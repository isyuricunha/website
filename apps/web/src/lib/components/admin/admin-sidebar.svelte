<script lang="ts">
	import AdminIcon from './admin-icon.svelte'
	import { ADMIN_SIDEBAR_LINKS } from '#lib/config/admin-sidebar-links.ts'
	import { page } from '$app/state'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	let pathname = $derived(page.url.pathname)

	function isActive(url: string) {
		return pathname === url || pathname.startsWith(`${url}/`)
	}

	function localizedHref(url: string) {
		return locale === 'en' ? url : `/${locale}${url}`
	}
</script>

<aside class="bg-bg-surface sticky top-0 hidden h-svh w-60 shrink-0 flex-col overflow-y-auto border-r border-[var(--border-faint)] p-3 lg:flex">
	<div class="border-b-[0.5px] border-[var(--border-faint)] px-3 py-4">
		<span class="label-mono">{labels['sidebar.control']}</span>
	</div>
	<nav class="mt-2 space-y-5">
		{#each ADMIN_SIDEBAR_LINKS as group (group.titleKey)}
			<div>
				<p class="text-muted-foreground mb-2 px-3 text-xs font-medium uppercase tracking-wide">
					{labels[`nav.${group.titleKey}`]}
				</p>
				<ul class="space-y-1">
					{#each group.links as link (link.url)}
						<li>
							<a
								href={localizedHref(link.url)}
								class="hover:bg-bg-hover flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors {isActive(link.url)
									? 'bg-[var(--accent-dim)] text-accent-earth-text font-medium'
									: ''}"
								aria-current={isActive(link.url) ? 'page' : undefined}
							>
								<AdminIcon iconId={link.icon} />
								<span>{link.title ?? labels[`nav.${link.titleKey}`]}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>
</aside>

{#if pathname.startsWith('/admin')}
	<!-- Mobile drawer is provided by the admin shell toggle in the header. -->
{/if}
