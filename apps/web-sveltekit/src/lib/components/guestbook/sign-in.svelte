<script lang="ts">
	import { signIn, signUp } from '#lib/auth-client.ts'
	import { toastError, toastSuccess } from '#lib/toasts.svelte.ts'

	type Props = {
		labels: Record<string, string>
	}

	let { labels }: Props = $props()

	let open = $state(false)
	let mode = $state<'sign-in' | 'sign-up'>('sign-in')
	let email = $state('')
	let password = $state('')
	let pending = $state(false)

	async function submit(event: SubmitEvent) {
		event.preventDefault()
		pending = true

		try {
			if (mode === 'sign-in') {
				const result = await signIn.email({ email, password })
				if (result.error) {
					toastError(result.error.message ?? labels['sign-in-error'])
					return
				}
				toastSuccess(labels['sign-in-success'])
			} else {
				const result = await signUp.email({
					email,
					password,
					name: email.split('@')[0] ?? ''
				})
				if (result.error) {
					toastError(result.error.message ?? labels['sign-up-error'])
					return
				}
				toastSuccess(labels['sign-up-success'])
			}

			window.location.reload()
		} finally {
			pending = false
		}
	}
</script>

<div class="flex items-center">
	<button
		type="button"
		class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-block rounded-md border border-[var(--border-default)] px-4 py-2 text-sm font-medium transition-colors"
		onclick={() => (open = true)}
	>
		{labels['sign-in'] ?? 'Sign in'}
	</button>
	<span class="ml-2">{labels['signin-description']}</span>
</div>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			type="button"
			class="bg-black/60 absolute inset-0 cursor-default"
			aria-label="Close sign-in"
			onclick={() => (open = false)}
		></button>
		<div
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			class="bg-bg-elevated relative z-10 w-full max-w-sm rounded-lg border border-[var(--border-subtle)] p-6 shadow-xl"
		>
			<h2 class="text-lg font-medium">{mode === 'sign-in' ? labels['sign-in'] : labels['sign-up']}</h2>

			<form class="mt-4 flex flex-col gap-3" onsubmit={submit}>
				<label class="sr-only" for="auth-email">{labels['email']}</label>
				<input
					id="auth-email"
					type="email"
					required
					bind:value={email}
					placeholder={labels['email']}
					class="bg-bg-surface rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
				/>
				<label class="sr-only" for="auth-password">{labels['password']}</label>
				<input
					id="auth-password"
					type="password"
					required
					minlength="8"
					bind:value={password}
					placeholder={labels['password']}
					class="bg-bg-surface rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
				/>
				<button
					type="submit"
					disabled={pending}
					class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex min-h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors"
				>
					{mode === 'sign-in' ? labels['sign-in'] : labels['sign-up']}
				</button>
			</form>

			<button
				type="button"
				class="text-muted-foreground hover:text-foreground mt-4 w-full text-center text-sm"
				onclick={() => (mode = mode === 'sign-in' ? 'sign-up' : 'sign-in')}
			>
				{mode === 'sign-in' ? labels['create-account'] : labels['have-account']}
			</button>
		</div>
	</div>
{/if}
