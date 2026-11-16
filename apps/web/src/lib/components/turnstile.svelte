<script lang="ts">
	import { onMount } from 'svelte'

	// Native Cloudflare Turnstile embed: no React wrapper. Loads the official
	// script once and renders the widget into the target div.
	let {
		siteKey,
		onSuccess,
		onError,
		onExpire
	}: {
		siteKey: string
		onSuccess: (token: string) => void
		onError: () => void
		onExpire: () => void
	} = $props()

	let widgetId: string | null = null
	let target = $state<HTMLDivElement | undefined>()

	function scriptUrl(): string {
		return 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
	}

	function ensureScript(done: () => void) {
		if (window.turnstile) {
			done()
			return
		}
		const existing = document.querySelector<HTMLScriptElement>('script[data-ella-turnstile]')
		const boot = () => done()
		if (existing) {
			existing.addEventListener('load', boot)
			return
		}
		const script = document.createElement('script')
		script.src = scriptUrl()
		script.dataset.ellaTurnstile = 'true'
		script.async = true
		script.addEventListener('load', boot)
		document.head.append(script)
	}

	function render() {
		if (!target || !window.turnstile || widgetId !== null) return
		widgetId = window.turnstile.render(target, {
			sitekey: siteKey,
			theme: 'auto',
			size: 'invisible',
			callback: (token: string) => onSuccess(token),
			'error-callback': () => {
				onError()
				reset()
			},
			'expired-callback': () => {
				onExpire()
				reset()
			}
		})
	}

	function reset() {
		if (widgetId !== null) window.turnstile?.reset(widgetId)
	}

	export function resetWidget() {
		reset()
	}

	onMount(() => {
		ensureScript(render)
		return () => {
			if (widgetId !== null) {
				window.turnstile?.remove(widgetId)
				widgetId = null
			}
		}
	})
</script>

<div bind:this={target}></div>
