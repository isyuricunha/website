<script lang="ts">
	import { authClient, signOut } from '#lib/auth-client.ts'
	import { dialogs, openSignIn } from '#lib/dialogs.svelte.ts'
	import { getAvatarAbbreviation } from '@isyuricunha/trpc-server/utils/get-avatar-abbreviation'
	import { getDefaultImage } from '@isyuricunha/trpc-server/utils/get-default-image'
	import UserName from '#lib/components/user/user-name.svelte'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import { i18n } from '@isyuricunha/i18n/config'
	import { goto } from '$app/navigation'

	let { locale }: { locale: string } = $props()

	let panel: HTMLDivElement | undefined = $state()
	let trigger: HTMLButtonElement | undefined = $state()
	let open = $state(false)

	const session = authClient.useSession()

	let t = $state<(key: string, variables?: Record<string, string | number>) => string>(
		(key) => key
	)

	$effect(() => {
		let cancelled = false
		void (async () => {
			const [messages, fallback] = await Promise.all([
				loadMessages(locale),
				loadMessages(i18n.defaultLocale)
			])
			if (cancelled) return
			t = createTranslator(locale, messages as never, fallback as never)
		})()
		return () => {
			cancelled = true
		}
	})

	const user = $derived($session.data?.user ?? null)

	function handleTriggerClick() {
		open = !open
	}

	function onWindowClick(event: MouseEvent) {
		if (!open) return
		const target = event.target as HTMLElement
		if (panel?.contains(target) || trigger?.contains(target)) return
		open = false
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') open = false
	}

	function navigate(href: string) {
		open = false
		void goto(href)
	}

	async function handleSignOut() {
		open = false
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.reload()
				}
			}
		})
	}
</script>

<svelte:document onclick={onWindowClick} onkeydown={onWindowKeydown} />

{#if !$session.isPending && !user}
	<button
		type="button"
		aria-label={t('common.sign-in')}
		class="text-foreground hover:bg-bg-hover inline-flex size-9 items-center justify-center rounded-lg p-0 transition-colors"
		onclick={() => openSignIn()}
	>
		<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
	</button>
{:else if user}
	<div class="relative">
		<button
			bind:this={trigger}
			type="button"
			aria-label={user.name ?? user.email ?? 'Account'}
			aria-expanded={open}
			class="focus-visible:ring-ring hover:bg-bg-hover relative inline-flex size-9 items-center justify-center rounded-full p-0 transition-colors focus-visible:ring-2 focus-visible:outline-none"
			onclick={handleTriggerClick}
		>
			<img
				src={user.image ?? getDefaultImage(user.id)}
				alt={user.name ?? 'Account'}
				class="size-9 rounded-full"
			/>
		</button>

		{#if open}
			<div bind:this={panel} class="bg-bg-elevated shadow-feature-card absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border border-[var(--border-default)]">
				<div class="flex flex-col gap-1 px-3 py-3">
					<p class="text-sm">
						<UserName
							name={user.name ?? user.email ?? 'Account'}
							color={user.nameColor}
							effect={user.nameEffect === 'none' || user.nameEffect === 'rays' || user.nameEffect === 'glow' ? user.nameEffect : null}
							className="font-normal"
						/>
					</p>
					{#if user.email}
						<p class="text-muted-foreground text-xs">{user.email}</p>
					{/if}
				</div>
				<div class="border-[var(--border-default)] border-t"></div>
				<div class="p-1">
					<button
						type="button"
						class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-lg p-2 text-sm transition-colors"
						onclick={() => navigate(`/u/${user.username ?? user.id}`)}
					>
						<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
						{t('account.actions.my-profile')}
					</button>
					<button
						type="button"
						class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-lg p-2 text-sm transition-colors"
						onclick={() => navigate('/settings#profile')}
					>
						<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L19.542 4.5h-8.54a4 4 0 0 0-4 4v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1a1 1 0 0 0-2 0v2a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-7a1 1 0 0 0-1-1h-3.542"></path></svg>
						{t('account.actions.edit-profile')}
					</button>
					<button
						type="button"
						class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-lg p-2 text-sm transition-colors"
						onclick={() => navigate('/settings')}
					>
						<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
						{t('command-menu.actions.settings')}
					</button>
				</div>
				<div class="border-[var(--border-default)] border-t"></div>
				<div class="p-1">
					<button
						type="button"
						class="hover:bg-bg-hover flex w-full items-center gap-2 rounded-lg p-2 text-sm transition-colors"
						onclick={handleSignOut}
					>
						{t('common.sign-out')}
					</button>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="bg-muted inline-block size-9 animate-pulse rounded-full"></div>
{/if}
