<script lang="ts">
	import '../app.css'
	import { type Snippet } from 'svelte'
	import Footer from '#lib/components/footer.svelte'
	import Header from '#lib/components/header.svelte'
	import type { LayoutData } from './$types'

// Same registration intent as the Next app. By the time the client bundle
// hydrates, the window load event has often already fired, so register
// immediately in that case instead of listening for an event that never comes.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
	const register = function () {
		navigator.serviceWorker.register('/sw.js').catch(function (registrationError) {
			void registrationError
		})
	}
	if (document.readyState === 'complete') {
		register()
	} else {
		window.addEventListener('load', register)
	}
}

	let { data, children }: { data: LayoutData; children: Snippet } = $props()

	// Delegated copy handler for build-rendered code blocks: one listener for
	// the whole document instead of per-block hydration.
	function handleDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement
		const button = target.closest<HTMLButtonElement>('button[data-mdx-copy]')

		if (!button) {
			return
		}

		const figure = button.closest('figure')
		const pre = figure?.querySelector('pre')

		if (!pre) {
			return
		}

		void navigator.clipboard
			.writeText(pre.textContent ?? '')
			.then(() => {
				button.dataset.copied = 'true'
				window.setTimeout(() => {
					delete button.dataset.copied
				}, 2000)
			})
			.catch(() => {})
	}
</script>

<svelte:document onclick={handleDocumentClick} />

<Header labels={data.labels} />

<main id="skip-nav" class="mx-auto w-full max-w-6xl flex-1 px-4 pt-28 pb-20 sm:px-8">
	{@render children()}
</main>

<Footer labels={data.labels} />

