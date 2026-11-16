<script lang="ts">
	let {
		value,
		onChange,
		className = '',
		labels
	}: {
		value: 'short_term' | 'medium_term' | 'long_term'
		onChange: (v: 'short_term' | 'medium_term' | 'long_term') => void
		className?: string
		labels: Record<string, string>
	} = $props()

	const opts: Array<{ key: 'short_term' | 'medium_term' | 'long_term'; labelKey: string }> = [
		{ key: 'short_term', labelKey: 'range.short' },
		{ key: 'medium_term', labelKey: 'range.medium' },
		{ key: 'long_term', labelKey: 'range.long' }
	]
</script>

<div class="bg-bg-hover inline-flex items-center gap-1 rounded-md p-1 text-xs {className}">
	{#each opts as o (o.key)}
		<button
			type="button"
			onclick={() => onChange(o.key)}
			class="rounded-md px-2 py-1 transition-colors {value === o.key
				? 'bg-bg-base text-text-primary shadow'
				: 'text-text-secondary hover:text-text-primary'}"
			aria-pressed={value === o.key}
		>
			{labels[o.labelKey]}
		</button>
	{/each}
</div>
