<script lang="ts">
	import '../app.css'
	import { type Snippet } from 'svelte'
	import Footer from '#lib/components/footer.svelte'
	import Header from '#lib/components/header.svelte'
	import type { LayoutData } from './$types'

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

