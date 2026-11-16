<script lang="ts">
	import SimpleIcon from '../simple-icon.svelte'
	import MascotIcon from './mascot-icon.svelte'
	import { type MascotStateController } from './mascot-state.svelte'

	let { mascot }: { mascot: MascotStateController } = $props()

	const state = $derived(mascot.state)

	const items = $derived([
		{ action: 'contact', icon: 'bug', label: mascot.t('mascot.menu.reportBug') },
		{ action: 'projects', icon: 'github', label: mascot.t('mascot.menu.viewProjects') },
		{ action: 'chat', icon: 'message_circle', label: mascot.t('mascot.menu.aiChat') },
		{ action: 'game', icon: 'gamepad_2', label: mascot.t('mascot.menu.miniGame') },
		{ action: 'settings', icon: 'settings', label: mascot.t('mascot.menu.settings') }
	])
</script>

{#if state.showMenu}
	<div class="bg-bg-elevated text-text-primary shadow-feature-card w-36 rounded-lg border border-[var(--border-subtle)] p-3 text-xs sm:w-40">
		<div class="space-y-1">
			{#each items as item (item.action)}
				<button
					type="button"
					class="hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left transition-colors"
					onclick={() => mascot.handleMenuAction(item.action)}
				>
					{#if item.icon === 'github'}
						<SimpleIcon icon="siGithub" size={16} />
					{:else}
						<MascotIcon name={item.icon} size={16} />
					{/if}
					{item.label}
				</button>
			{/each}
		</div>
	</div>
{/if}
