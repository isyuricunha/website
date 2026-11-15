<script lang="ts">
	import { HEADER_LINKS } from '#lib/links.ts'
import { calculate_visible_count } from '#lib/navbar-overflow.ts'
	import { page } from '$app/state'

	type Props = {
		labels: Record<string, string>
	}

	// The header links are site constants; importing them here keeps the
	// component a module-constant consumer instead of threading a prop.
	let { labels }: Props = $props()

	let visibleCount = $state(HEADER_LINKS.length)
	let container: HTMLUListElement | undefined = $state()
	let measureLinks: HTMLUListElement | undefined = $state()
	let measureMore: HTMLLIElement | undefined = $state()

	const currentPath = $derived(page.url.pathname)

	const visibleLinks = $derived(HEADER_LINKS.slice(0, visibleCount))
	const overflowLinks = $derived(HEADER_LINKS.slice(visibleCount))

	$effect(() => {
		const gapPx = 8

		const recalc = () => {
			if (!container || !measureLinks || !measureMore) {
				return
			}

			const availableWidth = container.getBoundingClientRect().width
			const itemWidths = Array.from(
				measureLinks.children,
				(el) => (el as HTMLElement).getBoundingClientRect().width
			)
			const moreWidth = measureMore.getBoundingClientRect().width

			visibleCount = calculate_visible_count({ availableWidth, itemWidths, moreWidth, gapPx })
		}

		recalc()

		if (!container) {
			return
		}

		const observer = new ResizeObserver(recalc)
		observer.observe(container)

		return () => observer.disconnect()
	})
</script>

<!-- Hidden measurement row keeps item widths stable across visibility changes. -->
<ul class="hidden" aria-hidden="true">
	{#each HEADER_LINKS as link (link.href)}
		<li class="whitespace-nowrap">
			<span class="text-sm">
				{labels[link.key] ?? link.key}
			</span>
		</li>
	{/each}
</ul>

<nav class="hidden items-center md:flex" aria-label="Main">
	<ul bind:this={container} class="flex items-center gap-2">
		{#each visibleLinks as link (link.href)}
			<li>
				<a
					href={link.href}
					aria-current={currentPath === link.href ? 'page' : undefined}
					class="text-muted-foreground hover:bg-bg-hover hover:text-foreground flex min-h-9 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm transition-colors aria-[current=page]:bg-bg-surface aria-[current=page]:text-foreground"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
						class="size-3.5"
					>
						{#each link.icon.split('|') as path (path)}
							{#if path}<path d={path} />{/if}
						{/each}
					</svg>
					{labels[link.key] ?? link.key}
				</a>
			</li>
		{/each}
		{#if overflowLinks.length > 0}
			<li bind:this={measureMore} class="relative">
				<details class="group">
					<summary
						class="text-muted-foreground hover:bg-bg-hover hover:text-foreground flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-md px-2 text-sm transition-colors"
					>
						More
					</summary>
					<ul class="bg-bg-elevated absolute right-0 mt-1 flex min-w-40 flex-col rounded-md border border-[var(--border-default)] p-1 shadow-lg">
						{#each overflowLinks as link (link.href)}
							<li>
								<a
									href={link.href}
									aria-current={currentPath === link.href ? 'page' : undefined}
									class="text-muted-foreground hover:bg-bg-hover hover:text-foreground flex min-h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors"
								>
									{labels[link.key] ?? link.key}
								</a>
							</li>
						{/each}
					</ul>
				</details>
			</li>
		{/if}
	</ul>
</nav>
