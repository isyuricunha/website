<script lang="ts">
	import { z } from 'zod'
	import { trpc } from '#lib/trpc-client.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'

	let {
		user,
		open = $bindable(false),
		labels
	}: {
		user: AdminUser | null
		open?: boolean
		labels: Record<string, string>
	} = $props()

	type AdminUser = {
		id: string
		name: string | null
		username: string | null
		email: string
		role: string
		image: string | null
	}

	let formData = $state({
		name: '',
		username: '',
		email: '',
		role: 'user',
		image: ''
	})
	let errors = $state<Record<string, string>>({})
	let isPending = $state(false)

	function handleInputChange(field: string, value: string) {
		formData = { ...formData, [field]: value }
		if (Object.hasOwn(errors, field)) errors = { ...errors, [field]: '' }
	}

	function submit(event: SubmitEvent) {
		event.preventDefault()
		try {
			const userSchema = z.object({
				name: z.string().min(1, labels['validation.name-required']),
				username: z.string().optional(),
				email: z.string().email(labels['validation.invalid-email']),
				role: z.enum(['user', 'admin']),
				image: z
					.string()
					.url(labels['validation.invalid-url'])
					.optional()
					.or(z.literal(''))
			})
			const validatedData = userSchema.parse(formData)
			errors = {}
			if (user) {
				isPending = true
				trpc.users.updateUser
					.mutate({ userId: user.id, ...validatedData })
					.then(() => {
						toastSuccess(labels['update-success'])
						open = false
					})
					.catch(() => toastError(labels['update-error']))
					.finally(() => (isPending = false))
			}
		} catch (error) {
			if (error instanceof z.ZodError) {
				const newErrors: Record<string, string> = {}
				for (const issue of error.issues) {
					if (issue.path[0]) newErrors[issue.path[0] as string] = issue.message
				}
				errors = newErrors
			}
		}
	}

	// Re-sync the form whenever a different user opens the dialog.
	$effect(() => {
		if (user) {
			formData = {
				name: user.name || '',
				username: user.username || '',
				email: user.email || '',
				role: user.role || 'user',
				image: user.image || ''
			}
			errors = {}
		}
	})

	function inputClass(field: string) {
		return `bg-bg-hover w-full rounded-md border px-3 py-2 text-sm {errors[field] ? 'border-destructive' : 'border-[var(--border-faint)]'}`
	}
</script>

{#if open && user}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
		<div class="bg-bg-base w-full max-w-[425px] rounded-lg border border-[var(--border-subtle)] p-6">
			<h3 class="text-lg font-semibold">{labels.title}</h3>
			<p class="text-muted-foreground text-sm">{user.name} - {user.email}</p>

			<form onsubmit={submit} class="mt-4 space-y-4">
				<div class="space-y-2">
					<label for="edit-user-name" class="text-sm font-medium">{labels.name}</label>
					<input id="edit-user-name" value={formData.name} oninput={(e) => handleInputChange('name', e.currentTarget.value)} class={inputClass('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
					{#if errors.name}
						<p id="name-error" class="text-destructive text-sm">{errors.name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="edit-user-username" class="text-sm font-medium">{labels.username}</label>
					<input id="edit-user-username" value={formData.username} oninput={(e) => handleInputChange('username', e.currentTarget.value)} class={inputClass('username')} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'username-error' : undefined} />
					{#if errors.username}
						<p id="username-error" class="text-destructive text-sm">{errors.username}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="edit-user-email" class="text-sm font-medium">{labels.email}</label>
					<input id="edit-user-email" type="email" value={formData.email} oninput={(e) => handleInputChange('email', e.currentTarget.value)} class={inputClass('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
					{#if errors.email}
						<p id="email-error" class="text-destructive text-sm">{errors.email}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="edit-user-role" class="text-sm font-medium">{labels.role}</label>
					<select id="edit-user-role" bind:value={formData.role} class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
						<option value="user">{labels['roles.user']}</option>
						<option value="admin">{labels['roles.admin']}</option>
					</select>
				</div>

				<div class="space-y-2">
					<label for="edit-user-image" class="text-sm font-medium">{labels.image}</label>
					<input id="edit-user-image" type="url" value={formData.image} oninput={(e) => handleInputChange('image', e.currentTarget.value)} class={inputClass('image')} aria-invalid={Boolean(errors.image)} aria-describedby={errors.image ? 'image-error' : undefined} />
					{#if errors.image}
						<p id="image-error" class="text-destructive text-sm">{errors.image}</p>
					{/if}
				</div>

				<div class="flex justify-end gap-2">
					<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors" onclick={() => (open = false)}>
						{labels.cancel}
					</button>
					<button type="submit" class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={isPending}>
						{isPending ? labels.saving : labels.save}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
