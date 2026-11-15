<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<main>
	<h1>yuricunha.com</h1>
	<p>SvelteKit migration scaffold. Translated title below comes from the i18n catalogs.</p>
	<p data-testid="translated-title">{data.title}</p>
</main>
