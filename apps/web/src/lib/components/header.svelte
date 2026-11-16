<script lang="ts">
	import LocaleSwitcher from './locale-switcher.svelte'
	import Logo from './logo.svelte'
	import MobileNav from './mobile-nav.svelte'
	import Navbar from './navbar.svelte'
	import SiteSearch from './site-search.svelte'

	type Props = {
		labels: Record<string, string>
		locale: string
	}

	let { labels, locale }: Props = $props()
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
			<LocaleSwitcher />
			<MobileNav labels={labels} />
		</div>
	</div>
</header>
