<script lang="ts">
	import type { Snippet } from 'svelte'
	import AdminBreadcrumb from '#lib/components/admin/admin-breadcrumb.svelte'
	import AdminHeader from '#lib/components/admin/admin-header.svelte'
	import AdminSidebar from '#lib/components/admin/admin-sidebar.svelte'
	import AdminSidebarMobile from '#lib/components/admin/admin-sidebar-mobile.svelte'
	import type { LayoutData } from './$types'

	let { data, children }: { data: LayoutData; children: Snippet } = $props()

	let mobileOpen = $state(false)
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="bg-bg-base text-text-primary flex min-h-svh">
	<AdminSidebar labels={data.labels} locale={data.locale} />
	<AdminSidebarMobile labels={data.labels} locale={data.locale} bind:mobileOpen onClose={() => (mobileOpen = false)} />

	<div class="flex min-h-svh w-full min-w-0 flex-1 flex-col overflow-x-hidden px-4 sm:px-6 lg:px-8">
		<AdminHeader labels={data.labels} locale={data.locale} onToggleMobileNav={() => (mobileOpen = !mobileOpen)} />
		<main class="mx-auto w-full max-w-7xl border-t-[0.5px] border-[var(--border-faint)] py-8">
			<AdminBreadcrumb labels={data.labels} locale={data.locale} />
			{@render children()}
		</main>
	</div>
</div>
