<script lang="ts">
	import MessageBox from '#lib/components/guestbook/message-box.svelte'
	import Messages from '#lib/components/guestbook/messages.svelte'
	import SignIn from '#lib/components/guestbook/sign-in.svelte'
	import Toaster from '#lib/components/toaster.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalPath} />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-16">
	<h1 class="mb-3 text-3xl font-bold tracking-tight">{data.labels['title']}</h1>
	<p class="text-muted-foreground mb-10">{data.labels['description']}</p>

	<div class="mx-auto max-w-xl space-y-10">
		<!-- Pinned intro card -->
		<div class="bg-bg-surface relative overflow-hidden rounded-lg border border-[var(--border-subtle)]">
			<div class="absolute top-4 right-4">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-muted-foreground/50 size-5 rotate-45">
					<path d="M12 17v5" />
					<path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z" />
				</svg>
			</div>
			<div class="relative p-6">
				<div class="flex items-start gap-4">
					<div class="hidden size-10 shrink-0 items-center justify-center rounded-md bg-[var(--accent-dim)] sm:flex">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text size-5">
							<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
						</svg>
					</div>
					<div class="space-y-4">
						<h2 class="text-foreground text-xl font-medium">{data.labels['pinned-greeting']}</h2>
						<p class="text-muted-foreground">{data.labels['pinned-description']}</p>
					</div>
				</div>
			</div>
			<div class="h-px w-full bg-[var(--accent-border)]"></div>
		</div>

		{#if data.user}
			<MessageBox labels={data.labels} user={data.user} />
		{:else}
			<SignIn labels={data.labels} />
		{/if}

		<Messages labels={data.labels} locale={data.locale} currentUserId={data.user?.id ?? null} isAdmin={data.isAdmin} />
	</div>
</main>

<Toaster />
