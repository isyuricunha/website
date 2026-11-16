<script lang="ts">
	import Turnstile from '#lib/components/turnstile.svelte'
	import { toastError, toastSuccess } from '#lib/toasts.svelte.ts'
	import { flags } from '#lib/flags.ts'

	type Props = {
		labels: Record<string, string>
		locale: string
	}

	let { labels, locale }: Props = $props()

	let name = $state('')
	let email = $state('')
	let subject = $state('')
	let message = $state('')
	let errors = $state<Record<string, string>>({})
	let turnstileToken = $state<string | null>(null)
	let turnstileEnabled = $derived(
		flags.turnstile && (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '') !== ''
	)
	let isSubmitting = $state(false)
	let submitStatus = $state<'idle' | 'success' | 'error'>('idle')
	let submitMessage = $state('')

	function isValidEmailFormat(value: string): boolean {
		if (/\s/.test(value)) return false
		const atIndex = value.indexOf('@')
		if (atIndex <= 0 || atIndex === value.length - 1) return false
		if (value.includes('@', atIndex + 1)) return false
		const domain = value.slice(atIndex + 1)
		const dotIndex = domain.lastIndexOf('.')
		return dotIndex > 0 && dotIndex < domain.length - 1
	}

	function handleInput(field: 'name' | 'email' | 'subject' | 'message', value: string) {
		if (field === 'name') name = value
		if (field === 'email') email = value
		if (field === 'subject') subject = value
		if (field === 'message') message = value

		if (errors[field]) {
			const { [field]: _removed, ...rest } = $state.snapshot(errors)
			errors = rest
		}

		if (submitStatus !== 'idle') {
			submitStatus = 'idle'
			submitMessage = ''
		}
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault()

		if (turnstileEnabled && !turnstileToken) {
			submitStatus = 'error'
			submitMessage = labels['form.turnstile.required'] ?? labels['form.error']
			toastError(submitMessage)
			return
		}

		const newErrors: Record<string, string> = {}
		if (!name.trim()) {
			newErrors['name'] = labels['form.name.required']
		} else if (name.length > 100) {
			newErrors['name'] = labels['form.name.max-length']
		}
		if (!email.trim()) {
			newErrors['email'] = labels['form.email.required']
		} else if (!isValidEmailFormat(email)) {
			newErrors['email'] = labels['form.email.invalid']
		}
		if (!subject.trim()) {
			newErrors['subject'] = labels['form.subject.required']
		} else if (subject.length > 200) {
			newErrors['subject'] = labels['form.subject.max-length']
		}
		if (!message.trim()) {
			newErrors['message'] = labels['form.message.required']
		} else if (message.length < 10) {
			newErrors['message'] = labels['form.message.min-length']
		} else if (message.length > 2000) {
			newErrors['message'] = labels['form.message.max-length']
		}

		errors = newErrors
		if (Object.keys(newErrors).length > 0) {
			return
		}

		isSubmitting = true
		submitStatus = 'idle'

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-locale': document.documentElement.lang || locale
				},
				body: JSON.stringify({ name, email, subject, message, ...(turnstileEnabled && { turnstileToken }) })
			})
			const result = await response.json()

			if (response.ok) {
				submitStatus = 'success'
				submitMessage = result.message || labels['form.success']
				name = ''
				email = ''
				subject = ''
				message = ''
				toastSuccess(submitMessage)
			} else if (result.details) {
				const serverErrors: Record<string, string> = {}
				for (const error of result.details as Array<{ path: string[]; message: string }>) {
					if (error.path && error.path.length > 0) {
						serverErrors[error.path[0]!] = error.message
					}
				}
				errors = serverErrors
			} else {
				submitStatus = 'error'
				submitMessage = result.error || labels['form.error']
				toastError(submitMessage)
			}
		} catch {
			submitStatus = 'error'
			submitMessage = labels['form.network-error']
			toastError(submitMessage)
		} finally {
			isSubmitting = false
		}
	}

	const inputClass = (field: string) =>
		`bg-bg-surface w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none ${
			errors[field] ? 'border-[var(--status-danger-border)]' : 'border-[var(--border-default)]'
		}`
	const errorText = (field: string) => `text-status-danger mt-1 text-xs`
	const fieldLabel = 'mb-2 block text-xs font-medium sm:text-sm'
