<script lang="ts">
	import '../app.css'
	import { SIDEBAR_LINKS, HEADER_LINKS } from '#lib/links.ts'
	import type { LayoutData } from './$types'

	let { data, children } = $props()
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<div class="min-h-svh">
	<header class="border-b border-[var(--border-faint)] sticky top-0 z-20 bg-[var(--bg)]/95 backdrop-blur">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
			<a href="/" class="font-semibold tracking-tight">Yuri Cunha Docs</a>
			<nav class="flex items-center gap-4 text-sm">
				{#each HEADER_LINKS as link (link.href)}
					<a href={link.href} target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground transition-colors">
						{link.text}
					</a>
				{/each}
			</nav>
		</div>
	</header>

	<div class="mx-auto flex max-w-7xl">
		<aside class="hidden w-64 shrink-0 border-r border-[var(--border-faint)] lg:block">
			<nav class="sticky top-14 max-h-[calc(100svh-3.5rem)] overflow-y-auto p-4 text-sm" aria-label="Documentation sidebar">
				{#each SIDEBAR_LINKS as section (section.title)}
					<div class="mb-6">
						<div class="text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase tracking-wider">
							{section.title}
						</div>
						<ul class="flex flex-col gap-0.5">
							{#each section.links as link (link.href)}
								<li>
									<a
										href={link.href}
										class="text-muted-foreground hover:text-foreground block rounded-md px-2 py-1 transition-colors aria-[current=page]:bg-accent/50 aria-[current=page]:text-foreground"
										aria-current={data?.pathname === link.href ? 'page' : undefined}
									>
										{link.text}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</nav>
		</aside>

		<div class="min-w-0 flex-1">
			{@render children()}
		</div>
	</div>
</div>
