<script lang="ts">
	import * as icons from 'simple-icons'

	// Data-only simple-icons entry; renders without any React dependency.
	let { icon, size = 20, className = '' }: { icon: keyof typeof icons; size?: number; className?: string } = $props()

	let data = $derived((icons as Record<string, { path: string; title: string }>)[icon])
</script>

{#if data}
	<svg
		role="img"
		aria-label={data.title}
		viewBox="0 0 24 24"
		width={size}
		height={size}
		fill="currentColor"
		class={className}
	>
		<path d={data.path} />
	</svg>
{/if}
