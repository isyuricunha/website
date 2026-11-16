<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { toastError } from '#lib/toasts.svelte.ts'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import { i18n } from '@isyuricunha/i18n/config'

	let { open = $bindable(false) }: { open?: boolean } = $props()

	let email = $state('')
	let isSuccess = $state(false)
	let t = $state<(key: string, variables?: Record<string, string | number>) => string>(
		(key) => key
	)

	$effect(() => {
		let cancelled = false
		void (async () => {
			const [messages, fallback] = await Promise.all([
				loadMessages(i18n.defaultLocale),
				loadMessages(i18n.defaultLocale)
			])
			if (cancelled) return
			t = createTranslator(i18n.defaultLocale, messages as never, fallback as never)
		})()
		return () => {
			cancelled = true
		}
	})

	let requestResetPending = $state(false)

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault()
		if (!email) {
			toastError(t('dialog.forgot-password.errors.no-email'))
			return
		}
		requestResetPending = true
		try {
			await trpc.users.requestPasswordReset.mutate({ email })
			isSuccess = true
		} catch (error) {
			toastError(error instanceof Error ? error.message : t('dialog.forgot-password.errors.send-failed'))
		} finally {
			requestResetPending = false
		}
	}

	function handleClose() {
		open = false
		setTimeout(() => {
			email = ''
			isSuccess = false
		}, 300)
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 bg-black/80" role="presentation" onclick={handleClose}></div>
	<div
		role="dialog"
		aria-modal="true"
		aria-label={t('dialog.forgot-password.title')}
		class="bg-bg-elevated fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--border-default)] p-6 shadow-feature-card"
	>
		{#if isSuccess}
			<div class="flex flex-col items-center gap-4 py-4 text-center">
				<div class="bg-status-success-soft flex h-16 w-16 items-center justify-center rounded-full">
					<svg class="text-status-success h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
				</div>
				<div>
					<h2 class="mb-2 text-xl font-medium">{t('dialog.forgot-password.success.title')}</h2>
					<p class="text-sm leading-relaxed">
						{t('dialog.forgot-password.success.sent')}
						<strong class="text-foreground font-medium">{email}</strong>.
						<br />
						{t('dialog.forgot-password.success.instructions')}
					</p>
				</div>
			</div>
			<div class="mt-2 space-y-3">
				<p class="text-muted-foreground text-center text-xs">
					{t('dialog.forgot-password.success.tip')}
				</p>
				<button
					type="button"
					class="border-input focus-visible:ring-ring h-11 w-full rounded-xl border bg-transparent font-medium transition-colors hover:bg-bg-hover focus-visible:ring-2 focus-visible:outline-none"
					onclick={handleClose}
				>
					{t('dialog.forgot-password.back')}
				</button>
			</div>
		{:else}
			<div class="mb-2 flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-dim)]">
					<svg class="text-accent-earth-text h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
				</div>
				<div class="flex-1">
					<h2 class="text-left text-xl font-medium">{t('dialog.forgot-password.title')}</h2>
					<p class="text-muted-foreground text-left text-sm">
						{t('dialog.forgot-password.description')}
					</p>
				</div>
			</div>

			<form class="mt-4 space-y-4" onsubmit={handleSubmit}>
				<div>
					<label for="forgot-email" class="mb-2 block text-sm font-medium">
						{t('dialog.forgot-password.email.label')}
					</label>
					<input
						id="forgot-email"
						type="email"
						bind:value={email}
						placeholder={t('dialog.forgot-password.email.placeholder')}
						required
						disabled={requestResetPending}
						class="border-input bg-bg-elevated placeholder:text-muted-foreground focus-visible:ring-ring h-11 w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
					/>
				</div>

				<button
					type="submit"
					disabled={requestResetPending || !email}
					class="focus-visible:ring-ring h-11 w-full rounded-lg bg-accent font-medium text-text-inverse transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
				>
					{requestResetPending
						? t('dialog.forgot-password.submit.pending')
						: t('dialog.forgot-password.submit.default')}
				</button>

				<button
					type="button"
					class="focus-visible:ring-ring h-11 w-full rounded-lg bg-transparent font-medium transition-colors hover:bg-bg-hover focus-visible:ring-2 focus-visible:outline-none"
					onclick={handleClose}
				>
					{t('dialog.forgot-password.back')}
				</button>
			</form>
		{/if}
	</div>
{/if}
