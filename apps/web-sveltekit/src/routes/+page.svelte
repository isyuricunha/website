<script lang="ts">
	let { data } = $props()
</script>

<main>
	<h1>yuricunha.com</h1>
	<p>SvelteKit migration scaffold. Parity work in progress.</p>
	<pre>{JSON.stringify(data ?? {}, null, 2)}</pre>
</main>
