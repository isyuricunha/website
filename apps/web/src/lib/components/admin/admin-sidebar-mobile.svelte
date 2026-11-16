<script lang="ts">
	import AdminIcon from './admin-icon.svelte'
	import { ADMIN_SIDEBAR_LINKS } from '#lib/config/admin-sidebar-links.ts'
	import { page } from '$app/state'

	let {
		labels,
		locale,
		mobileOpen = $bindable(false),
		onClose
	}: {
		labels: Record<string, string>
		locale: string
		mobileOpen?: boolean
		onClose: () => void
	} = $props()

	let pathname = $derived(page.url.pathname)

	function isActive(url: string) {
		return pathname === url || pathname.startsWith(`${url}/`)
	}

	function localizedHref(url: string) {
		return locale === 'en' ? url : `/${locale}${url}`
	}
</script>

{#if mobileOpen}
	<div class="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
		<button type="button" class="bg-black/60 absolute inset-0 cursor-default" aria-label="Close navigation" onclick={onClose}></button>
		<aside class="bg-bg-surface relative z-10 h-svh w-64 overflow-y-auto border-r border-[var(--border-faint)] p-3">
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
										onclick={onClose}
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
	</div>
{/if}
