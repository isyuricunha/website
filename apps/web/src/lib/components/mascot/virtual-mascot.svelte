<script lang="ts">
import { page } from '$app/state'
import MascotIcon from './mascot-icon.svelte'
import MascotGame from './mascot-game.svelte'
import MascotSettingsPanel from './mascot-settings-panel.svelte'
import MascotContactPanel from './mascot-contact-panel.svelte'
import MascotMenuPanel from './mascot-menu-panel.svelte'
import MascotSpeechBubbles from './mascot-speech-bubbles.svelte'
import MascotSelectionBubble from './mascot-selection-bubble.svelte'
import { MascotStateController } from './mascot-state.svelte'
import AIChatInterface from './ai-chat-interface.svelte'
import { createTranslator } from '#lib/i18n/translator'
import { loadMessages } from '#lib/i18n/catalog'
import { i18n } from '@isyuricunha/i18n/config'

let { hidden = false }: { hidden?: boolean } = $props()

let mascotLocale = $state(i18n.defaultLocale)
let labels = $state<Record<string, unknown> | null>(null)
const mascot = new MascotStateController()

// Configure translations from the server-provided labels after hydration.
$effect(() => {
const data = page.data as { labels?: Record<string, unknown> }
if (data.labels && data.labels.mascot) {
labels = data.labels.mascot as Record<string, unknown>
}
})

$effect(() => {
mascot.syncPathname(page.url.pathname)
})

$effect(() => {
// Build the translator from the raw mascot catalog and wire the controller.
let cancelled = false
void (async () => {
// The server data already scopes labels to the mascot namespace, which
// breaks the translator's dotted lookup; always use the full catalog.
const messages = await loadMessages(mascotLocale)
if (cancelled) return
const fallback = await loadMessages(i18n.defaultLocale)
if (cancelled) return
const translator = createTranslator(mascotLocale, messages as never, fallback as never)
mascot.configure({ translator, locale: mascotLocale, allMessages: { mascot: messages.mascot } })
})()
return () => {
cancelled = true
}
})

$effect(() => {
const cleanup = mascot.initialize()
mascot.startReactiveEffects()
return cleanup
})

const ui = $derived(mascot.state)
const mounted = $derived(mascot.mounted)
const prefersReducedMotion = $derived(mascot.prefersReducedMotion)
</script>

{#if !hidden}
	{#if ui.isHiddenPref || ui.isDismissed}
		<div class={mascot.getPositionClasses() + ' z-50'}>
			<button
				type="button"
				aria-label={mascot.t('mascot.restore')}
				class="text-accent-earth-text shadow-feature-card hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none min-h-[44px] min-w-[44px] rounded-full border border-[var(--accent-border)] bg-[var(--accent-dim)] p-2 transition-colors sm:p-3"
				onclick={() => mascot.restoreMascot()}
			>
				<MascotIcon name="eye" size={20} />
			</button>
		</div>
	{:else}
		<div class={mascot.getPositionClasses() + ' z-50'}>
			<!-- Settings Panel -->
			<div class={mascot.getBubblePositionClasses()}>
				<MascotSettingsPanel {mascot} />
			</div>

			<!-- Contact Panel -->
			<div class={mascot.getBubblePositionClasses()}>
				<MascotContactPanel {mascot} />
			</div>

			<!-- Menu Panel -->
			<div class={mascot.getBubblePositionClasses()}>
				<MascotMenuPanel {mascot} />
			</div>

			<!-- AI Chat Interface -->
			{#if ui.showAIChat}
				<div class={mascot.getBubblePositionClasses()}>
					<AIChatInterface
						{mascot}
						isOpen={ui.showAIChat}
						onClose={() => mascot.handleAIClose()}
						onThinkingChange={(thinking) => mascot.handleThinkingChange(thinking)}
						currentPage={mascot.pageKey}
						pagePath={mascot.pathname || '/'}
					/>
				</div>
			{/if}

			<!-- Speech Bubbles -->
			<div class={mascot.getBubblePositionClasses()}>
				<MascotSpeechBubbles {mascot} />
			</div>

			<!-- Selection Explain Bubble -->
			<div class={mascot.getBubblePositionClasses()}>
				<MascotSelectionBubble {mascot} />
			</div>

			<!-- Mascot button -->
			<button
				type="button"
				aria-label={mascot.t('mascot.ariaLabel')}
				class="focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none relative inline-flex h-12 w-12 items-center justify-center rounded-full border transition-colors sm:h-14 sm:w-14 lg:h-16 lg:w-16 {ui.isActive
					? 'shadow-feature-card border-[var(--accent-border)] bg-[var(--accent-dim)]'
					: 'shadow-feature-card border-[var(--border-default)]'} {ui.preferences.animations
					? 'hover:bg-bg-hover hover:border-[var(--accent-border)]'
					: ''} {ui.isKonamiMode ? 'animate-pulse border-[var(--accent-border)]' : ''} {ui.isTickled ? 'animate-bounce' : ''} {ui.isDizzy ? 'animate-spin' : ''}"
				onclick={() => mascot.handleMascotClick()}
			>
				{#if mounted && ui.currentMascotImage > 0}
					<div
						class="relative h-full w-full rounded-full transition-transform duration-500 ease-out"
						style={!prefersReducedMotion && ui.preferences.animations
							? `transform: translate(${ui.mousePosition.x * 5}px, ${ui.mousePosition.y * 5}px) rotate(${ui.mousePosition.x * 5}deg)`
							: undefined}
					>
						<img
							src="/images/mascote-{ui.currentMascotImage}.png"
							alt=""
							role="presentation"
							width={64}
							height={64}
							loading={ui.isActive ? 'eager' : 'lazy'}
							class="h-full w-full rounded-full object-cover transition-all duration-500 {ui.isBlinking
								? 'animate-pulse'
								: ''} {ui.isKonamiMode ? 'hue-rotate-180 sepia filter' : ''}"
						/>
					</div>
				{:else}
					<div aria-hidden="true" class="bg-bg-surface h-full w-full rounded-full"></div>
				{/if}
			</button>
		</div>

		<!-- Mini Game -->
		<MascotGame {mascot} isOpen={ui.showGame} onClose={() => mascot.updateState({ showGame: false })} />
	{/if}
{/if}
