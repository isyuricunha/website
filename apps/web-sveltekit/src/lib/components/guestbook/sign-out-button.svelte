<script lang="ts">
	import { signOut } from '#lib/auth-client.ts'

	type Props = {
		labels: Record<string, string>
	}

	let { labels }: Props = $props()

	async function signOutAndReload() {
		await signOut()
		window.location.reload()
	}
</script>

<div class="flex items-center">
	<button
		type="button"
		class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-block rounded-md border border-[var(--border-default)] px-4 py-2 text-sm font-medium transition-colors"
		onclick={() => void signOutAndReload()}
	>
		{labels['sign-out'] ?? 'Sign out'}
	</button>
</div>
