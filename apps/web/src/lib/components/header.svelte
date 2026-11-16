<script lang="ts">
	import LocaleSwitcher from './locale-switcher.svelte'
	import Logo from './logo.svelte'
	import MobileNav from './mobile-nav.svelte'
	import Navbar from './navbar.svelte'
	import SiteSearch from './site-search.svelte'
	import CommandMenu from './command-menu.svelte'
	import NotificationsDropdown from './notifications-dropdown.svelte'
	import AccountDropdown from './account-dropdown.svelte'

	import { authClient } from '#lib/auth-client.ts'
	import { goto } from '$app/navigation'

	type Props = {
		labels: Record<string, string>
		locale: string
	}

	let { labels, locale }: Props = $props()

	const session = authClient.useSession()
	const isAdmin = $derived(!$session.isPending && $session.data?.user?.role === 'admin')
</script>

<header class="bg-bg-base fixed inset-x-0 top-0 z-40 border-b border-[var(--border-faint)]">
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
		<a
			href="#skip-nav"
			class="bg-bg-elevated focus-visible:ring-ring fixed top-4 left-4 -translate-y-20 rounded-sm border border-[var(--border-default)] p-2 text-sm font-medium transition-transform focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-offset-2"
		>
			{labels['skip-to-main-content'] ?? 'Skip to main content'}
		</a>
		<a
			href="/"
			class="focus-visible:ring-ring flex items-center justify-center gap-1 rounded-lg p-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
			aria-label={labels['home'] ?? 'Home'}
		>
			<Logo class="h-6 w-6 sm:h-7 sm:w-7" />
		</a>
		<div class="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
			<div class="hidden w-64 shrink-0 md:block">
				<SiteSearch locale={locale} />
			</div>
			<Navbar labels={labels} />
			{#if isAdmin}
				<button
					type="button"
					aria-label={labels['admin'] ?? 'Admin'}
					title={labels['admin'] ?? 'Admin'}
					class="text-foreground hover:bg-bg-hover inline-flex size-9 items-center justify-center rounded-lg p-0 transition-colors"
					onclick={() => goto('/admin')}
				>
					<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 12h10"></path><path d="M12 7v10"></path></svg>
				</button>
			{/if}
			<NotificationsDropdown locale={locale} />
			<LocaleSwitcher />
			<AccountDropdown locale={locale} />
			<CommandMenu locale={locale} />
			<MobileNav labels={labels} />
		</div>
	</div>
</header>
