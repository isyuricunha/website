<script lang="ts">
	import '../app.css'
	import type { LayoutData } from './$types'

	let { data, children } = $props()
</script>

{@render children()}
