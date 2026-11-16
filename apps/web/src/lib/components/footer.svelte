<script lang="ts">
	import { FOOTER_LINKS } from '#lib/links.ts'

	type Props = {
		labels: Record<string, string>
	}

	let { labels }: Props = $props()

	const currentYear = new Date().getFullYear()
</script>

<footer class="relative mx-auto flex w-full max-w-6xl flex-col border-t border-[var(--border-faint)] px-4 py-12 sm:px-8">
	<div class="mt-6 grid grid-cols-2 sm:grid-cols-3">
		{#each FOOTER_LINKS as list (list.id)}
			<div class="mb-10 flex flex-col items-start gap-4 pr-4">
				{#each list.links as link (link.href)}
					{#if link.href.startsWith('http')}
						<a
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							class="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
						>
							{labels[link.key] ?? link.key}
						</a>
					{:else}
						<a
							href={link.href}
							class="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
						>
							{labels[link.key] ?? link.key}
						</a>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
	<div class="text-muted-foreground mt-20 flex items-center justify-between text-xs sm:text-sm">
		<div>Yuri Cunha | &copy; {currentYear}</div>
		<a
			href="https://github.com/isyuricunha/website"
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center justify-center overflow-hidden rounded-md border border-[var(--border-default)] transition-colors hover:border-[var(--border-strong)]"
		>
			<div class="bg-bg-surface flex h-8 items-center gap-2 border-r border-[var(--border-default)] px-2">
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
					<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
				</svg>
				<span class="font-medium">{labels['star'] ?? 'Star'}</span>
			</div>
			<div class="bg-bg-base flex h-8 items-center px-3">--</div>
		</a>
	</div>
</footer>
