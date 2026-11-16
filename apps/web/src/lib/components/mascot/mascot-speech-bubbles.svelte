<script lang="ts">
	import MascotIcon from './mascot-icon.svelte'
	import { type MascotStateController } from './mascot-state.svelte'

	let { mascot }: { mascot: MascotStateController } = $props()

	const state = $derived(mascot.state)
	const prefersReducedMotion = $derived(mascot.prefersReducedMotion)
</script>

{#if state.preferences.speechBubbles && !state.showContact && !state.showSettings && !state.showMenu && !state.showAIChat}
	<div class="flex w-56 flex-col gap-2 sm:w-60" aria-live="polite" aria-atomic="false">
		{#each state.messageQueue as item, idx (item.id)}
			{@const isExiting = state.exitingIds.has(item.id)}
			<div
				class="bg-bg-elevated text-text-primary shadow-feature-card ring-0 outline-none rounded-lg border border-[var(--border-subtle)] transition-all duration-200 ease-in-out {isExiting
					? 'translate-y-1 scale-95 opacity-0'
					: 'translate-y-0 scale-100 opacity-100'}"
				role="dialog"
				aria-label={mascot.t('mascot.speechBubble')}
				style={prefersReducedMotion ? undefined : 'animation: fadeInUp 300ms ease-out'}
			>
				<div class="bubble-float p-2">
					<div class="flex items-start gap-2">
						<div class="min-w-0 flex-1 text-xs leading-relaxed wrap-break-word whitespace-pre-wrap">
							{item.text}
						</div>
						<div class="shrink-0">
							{#if idx === state.messageQueue.length - 1}
								<button
									type="button"
									aria-label={mascot.t('mascot.menu.open')}
									class="text-text-secondary hover:bg-bg-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none rounded px-2 py-1 text-xs transition-colors"
									onclick={() => mascot.updateState({ showMenu: !state.showMenu })}
								>
									<MascotIcon name="menu" size={12} />
								</button>
							{/if}
							{#if idx === state.messageQueue.length - 1}
								<button
									type="button"
									aria-label={mascot.t('mascot.hideForNow')}
									title={mascot.t('mascot.hideForNow')}
									class="text-text-secondary hover:bg-bg-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none rounded px-2 py-1 text-xs transition-colors"
									onclick={() => mascot.handleDismissMascot()}
								>
									<MascotIcon name="eye_off" size={12} />
								</button>
							{/if}
							<button
								type="button"
								aria-label={mascot.t('mascot.close')}
								class="text-text-secondary hover:bg-bg-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none rounded p-1 transition-colors"
								onclick={() => mascot.startExit(item.id)}
							>
								<MascotIcon name="x" size={16} />
							</button>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
