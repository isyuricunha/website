<script lang="ts">
	import MascotIcon from './mascot-icon.svelte'
	import { type MascotStateController } from './mascot-state.svelte'

	let { mascot }: { mascot: MascotStateController } = $props()

	const state = $derived(mascot.state)
</script>

{#if state.showContact}
	<div class="bg-bg-elevated text-text-primary shadow-feature-card w-60 rounded-lg border border-[var(--border-subtle)] p-3 text-xs sm:w-64 sm:p-4">
		<div class="mb-3 flex items-center justify-between">
			<h3 class="font-medium">{mascot.t('mascot.contact.title')}</h3>
			<button
				type="button"
				aria-label={mascot.t('mascot.contact.close')}
				class="text-text-secondary hover:bg-bg-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none rounded-md p-1.5 transition-colors"
				onclick={() => mascot.updateState({ showContact: false })}
			>
				<MascotIcon name="x" size={16} />
			</button>
		</div>

		<div class="space-y-3">
			<p class="text-sm">{mascot.t('mascot.contact.description')}</p>
			<div class="flex items-center gap-2">
				<code class="bg-bg-surface flex-1 rounded px-2 py-1 text-xs">me@yuricunha.com</code>
				<button
					type="button"
					aria-label={mascot.t('mascot.contact.copy')}
					class="text-text-secondary hover:bg-bg-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none rounded-md p-1.5 transition-colors"
					onclick={() => void mascot.copyEmail()}
				>
					<MascotIcon name="copy" size={16} />
				</button>
			</div>
		</div>
	</div>
{/if}
