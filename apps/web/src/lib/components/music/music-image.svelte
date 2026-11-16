<script lang="ts">
	let {
		src,
		alt,
		fallbackIcon,
		className = '',
		width,
		height
	}: {
		src?: string | null
		alt: string
		fallbackIcon?: 'play' | 'user'
		className?: string
		width?: number
		height?: number
	} = $props()

	let hasError = $state(false)
	let isLoading = $state(true)

	const fallbackIcons: Record<'play' | 'user', string> = {
		play: '<polygon points="6 3 20 12 6 21 6 3" />',
		user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />'
	}
</script>

{#if !src || hasError}
	<div class="bg-bg-hover flex items-center justify-center {className}">
		{#if fallbackIcon}
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-6 w-6">
				{@html fallbackIcons[fallbackIcon]}
			</svg>
		{/if}
	</div>
{:else}
	<div class="relative {className}">
		{#if isLoading}
			<div class="yu-skeleton absolute inset-0 flex items-center justify-center">
				{#if fallbackIcon}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-6 w-6">
						{@html fallbackIcons[fallbackIcon]}
					</svg>
				{/if}
			</div>
		{/if}
		<img
			src={src}
			{alt}
			width={width}
			height={height}
			loading="lazy"
			class="object-cover transition-opacity duration-200 {isLoading ? 'opacity-0' : 'opacity-100'}"
			onload={() => (isLoading = false)}
			onerror={() => {
				hasError = true
				isLoading = false
			}}
		/>
	</div>
{/if}
