<script lang="ts">
	import Turnstile from '#lib/components/turnstile.svelte'

	let { labels }: { labels: Record<string, string> } = $props()

	let email = $state('')
	let isLoading = $state(false)
	let isSubscribed = $state(false)
	let error = $state('')
	let turnstileToken = $state<string | null>(null)
	let turnstileInstance = $state<{ resetWidget: () => void } | null>(null)

	// Mirrors flags.turnstile && NEXT_PUBLIC_TURNSTILE_SITE_KEY in the Next app.
	let siteKey = $derived(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '')
	let isTurnstileEnabled = $derived(
		import.meta.env.PUBLIC_FLAG_TURNSTILE === 'true' && siteKey !== ''
	)

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault()
		if (!email.trim()) return

		if (isTurnstileEnabled && !turnstileToken) {
			error = labels['newsletter.turnstile-required']
			return
		}

		isLoading = true
		error = ''

		try {
			const response = await fetch('/api/newsletter/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: email.trim(),
					...(isTurnstileEnabled && { turnstileToken })
				})
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || labels['newsletter.error-default'])
			}

			isSubscribed = true
			email = ''
			turnstileToken = null
			turnstileInstance?.resetWidget()
		} catch (error_) {
			error = error_ instanceof Error ? error_.message : labels['newsletter.error-default']
			// A single-use token is consumed server-side on a 4xx; the retry must
			// carry a fresh token or it loops into the same rejection forever.
			turnstileToken = null
			turnstileInstance?.resetWidget()
		} finally {
			isLoading = false
		}
	}
</script>

<div id="newsletter">
{#if isSubscribed}
	<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
		<div class="p-6 text-center">
			<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-status-success mx-auto mb-4 h-12 w-12">
				<circle cx="12" cy="12" r="10" /><polyline points="9 12 11.5 14.5 15.5 10" />
			</svg>
			<h3 class="mb-2 text-base font-medium sm:text-lg">{labels['newsletter.success-title']}</h3>
			<p class="text-muted-foreground text-xs sm:text-sm">{labels['newsletter.success-description']}</p>
		</div>
	</div>
{:else}
	<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
		<div class="p-6 pb-0">
			<h3 class="flex items-center gap-2 text-base font-medium sm:text-lg">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-5 w-5">
					<rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
				</svg>
				{labels['newsletter.title']}
			</h3>
			<p class="text-muted-foreground text-xs sm:text-sm">{labels['newsletter.description']}</p>
		</div>
		<div class="p-6">
			<form onsubmit={handleSubmit} class="space-y-4">
				{#if error}
					<div
						id="newsletter-email-error"
						role="alert"
						class="text-accent-earth-text flex items-center gap-2 rounded-md border border-[var(--accent-border)] bg-[var(--accent-dim)] p-3 text-sm"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4 flex-shrink-0">
							<circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
						</svg>
						<span>{error}</span>
					</div>
				{/if}
				<div class="flex flex-col gap-2 sm:flex-row">
					<label for="newsletter-email" class="sr-only">{labels['newsletter.email-label']}</label>
					<input
						id="newsletter-email"
						type="email"
						placeholder={labels['newsletter.placeholder']}
						bind:value={email}
						required
						aria-invalid={!!error}
						aria-describedby={error ? 'newsletter-email-error' : undefined}
						class="bg-bg-hover flex-1 rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
						disabled={isLoading}
					/>
					<button
						type="submit"
						disabled={isLoading || !email.trim() || (isTurnstileEnabled && !turnstileToken)}
						class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
					>
						{#if isLoading}
							<div aria-hidden="true" class="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent"></div>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
								<path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
							</svg>
						{/if}
						{labels['newsletter.cta']}
					</button>
				</div>
				{#if isTurnstileEnabled && siteKey}
					<div class="flex justify-center">
						<Turnstile
							bind:this={turnstileInstance}
							{siteKey}
							onSuccess={(token) => (turnstileToken = token)}
							onError={() => {
								turnstileToken = null
								turnstileInstance?.resetWidget()
								error = labels['newsletter.turnstile-error']
							}}
							onExpire={() => {
								turnstileToken = null
								turnstileInstance?.resetWidget()
							}}
						/>
					</div>
				{/if}
				<p class="text-muted-foreground text-xs">{labels['newsletter.disclaimer']}</p>
			</form>
		</div>
	</div>
{/if}
</div>
