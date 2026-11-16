<script lang="ts">
	import { HEADER_LINKS } from '#lib/links.ts'

	type Props = {
		labels: Record<string, string>
	}

	let { labels }: Props = $props()

	let open = $state(false)

	function close() {
		open = false
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			open = false
		}
	}
</script>

<button
	type="button"
	class="text-muted-foreground hover:bg-bg-hover hover:text-foreground flex size-9 items-center justify-center rounded-md transition-colors md:hidden"
	aria-label={labels['toggle-menu'] ?? 'Toggle menu'}
	aria-expanded={open}
	onclick={() => (open = !open)}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		class="size-4"
	>
		<path d="M4 6h16" />
		<path d="M4 12h16" />
		<path d="M4 18h16" />
	</svg>
</button>

{#if open}
	<div class="fixed inset-0 z-50 md:hidden">
		<button
			type="button"
			class="bg-black/60 absolute inset-0 cursor-default"
			aria-label="Close navigation"
			onclick={close}
		></button>
		<div
			role="dialog"
			aria-modal="true"
			aria-label={labels['navigation'] ?? 'Navigation'}
			tabindex="-1"
			class="bg-bg-elevated absolute inset-y-0 right-0 flex w-[85vw] max-w-80 flex-col border-l border-[var(--border-subtle)] shadow-xl"
			onkeydown={onKeydown}
		>
			<div class="border-b border-[var(--border-faint)] p-4 sm:p-6">
				<div class="text-lg font-medium">{labels['navigation'] ?? 'Navigation'}</div>
			</div>
			<nav class="p-4 sm:p-6" aria-label="Mobile">
				<ul class="space-y-1">
					{#each HEADER_LINKS as link, index (link.href)}
						<li class="yu-rise" style={`animation-delay:${index * 0.05}s`}>
							<a
								href={link.href}
								onclick={close}
								class="text-muted-foreground hover:bg-bg-hover hover:text-foreground flex min-h-[44px] items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors aria-[current=page]:bg-bg-surface aria-[current=page]:text-accent-earth-text"
							>
								<span class="flex h-5 w-5 flex-shrink-0 items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
										class="size-4"
									>
										{#each link.icon.split('|') as path (path)}
											{#if path}<path d={path} />{/if}
										{/each}
									</svg>
								</span>
								<span class="flex-1">{labels[link.key] ?? link.key}</span>
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</div>
{/if}
