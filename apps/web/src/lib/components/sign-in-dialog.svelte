<script lang="ts">
	import { signIn, signUp } from '#lib/auth-client.ts'
	import { dialogs, closeSignIn } from '#lib/dialogs.svelte.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import ForgotPasswordDialog from './forgot-password-dialog.svelte'
	import { page } from '$app/state'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import { i18n } from '@isyuricunha/i18n/config'

	let isPending = $state(false)
	let lastUsedProvider = $state<'github' | 'google' | null>(null)
	let email = $state('')
	let password = $state('')
	let name = $state('')
	let isEmailPending = $state(false)
	let isSignup = $state(false)
	let isForgotPasswordOpen = $state(false)

	let { locale = i18n.defaultLocale }: { locale?: string } = $props()

	const pathname = $derived(page.url.pathname)

	let t = $state<(key: string, variables?: Record<string, string | number>) => string>(
		(key) => key
	)

	$effect(() => {
		let cancelled = false
		void (async () => {
			const [messages, fallback] = await Promise.all([
				loadMessages(locale),
				loadMessages(i18n.defaultLocale)
			])
			if (cancelled) return
			t = createTranslator(locale, messages as never, fallback as never)
		})()
		return () => {
			cancelled = true
		}
	})

	$effect(() => {
		if (typeof globalThis === 'undefined') return
		const provider = localStorage.getItem('last-used-provider')
		if (provider === 'github' || provider === 'google') {
			lastUsedProvider = provider
		}
	})

	const unknownError = 'Unknown error'

	async function handleSocialSignIn(provider: 'github' | 'google') {
		localStorage.setItem('last-used-provider', provider)
		isPending = true
		const result = await signIn.social({
			provider,
			callbackURL: pathname,
			fetchOptions: {
				onSuccess: () => {
					isPending = false
					toastSuccess(t('common.sign-in-success'))
				},
				onError: () => {
					isPending = false
					toastError(t('common.sign-in-error'))
				}
			}
		})
		if (result?.error) {
			isPending = false
			toastError(result.error.message ?? 'Sign in failed')
		}
	}

	async function handleAnonymousSignIn() {
		isPending = true
		try {
			const result = await signIn.anonymous({
				fetchOptions: {
					onSuccess: () => {
						isPending = false
						toastSuccess(t('common.sign-in-success'))
						closeSignIn()
					},
					onError: () => {
						isPending = false
						toastError(t('common.sign-in-error'))
					}
				}
			})
			if (result?.error) {
				isPending = false
				toastError(result.error.message ?? 'Sign in failed')
			}
		} catch (error) {
			toastError(error instanceof Error ? error.message : unknownError)
			isPending = false
		}
	}

	async function handleEmailSignIn() {
		isEmailPending = true
		try {
			const result = await signIn.email({ email, password, callbackURL: pathname })
			if (result.error) {
				toastError(result.error.message ?? unknownError)
			} else {
				toastSuccess(t('common.sign-in-success'))
			}
		} catch (error) {
			toastError(error instanceof Error ? error.message : unknownError)
		} finally {
			isEmailPending = false
		}
	}

	async function handleEmailSignUp() {
		isEmailPending = true
		try {
			const result = await signUp.email({ email, password, name, callbackURL: pathname })
			if (result.error) {
				toastError(result.error.message ?? unknownError)
			} else {
				toastSuccess(t('common.sign-in-success'))
				isSignup = false
			}
		} catch (error) {
			toastError(error instanceof Error ? error.message : unknownError)
		} finally {
			isEmailPending = false
		}
	}
</script>

