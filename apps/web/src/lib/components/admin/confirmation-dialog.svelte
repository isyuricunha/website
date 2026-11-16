<script lang="ts">
	let {
		open = $bindable(false),
		title,
		description,
		confirmText,
		cancelText,
		variant = 'default',
		onConfirm,
		loading = false,
		labels
	}: {
		open?: boolean
		title: string
		description: string
		confirmText?: string
		cancelText?: string
		variant?: 'default' | 'destructive'
		onConfirm?: () => void
		loading?: boolean
		labels: Record<string, string>
	} = $props()

	let isConfirmDisabled = $derived(loading || !onConfirm)
	let resolvedConfirmText = $derived(confirmText ?? labels['common.confirm'])
	let resolvedCancelText = $derived(cancelText ?? labels['common.cancel'])
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="alertdialog" aria-modal="true">
		<div class="bg-bg-base w-full max-w-md rounded-lg border border-[var(--border-subtle)] p-6">
			<div class="mb-1 flex items-center gap-2">
				{#if variant === 'destructive'}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-destructive h-5 w-5">
						<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" />
					</svg>
				{/if}
				<h3 class="text-lg font-semibold">{title}</h3>
			</div>
			<p class="text-muted-foreground text-sm">{description}</p>
			<div class="mt-6 flex justify-end gap-2">
				<button
					type="button"
					class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors"
					disabled={loading}
					onclick={() => (open = false)}
				>
					{resolvedCancelText}
				</button>
				<button
					type="button"
					class="rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 {variant === 'destructive'
						? 'bg-red-600 hover:bg-red-700'
						: 'bg-accent-earth hover:bg-accent-earth-hover'}"
					disabled={isConfirmDisabled}
					onclick={() => onConfirm?.()}
				>
					{loading ? labels['common.processing'] : resolvedConfirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
