<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<main class="flex min-h-svh items-center justify-center p-8">
	<div class="w-full max-w-2xl">
		<!-- Static preview of the requested demo; the full docs app renders
		     interactively. -->
		{@html data.html}
	</div>
</main>
