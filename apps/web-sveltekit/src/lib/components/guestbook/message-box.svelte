<script lang="ts">
	import { z } from 'zod'
	import { trpc } from '#lib/trpc-client.ts'
	import { toastError, toastSuccess } from '#lib/toasts.svelte.ts'

	type Props = {
		labels: Record<string, string>
		user: { id: string; name: string | null; image: string | null }
	}

	let { labels, user }: Props = $props()

	let message = $state('')
	let pending = $state(false)
	let errorText = $state('')

	async function submit(event: SubmitEvent) {
		event.preventDefault()

		const schema = z
			.object({
				message: z.string().min(1, { message: labels['message-cannot-be-empty'] }).max(1000)
			})

		const parsed = schema.safeParse({ message })

		if (!parsed.success) {
			errorText = parsed.error.issues[0]?.message ?? labels['message-cannot-be-empty']
			return
		}

		errorText = ''
		pending = true

		try {
			await trpc.guestbook.create.mutate({ message: parsed.data.message })
			message = ''
			toastSuccess(labels['create-message-successfully'])
			window.dispatchEvent(new CustomEvent('guestbook:updated'))
		} catch (error) {
			toastError(error instanceof Error ? error.message : String(error))
		} finally {
			pending = false
		}
	}
</script>

<div class="flex gap-3">
	<img
		src={user.image ?? ''}
		alt={user.name ?? ''}
		width="40"
		height="40"
		class="size-10 rounded-full border border-[var(--border-subtle)] object-cover"
	/>

	<form class="w-full" onsubmit={submit}>
		<label class="sr-only" for="guestbook-message">{labels['message-label']}</label>
		<textarea
			id="guestbook-message"
			bind:value={message}
			placeholder={labels['placeholder']}
			rows="3"
			class="bg-bg-surface w-full rounded-md border border-[var(--border-default)] p-3 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
		></textarea>
		{#if errorText}
			<p class="text-status-danger mt-2 text-sm">{errorText}</p>
		{/if}

		<div class="mt-4 flex justify-end gap-2">
			<button
				type="submit"
				disabled={pending}
				aria-disabled={pending}
				class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex min-h-9 items-center rounded-md border border-[var(--border-default)] px-4 text-sm font-medium transition-colors"
			>
				{labels['submit']}
			</button>
		</div>
	</form>
</div>