{#if dialogs.isSignInOpen}
	<div
		class="fixed inset-0 z-50 bg-black/80"
		role="presentation"
		onclick={() => closeSignIn()}
	></div>
	<div
		role="dialog"
		aria-modal="true"
		aria-label={t(isSignup ? 'common.sign-up' : 'common.sign-in')}
		class="bg-bg-elevated fixed top-1/2 left-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-[425px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-[var(--border-default)] p-6 shadow-feature-card"
	>
		<div class="flex items-start justify-between">
			<div class="mb-2">
				<h2 class="text-left text-2xl">{t(isSignup ? 'common.sign-up' : 'common.sign-in')}</h2>
				<p class="text-muted-foreground mt-1 text-left text-sm">
					{t(isSignup ? 'dialog.sign-up.description' : 'dialog.sign-in.description')}
				</p>
			</div>
			<button
				type="button"
				aria-label="Close"
				class="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
				onclick={() => closeSignIn()}
			>
				<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
			</button>
		</div>

		{#if !isSignup}
			<div class="my-4 flex flex-col gap-3">
				<button
					type="button"
					disabled={isPending}
					class="focus-visible:ring-ring relative flex h-10 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
					onclick={() => handleSocialSignIn('github')}
				>
					{#if !isPending}
						<svg class="size-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"></path></svg>
					{/if}
					{t('dialog.sign-in.continue-with', { provider: t('dialog.sign-in.provider.github') })}
				</button>
				<button
					type="button"
					disabled={isPending}
					class="focus-visible:ring-ring relative flex h-10 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-bg-hover focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
					onclick={() => handleSocialSignIn('google')}
				>
					{#if !isPending}
						<svg class="size-5" viewBox="0 0 48 48" aria-hidden="true"><path fill="currentColor" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="currentColor" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="currentColor" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path></svg>
					{/if}
					{t('dialog.sign-in.continue-with', { provider: t('dialog.sign-in.provider.google') })}
				</button>
				<button
					type="button"
					disabled={isPending}
					class="focus-visible:ring-ring relative flex h-10 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-bg-hover focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
					onclick={handleAnonymousSignIn}
				>
					{#if !isPending}
						<svg class="size-5" viewBox="0 0 48 48" aria-hidden="true"><path fill="currentColor" d="M25 2C15.06 2 7 4.69 7 8v17c0 5.08 5.42 19.08 18 22 12.58-2.92 18-16.92 18-22V8c0-3.31-8.06-6-18-6zm0 2c10.5 0 16 2.97 16 4v17c0 4.14-4.33 15.52-14 19.3V38h-4v6.3C13.33 40.52 9 29.14 9 25V8c0-1.03 5.5-4 16-4z"></path></svg>
					{/if}
					{t('dialog.sign-in.anonymous')}
				</button>
			</div>
		{/if}

		<div class="flex items-center gap-2">
			<div class="bg-[var(--border-default)] h-px flex-1"></div>
			<span class="text-text-tertiary text-sm">or</span>
			<div class="bg-[var(--border-default)] h-px flex-1"></div>
		</div>

		<div class="my-4 flex flex-col gap-3">
			{#if isSignup}
				<input
					type="text"
					bind:value={name}
					placeholder="Name"
					class="border-input bg-bg-elevated placeholder:text-muted-foreground focus-visible:ring-ring h-11 w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
				/>
			{/if}
			<input
				type="email"
				bind:value={email}
				placeholder="Email"
				class="border-input bg-bg-elevated placeholder:text-muted-foreground focus-visible:ring-ring h-11 w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
			/>
			<input
				type="password"
				bind:value={password}
				placeholder="Password"
				class="border-input bg-bg-elevated placeholder:text-muted-foreground focus-visible:ring-ring h-11 w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
			/>
			<button
				type="button"
				disabled={isEmailPending}
				class="focus-visible:ring-ring h-10 min-h-[44px] w-full rounded-xl bg-accent text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
				onclick={isSignup ? handleEmailSignUp : handleEmailSignIn}
			>
				{isEmailPending ? 'Working…' : t(isSignup ? 'dialog.sign-up.email-submit' : 'dialog.sign-in.email-submit')}
			</button>
		</div>

		<div class="mt-2 text-center text-sm">
			{#if isSignup}
				{t('dialog.already-have-account')}
				<button
					type="button"
					class="text-accent underline transition-colors hover:opacity-80"
					onclick={() => (isSignup = false)}
				>
					{t('dialog.sign-in.here')}
				</button>
			{:else}
				{t('dialog.dont-have-account')}
				<button
					type="button"
					class="text-accent underline transition-colors hover:opacity-80"
					onclick={() => (isSignup = true)}
				>
					{t('dialog.sign-up.here')}
				</button>
			{/if}
		</div>
	</div>
{/if}

<ForgotPasswordDialog bind:open={isForgotPasswordOpen} />
