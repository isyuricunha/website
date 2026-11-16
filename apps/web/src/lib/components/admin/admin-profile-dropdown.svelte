<script lang="ts">
	import { signOut, useSession } from '#lib/auth-client.ts'
	import { getDefaultImage } from '@isyuricunha/trpc-server/utils/get-default-image'

	let {
		labels,
		signInOpen = $bindable(false)
	}: {
		labels: Record<string, string>
		signInOpen?: boolean
	} = $props()

	const session = useSession()

	let open = $state(false)
	let root = $state<HTMLElement | undefined>()

	function onWindowClick(event: MouseEvent) {
		if (open && root && !root.contains(event.target as Node)) open = false
	}
</script>

<svelte:window onclick={onWindowClick} />

{#if $session.isPending}
	<div class="yu-skeleton size-9 rounded-full"></div>
{:else if !$session.data}
	<button
		type="button"
		class="bg-accent-earth text-text-inverse rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
		onclick={() => (signInOpen = true)}
	>
		{labels['sign-in']}
	</button>
{:else if $session.data}
	{@const user = $session.data.user}
	<div bind:this={root} class="relative">
		<button
			type="button"
			class="bg-bg-hover size-9 overflow-hidden rounded-full transition-opacity hover:opacity-80"
			onclick={() => (open = !open)}
			aria-expanded={open}
		>
			<img
				src={user.image ?? getDefaultImage(user.id)}
				alt={user.name ?? ''}
				class="size-9 object-cover"
			/>
		</button>

		{#if open}
			<div class="bg-bg-popover absolute right-0 z-50 mt-1 w-56 rounded-md border border-[var(--border-faint)] p-1 shadow-lg">
				<div class="flex flex-col gap-1 px-2 py-1.5">
					<p class="text-sm">{user.name}</p>
					<p class="text-text-secondary text-xs">{user.email}</p>
				</div>
				<div class="bg-border my-1 h-px"></div>
				<button
					type="button"
					class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
					onclick={() => signOut()}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4">
						<path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
					</svg>
					{labels['sign-out']}
				</button>
			</div>
		{/if}
	</div>
{/if}
