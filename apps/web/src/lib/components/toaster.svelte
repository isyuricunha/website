<script lang="ts">
	import { toasts } from '#lib/toasts.svelte.ts'

	const kindClass: Record<string, string> = {
		success: 'border-[var(--success-border)] bg-status-success-soft',
		error: 'border-[var(--status-danger-border)] bg-status-danger-soft',
		info: 'border-[var(--status-info-border)] bg-status-info-soft'
	}
</script>

{#if toasts.items.length > 0}
	<div class="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
		{#each toasts.items as item (item.id)}
			<div
				role="status"
				class={`border rounded-lg px-4 py-3 text-sm shadow-lg ${kindClass[item.kind] ?? kindClass.info}`}
			>
				{item.message}
			</div>
		{/each}
	</div>
{/if}
