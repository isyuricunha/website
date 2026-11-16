<script lang="ts">
	import LocaleSwitcher from '#lib/components/locale-switcher.svelte'
	import AdminIcon from './admin-icon.svelte'
	import AdminProfileDropdown from './admin-profile-dropdown.svelte'

	let {
		labels,
		locale,
		onToggleMobileNav
	}: {
		labels: Record<string, string>
		locale: string
		onToggleMobileNav: () => void
	} = $props()

	let signInOpen = $state(false)
</script>

<header class="bg-bg-base sticky top-0 z-40 flex items-center justify-between py-4">
	<div class="flex items-center gap-3">
		<button
			type="button"
			class="hover:bg-bg-hover inline-flex size-9 items-center justify-center rounded-md border border-[var(--border-faint)] transition-colors lg:hidden"
			aria-label="Open navigation"
			onclick={onToggleMobileNav}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4">
				<line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" />
			</svg>
		</button>
		<span class="label-mono hidden sm:inline">{labels['common.admin-label']}</span>
	</div>
	<div class="flex items-center gap-3">
		<LocaleSwitcher />
		<AdminProfileDropdown {labels} bind:signInOpen />
	</div>
</header>

{#if signInOpen}
	<!-- Sign-in prompt handled by the public dialog on the main layout; admin
	     sessions come from the site sign-in flow. -->
{/if}
