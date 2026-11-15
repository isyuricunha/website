<script lang="ts">
	import { authClient } from '#lib/auth-client.ts'
	import { toastError, toastSuccess } from '#lib/toasts.svelte.ts'

	let { email, canDelete, labels }: { email: string; canDelete: boolean; labels: Record<string, string> } = $props()

	let confirmation = $state('')
	let isDeletionDialogOpen = $state(false)
	let isRequestingDeletion = $state(false)
	let deletionRequested = $state(false)

	async function requestDeletion() {
		if (confirmation !== email || isRequestingDeletion) return

		isRequestingDeletion = true
		const { error } = await authClient.deleteUser({ callbackURL: '/' })
		isRequestingDeletion = false

		if (error) {
			toastError(labels['delete-error'])
			return
		}

		deletionRequested = true
		confirmation = ''
		isDeletionDialogOpen = false
		toastSuccess(labels['delete-sent'])
	}

	function closeDialog() {
		isDeletionDialogOpen = false
		confirmation = ''
	}
</script>

<section class="space-y-6 border-t pt-8" aria-labelledby="privacy-data-heading">
	<div class="space-y-1">
		<div class="flex items-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-5">
				<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.75 17 5 19 5a1 1 0 0 1 1 1z" />
				<path d="m9 12 2 2 4-4" />
			</svg>
			<h2 id="privacy-data-heading" class="text-lg font-semibold">{labels.title}</h2>
		</div>
		<p class="text-muted-foreground text-sm">{labels.description}</p>
	</div>

	<div class="space-y-3 rounded-lg border border-[var(--border-faint)] p-4">
		<div class="space-y-1">
			<h3 class="font-medium">{labels['export-title']}</h3>
			<p class="text-muted-foreground text-sm">{labels['export-description']}</p>
		</div>
		<a
			href="/api/account/data-export"
			download
			class="hover:bg-bg-hover inline-flex items-center gap-2 rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm font-medium transition-colors"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
			</svg>
			{labels.download}
		</a>
	</div>

	<div class="space-y-4 rounded-lg border border-[var(--border-faint)] p-4">
		<div class="space-y-1">
			<h3 class="font-medium">{labels['delete-title']}</h3>
			<p class="text-muted-foreground text-sm">{labels['delete-description']}</p>
		</div>

		{#if canDelete}
			<button
				type="button"
				class="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
				disabled={deletionRequested}
				onclick={() => (isDeletionDialogOpen = true)}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
					<path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
				</svg>
				{labels['delete-trigger']}
			</button>
			<p class="text-muted-foreground text-sm">{labels['delete-export-reminder']}</p>
			{#if deletionRequested}
				<p class="text-muted-foreground text-sm" role="status">{labels['delete-sent']}</p>
			{/if}
		{:else}
			<p class="text-muted-foreground text-sm">{labels['delete-unavailable']}</p>
		{/if}
	</div>
</section>

{#if isDeletionDialogOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-dialog-title"
	>
		<div class="bg-bg-base w-full max-w-md rounded-lg border border-[var(--border-subtle)] p-6">
			<h3 id="delete-dialog-title" class="text-lg font-semibold">{labels['delete-dialog-title']}</h3>
			<p class="text-muted-foreground mt-1 text-sm">{labels['delete-dialog-description']}</p>
			<div class="mt-4 space-y-2">
				<label for="account-deletion-confirmation" class="text-sm font-medium">
					{labels['confirm-label']}
				</label>
				<input
					id="account-deletion-confirmation"
					type="email"
					bind:value={confirmation}
					autocomplete="off"
					spellcheck="false"
					disabled={isRequestingDeletion}
					class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
				/>
			</div>
			<div class="mt-6 flex justify-end gap-2">
				<button
					type="button"
					class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors"
					disabled={isRequestingDeletion}
					onclick={closeDialog}
				>
					{labels.cancel}
				</button>
				<button
					type="button"
					class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
					disabled={confirmation !== email || isRequestingDeletion}
					onclick={requestDeletion}
				>
					{isRequestingDeletion ? labels['delete-pending'] : labels['delete-action']}
				</button>
			</div>
		</div>
	</div>
{/if}
