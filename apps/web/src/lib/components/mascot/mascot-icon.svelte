<script lang="ts">
	// Lucide icon markup, extracted at build time into mascot-icons.ts (ISC
	// license, https://lucide.dev) so there is no runtime icon dependency.
	import { MASCOT_ICONS } from './mascot-icons'

	let { name, size = 16, class: className = '' }: { name: string; size?: number; class?: string } = $props()

	const markup = $derived(MASCOT_ICONS[name] ?? '')
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	aria-hidden="true"
>
	{@html markup}
</svg>
