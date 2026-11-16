<script lang="ts">
	import { authClient, signOut } from '#lib/auth-client.ts'
	import { dialogs, openSignIn } from '#lib/dialogs.svelte.ts'
	import { SITE_GITHUB_URL, SITE_X_URL } from '#lib/constants.ts'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import Logo from './logo.svelte'
	import { goto } from '$app/navigation'
	import { i18n } from '@isyuricunha/i18n/config'

	let { locale }: { locale: string } = $props()

	let open = $state(false)
	let filter = $state('')
	let selectedIndex = $state(0)

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

	$effect(() => {
		const down = (event: KeyboardEvent) => {
			if (event.key !== 'k' || (!event.metaKey && !event.ctrlKey)) return
			event.preventDefault()
			open = !open
		}
		document.addEventListener('keydown', down)
		return () => document.removeEventListener('keydown', down)
	})

	type Action = { title: string; icon: 'user' | 'settings' | 'logout' | 'login' | 'link' | 'code' | 'github' | 'x'; run: () => void | Promise<void> }
	type Group = { name: string; actions: Action[] }

	const groups = $derived.by((): Group[] => {
		const signedIn = Boolean($session.data?.user)
		const user = $session.data?.user
		const account: Action[] = signedIn && user
			? [
					{
						title: t('account.actions.my-profile'),
						icon: 'user',
						run: () => {
							open = false
							void goto(`/u/${user.username ?? user.id}`)
						}
					},
					{
						title: t('command-menu.actions.settings'),
						icon: 'settings',
						run: () => {
							open = false
							void goto('/settings')
						}
					},
					{
						title: t('common.sign-out'),
						icon: 'logout',
						run: async () => {
							open = false
							await signOut({
								fetchOptions: {
									onSuccess: () => {
										window.location.reload()
									}
								}
							})
						}
					}
				]
			: [
					{
						title: t('common.sign-in'),
						icon: 'login',
						run: () => {
							open = false
							openSignIn()
						}
					}
				]
		const general: Action[] = [
			{
				title: t('command-menu.actions.copy-link'),
				icon: 'link',
				run: async () => {
					open = false
					await navigator.clipboard.writeText(window.location.href)
				}
			},
			{
				title: t('command-menu.actions.source-code'),
				icon: 'code',
				run: () => {
					open = false
					window.open('https://github.com/isyuricunha/website', '_blank', 'noopener')
				}
			}
		]
		const social: Action[] = [
			{
				title: 'GitHub',
				icon: 'github',
				run: () => {
					open = false
					window.open(SITE_GITHUB_URL, '_blank', 'noopener')
				}
			},
			{
				title: 'X',
				icon: 'x',
				run: () => {
					open = false
					window.open(SITE_X_URL, '_blank', 'noopener')
				}
			}
		]
		return [
			{ name: t('command-menu.groups.account'), actions: account },
			{ name: t('command-menu.groups.general'), actions: general },
			{ name: t('command-menu.groups.social'), actions: social }
		]
	})

	const visibleGroups = $derived.by(() => {
		const term = filter.trim().toLowerCase()
		if (!term) return groups
		return groups
			.map((group) => ({
				...group,
				actions: group.actions.filter((action) => action.title.toLowerCase().includes(term))
			}))
			.filter((group) => group.actions.length > 0)
	})

	const flatActions = $derived(visibleGroups.flatMap((group) => group.actions))

	$effect(() => {
		if (selectedIndex >= flatActions.length) {
			selectedIndex = Math.max(0, flatActions.length - 1)
		}
	})

	function runAction(action: Action) {
		void action.run()
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			selectedIndex = selectedIndex + 1 < flatActions.length ? selectedIndex + 1 : 0
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			selectedIndex = selectedIndex - 1 >= 0 ? selectedIndex - 1 : flatActions.length - 1
		} else if (event.key === 'Enter') {
			event.preventDefault()
			const action = flatActions[selectedIndex]
			if (action) void action.run()
		} else if (event.key === 'Escape') {
			open = false
		}
	}

	const ICON_PATHS: Record<string, string[]> = {
		user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'],
		settings: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'M12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
		logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
		login: ['M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4', 'M10 17l5-5-5-5', 'M15 12H3'],
		link: ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'],
		code: ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'],
		github: ['M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4', 'M9 18c-4.51 2-5-2-7-2'],
		x: ['M18 6 6 18', 'm6 6 12 12']
	}
</script>

<button
	type="button"
	aria-label={t('command-menu.open-menu')}
	class="text-foreground hover:bg-bg-hover inline-flex size-9 items-center justify-center rounded-lg p-0 transition-colors"
	onclick={() => (open = true)}
>
	<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path></svg>
</button>

{#if open}
	<div class="fixed inset-0 z-50 bg-black/80" role="presentation" onclick={() => (open = false)}></div>
	<div
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-label={t('command-menu.dialog-title')}
		class="bg-bg-elevated fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-[var(--border-default)] shadow-feature-card"
		onkeydown={handleKeydown}
	>
		<input
			type="text"
			bind:value={filter}
			aria-label={t('command-menu.input-label')}
			placeholder={t('command-menu.placeholder')}
			class="border-[var(--border-default)] placeholder:text-muted-foreground focus:outline-none w-full border-b bg-transparent px-4 py-3 text-sm"
		/>
		<div class="max-h-80 overflow-y-auto py-2">
			{#if visibleGroups.length === 0}
				<p class="text-muted-foreground px-4 py-6 text-center text-sm">
					{t('command-menu.no-results')}
				</p>
			{/if}
			{#each visibleGroups as group, gi (group.name)}
				<div class="px-2 pb-1">
					<div class="text-muted-foreground px-2 py-1.5 text-xs font-medium">{group.name}</div>
					{#each group.actions as action, ai (action.title)}
						{@const globalIndex = visibleGroups.slice(0, gi).reduce((sum, g) => sum + g.actions.length, 0) + ai}
						<button
							type="button"
							class={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors ${globalIndex === selectedIndex ? 'bg-accent' : 'hover:bg-muted/50'}`}
							onclick={() => void action.run()}
							onmouseenter={() => (selectedIndex = globalIndex)}
						>
							<span class="text-muted-foreground flex size-4 items-center justify-center">
								<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									{#each ICON_PATHS[action.icon] ?? [] as path (path)}
										<path d={path}></path>
									{/each}
								</svg>
							</span>
							{action.title}
						</button>
					{/each}
				</div>
				{#if gi < visibleGroups.length - 1}
					<div class="bg-[var(--border-default)] mx-2 h-px"></div>
				{/if}
			{/each}
		</div>
		<div class="border-[var(--border-default)] flex items-center gap-2 border-t px-4 py-2.5">
			<Logo class="size-4" />
			<span class="text-muted-foreground text-xs">
				{t(flatActions[selectedIndex]?.title === t('common.sign-out') || flatActions[selectedIndex]?.title === t('command-menu.actions.copy-link') ? 'command-menu.trigger.open-command' : 'command-menu.trigger.open-link')}
			</span>
			<kbd class="bg-muted rounded border border-[var(--border-default)] px-1.5 py-0.5 text-xs">enter</kbd>
		</div>
	</div>
{/if}
