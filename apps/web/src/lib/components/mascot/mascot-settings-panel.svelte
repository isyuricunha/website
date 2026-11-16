<script lang="ts">
	import MascotIcon from './mascot-icon.svelte'
	import { type MascotStateController, type MascotPreferences } from './mascot-state.svelte'

	let { mascot }: { mascot: MascotStateController } = $props()

	const state = $derived(mascot.state)

	const durations = ['3000', '5000', '7000', '10000']
	const positions = [
		{ value: 'bottom-right', label: 'mascot.settings.positions.bottomRight' },
		{ value: 'bottom-left', label: 'mascot.settings.positions.bottomLeft' },
		{ value: 'top-right', label: 'mascot.settings.positions.topRight' },
		{ value: 'top-left', label: 'mascot.settings.positions.topLeft' }
	] as const

	function handlePositionChange(event: Event): void {
		const value = (event.currentTarget as HTMLSelectElement).value as MascotPreferences['bubblePosition']
		mascot.updatePreferences({ bubblePosition: value })
	}
</script>

{#if state.showSettings}
	<div class="bg-bg-elevated text-text-primary shadow-feature-card w-60 rounded-lg border border-[var(--border-subtle)] p-3 text-xs sm:w-64 sm:p-4">
		<div class="mb-3 flex items-center justify-between">
			<h3 class="font-medium">{mascot.t('mascot.settings.title')}</h3>
			<button
				type="button"
				aria-label={mascot.t('mascot.settings.close')}
				class="text-text-secondary hover:bg-bg-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none rounded-md p-1.5 transition-colors"
				onclick={() => mascot.updateState({ showSettings: false })}
			>
				<MascotIcon name="x" size={16} />
			</button>
		</div>

		<div class="space-y-3">
			<label class="flex items-center justify-between">
				<span>{mascot.t('mascot.settings.animations')}</span>
				<input
					type="checkbox"
					checked={state.preferences.animations}
					onchange={(e) => mascot.updatePreferences({ animations: e.currentTarget.checked })}
					class="bg-bg-base text-text-primary rounded border-[var(--border-default)] accent-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2"
				/>
			</label>

			<label class="flex items-center justify-between">
				<span>{mascot.t('mascot.settings.speechBubbles')}</span>
				<input
					type="checkbox"
					checked={state.preferences.speechBubbles}
					onchange={(e) => mascot.updatePreferences({ speechBubbles: e.currentTarget.checked })}
					class="bg-bg-base text-text-primary rounded border-[var(--border-default)] accent-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2"
				/>
			</label>

			<label class="flex items-center justify-between">
				<span>{mascot.t('mascot.settings.soundEffects')}</span>
				<input
					type="checkbox"
					checked={state.preferences.soundEffects}
					onchange={(e) => mascot.updatePreferences({ soundEffects: e.currentTarget.checked })}
					class="bg-bg-base text-text-primary rounded border-[var(--border-default)] accent-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2"
				/>
			</label>

			<label class="flex items-center justify-between">
				<span>{mascot.t('mascot.settings.messageDuration')}</span>
				<select
					value={String(state.preferences.messageDuration)}
					onchange={(e) => mascot.updatePreferences({ messageDuration: Number(e.currentTarget.value) })}
					aria-label={mascot.t('mascot.settings.messageDuration')}
					class="bg-bg-surface text-text-primary focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2 cursor-pointer rounded-md border border-[var(--border-default)] px-3 py-2.5 text-xs transition-colors hover:border-[var(--border-strong)] focus:outline-none"
				>
					{#each durations as duration (duration)}
						<option value={duration}>{Number(duration) / 1000}s</option>
					{/each}
				</select>
			</label>

			<label class="flex items-center justify-between">
				<span>{mascot.t('mascot.settings.bubblePosition')}</span>
				<select
					value={state.preferences.bubblePosition}
					onchange={handlePositionChange}
					aria-label={mascot.t('mascot.settings.bubblePosition')}
					class="bg-bg-surface text-text-primary focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-border)] focus:ring-offset-2 cursor-pointer rounded-md border border-[var(--border-default)] px-3 py-2.5 text-xs transition-colors hover:border-[var(--border-strong)] focus:outline-none"
				>
					{#each positions as position (position.value)}
						<option value={position.value}>{mascot.t(position.label)}</option>
					{/each}
				</select>
			</label>

			{#if state.isKonamiMode}
				<div class="border-t pt-2">
					<p class="text-muted-foreground text-xs">{mascot.t('mascot.easterEgg.retroMode')}</p>
				</div>
			{/if}

			<div class="border-t border-[var(--border-subtle)] pt-2">
				<button
					type="button"
					class="text-text-secondary hover:bg-bg-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors"
					onclick={() => mascot.handleHideMascot()}
				>
					<MascotIcon name="eye_off" size={16} class="shrink-0" />
					<span>{mascot.t('mascot.settings.hideUntilRestored')}</span>
				</button>
			</div>
		</div>
	</div>
{/if}
