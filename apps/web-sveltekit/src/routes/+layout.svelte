<script lang="ts">
	import '../app.css'
import { type Snippet } from 'svelte'
	import Footer from '#lib/components/footer.svelte'
	import Header from '#lib/components/header.svelte'
	import type { LayoutData } from './$types'

	let { data, children }: { data: LayoutData; children: Snippet } = $props()
</script>

<Header labels={data.labels} />

<main id="skip-nav" class="mx-auto w-full max-w-6xl flex-1 px-4 pt-28 pb-20 sm:px-8">
	{@render children()}
</main>

<Footer labels={data.labels} />
