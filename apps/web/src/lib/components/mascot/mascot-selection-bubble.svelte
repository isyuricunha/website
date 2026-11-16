<script lang="ts">
	import MascotIcon from './mascot-icon.svelte'
	import { type MascotStateController } from './mascot-state.svelte'

	let { mascot }: { mascot: MascotStateController } = $props()

	const state = $derived(mascot.state)
</script>

{#if state.showSelectionBubble && !state.showAIChat}
	<div class="animate-in fade-in slide-in-from-bottom-2 z-50 duration-300">
		<div class="text-text-primary shadow-feature-card flex items-center gap-2 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-dim)] px-3 py-2 text-xs">
			<MascotIcon name="sparkles" size={12} class="animate-pulse" />
			<span class="font-medium">{mascot.t('mascot.interactions.selectionExplain')}</span>
			<button
				type="button"
				onclick={() => mascot.explainSelection()}
				class="bg-bg-hover hover:bg-bg-active rounded-md px-2 py-1 font-medium transition-colors"
			>
				{mascot.t('mascot.interactions.explainButton')}
			</button>
			<button
				type="button"
				onclick={() => mascot.updateState({ showSelectionBubble: false })}
				class="hover:bg-bg-hover rounded p-1"
			>
				<MascotIcon name="x" size={12} />
			</button>
		</div>
	</div>
{/if}