</script>

<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6">
	<h3 class="flex items-center gap-2 text-base font-medium sm:text-lg">
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-5">
			<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
		</svg>
		{labels['form.title']}
	</h3>
	<p class="text-muted-foreground mt-1 text-xs sm:text-sm">{labels['form.description']}</p>

	{#if submitStatus === 'success'}
		<div class="text-status-success bg-status-success-soft mt-4 flex items-center gap-2 rounded-lg border border-[var(--status-success-border)] p-3">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
				<path d="m9 11 3 3L22 4" />
			</svg>
			<span class="text-sm">{submitMessage}</span>
		</div>
	{/if}
	{#if submitStatus === 'error' && submitMessage}
		<div class="text-status-danger bg-status-danger-soft mt-4 flex items-center gap-2 rounded-lg border border-[var(--status-danger-border)] p-3">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
				<circle cx="12" cy="12" r="10" />
				<line x1="12" x2="12" y1="8" y2="12" />
				<line x1="12" x2="12.01" y1="16" y2="16" />
			</svg>
			<span class="text-sm">{submitMessage}</span>
		</div>
	{/if}

	<form noValidate onsubmit={submit} class="mt-4 space-y-4">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<label for="contact-name" class={fieldLabel}>{labels['form.name.label']} *</label>
				<input
					id="contact-name"
					type="text"
					placeholder={labels['form.name.placeholder']}
					bind:value={name}
					class={inputClass('name')}
					disabled={isSubmitting}
					aria-invalid={errors['name'] ? true : undefined}
					aria-describedby={errors['name'] ? 'contact-name-error' : undefined}
				/>
				{#if errors['name']}
					<p id="contact-name-error" class={errorText('name')}>{errors['name']}</p>
				{/if}
			</div>
			<div>
				<label for="contact-email" class={fieldLabel}>{labels['form.email.label']} *</label>
				<input
					id="contact-email"
					type="email"
					placeholder={labels['form.email.placeholder']}
					bind:value={email}
					class={inputClass('email')}
					disabled={isSubmitting}
					aria-invalid={errors['email'] ? true : undefined}
					aria-describedby={errors['email'] ? 'contact-email-error' : undefined}
				/>
				{#if errors['email']}
					<p id="contact-email-error" class={errorText('email')}>{errors['email']}</p>
				{/if}
			</div>
		</div>

		<div>
			<label for="contact-subject" class={fieldLabel}>{labels['form.subject.label']} *</label>
			<input
				id="contact-subject"
				type="text"
				placeholder={labels['form.subject.placeholder']}
				bind:value={subject}
				class={inputClass('subject')}
				disabled={isSubmitting}
				aria-invalid={errors['subject'] ? true : undefined}
				aria-describedby={errors['subject'] ? 'contact-subject-error' : undefined}
			/>
			{#if errors['subject']}
				<p id="contact-subject-error" class={errorText('subject')}>{errors['subject']}</p>
			{/if}
		</div>

		<div>
			<label for="contact-message" class={fieldLabel}>{labels['form.message.label']} *</label>
			<textarea
				id="contact-message"
				rows="6"
				placeholder={labels['form.message.placeholder']}
				bind:value={message}
				class={inputClass('message')}
				disabled={isSubmitting}
				aria-invalid={errors['message'] ? true : undefined}
				aria-describedby={errors['message'] ? 'contact-message-error' : undefined}
			></textarea>
			{#if errors['message']}
				<p id="contact-message-error" class={errorText('message')}>{errors['message']}</p>
			{/if}
		</div>

		<button
			type="submit"
			disabled={isSubmitting}
			class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex min-h-9 items-center rounded-md border border-[var(--border-default)] px-4 text-sm font-medium transition-colors"
		>
			{isSubmitting ? labels['form.submitting'] : labels['form.submit']}
		</button>
	</form>
</div>
