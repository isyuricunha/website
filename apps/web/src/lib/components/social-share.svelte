<script lang="ts">
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'

	let {
		title,
		url,
		description,
		hashtags = [],
		className = '',
		labels
	}: {
		title: string
		url: string
		description?: string
		hashtags?: string[]
		className?: string
		labels: Record<string, string>
	} = $props()

	let open = $state(false)
	let copied = $state(false)
	let root: HTMLElement | undefined

	let shareUrl = $derived(typeof window === 'undefined' ? url : `${location.origin}${url}`)
	let encodedTitle = $derived(encodeURIComponent(title))
	let encodedUrl = $derived(encodeURIComponent(shareUrl))
	let encodedDescription = $derived(encodeURIComponent(description || ''))
	let hashtagString = $derived(hashtags.length > 0 ? `&hashtags=${hashtags.join(',')}` : '')

	let shareLinks = $derived({
		twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${hashtagString}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
		reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
		whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
		telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
	})

	function copyToClipboard() {
		try {
			navigator.clipboard
				.writeText(shareUrl)
				.then(() => {
					copied = true
					toastSuccess(labels['toast.copied'])
					setTimeout(() => (copied = false), 2000)
				})
				.catch(() => toastError(labels['toast.copy-failed']))
		} catch {
			toastError(labels['toast.copy-failed'])
		}
	}

	function openShare(platform: keyof typeof shareLinks) {
		window.open(shareLinks[platform], '_blank', 'noopener,noreferrer')
	}

	function handleNativeShare() {
		if (typeof navigator !== 'undefined' && navigator.share) {
			navigator.share({ title, text: description, url: shareUrl }).catch(() => {})
		}
	}

	function onWindowClick(e: MouseEvent) {
		if (open && root && !root.contains(e.target as Node)) open = false
	}
</script>

<svelte:window onclick={onWindowClick} />

<div bind:this={root} class="relative {className}">
	<button
		type="button"
		onclick={() => (open = !open)}
		class="border-border inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors"
		aria-label={labels['button.aria']}
		aria-expanded={open}
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
			<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
			<line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
		</svg>
		{labels['button.label']}
	</button>

	{#if open}
		<div class="bg-bg-popover absolute right-0 z-50 mt-1 w-48 rounded-md border border-[var(--border-faint)] p-1 shadow-lg">
			{#if typeof navigator !== 'undefined' && typeof navigator.share === 'function'}
				<button
					type="button"
					onclick={handleNativeShare}
					class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
						<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
						<line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
					</svg>
					{labels.native}
				</button>
			{/if}
			<button
				type="button"
				onclick={() => openShare('twitter')}
				class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-4">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
				{labels['platform.twitter']}
			</button>
			<button
				type="button"
				onclick={() => openShare('facebook')}
				class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-4">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
				{labels['platform.facebook']}
			</button>
			<button
				type="button"
				onclick={() => openShare('linkedin')}
				class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
			>
				<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-4">
					<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
				</svg>
				{labels['platform.linkedin']}
			</button>
			<button
				type="button"
				onclick={() => openShare('reddit')}
				class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-4">
					<path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
				</svg>
				{labels['platform.reddit']}
			</button>
			<button
				type="button"
				onclick={() => openShare('whatsapp')}
				class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-4">
					<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
				</svg>
				{labels['platform.whatsapp']}
			</button>
			<button
				type="button"
				onclick={copyToClipboard}
				class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
			>
				{#if copied}
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text size-4">
						<polyline points="20 6 9 17 4 12" />
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
					</svg>
				{/if}
				{copied ? labels['copy.copied'] : labels['copy.label']}
			</button>
		</div>
	{/if}
</div>
