<script lang="ts">
	let {
		name,
		color,
		effect,
		className = ''
	}: {
		name: string
		color?: string | null
		effect?: 'none' | 'rays' | 'glow' | null
		className?: string
	} = $props()

	let resolvedEffect = $derived(effect ?? 'none')
	let textShadow = $derived.by(() => {
		if (resolvedEffect === 'glow') {
			return '0 0 12px rgba(240,230,200,0.34), 0 0 28px rgba(201,87,42,0.2)'
		}
		if (resolvedEffect === 'rays') {
			return '0 0 10px rgba(224,120,72,0.42), 0 0 26px rgba(201,87,42,0.22)'
		}
		return ''
	})

	let resolvedColor = $derived(color ?? undefined)
</script>

<span
	class="font-medium {className}"
	style:color={resolvedColor}
	style:text-shadow={textShadow || undefined}
>{name}</span>
