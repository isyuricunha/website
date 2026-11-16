<script lang="ts">
	import { toastError, toastSuccess } from '#lib/toasts.svelte.ts'
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import { page } from '$app/state'

	type Props = { locale?: string }
	let { locale }: Props = $props()

	let isOnline = $state(true)
	let showIndicator = $state(false)
	let hideTimer: ReturnType<typeof setTimeout> | null = null
	let labels = $state({
		restored: 'Connection restored!',
		offlineToast: 'You are offline. Some features may not work.',
		online: 'Back online',
		offline: 'No internet connection'
	})

	$effect(() => {
		const current = locale ?? page.data.locale ?? 'en'
		let cancelled = false
		loadMessages(current).then((messages) => {
			if (cancelled) return
			const t = createTranslator(current, messages as never)
			labels = {
				restored: t('component.offline-indicator.toast.restored'),
				offlineToast: t('component.offline-indicator.toast.offline'),
				online: t('component.offline-indicator.status.online'),
				offline: t('component.offline-indicator.status.offline')
			}
		})
		return () => {
			cancelled = true
		}
	})

	$effect(() => {
		isOnline = navigator.onLine

		const handleOnline = () => {
			isOnline = true
			showIndicator = true
			toastSuccess(labels.restored)
			if (hideTimer) clearTimeout(hideTimer)
			hideTimer = setTimeout(() => (showIndicator = false), 3000)
		}
		const handleOffline = () => {
			isOnline = false
			showIndicator = true
			toastError(labels.offlineToast)
		}

		addEventListener('online', handleOnline)
		addEventListener('offline', handleOffline)
		return () => {
			removeEventListener('online', handleOnline)
			removeEventListener('offline', handleOffline)
			if (hideTimer) {
				clearTimeout(hideTimer)
				hideTimer = null
			}
		}
	})
</script>

{#if !isOnline || showIndicator}
	<div
		class="bg-bg-active text-text-primary fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg transition-all duration-300"
		style={isOnline
			? 'background: var(--accent-dim); color: var(--accent-earth-text)'
			: ''}
	>
		{#if isOnline}
			<svg
				class="size-4"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			><path d="M2 8.82a15 15 0 0 1 4.17-2.65"></path><path
					d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"
				></path><path d="m16.85 11.25a10 10 0 0 1 2.22 1.68"></path><path
					d="m5 13a10 10 0 0 1 5.24-2.76"
				></path><path d="m12 20h.01"></path></svg>
		{:else}
			<svg
				class="size-4"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			><line x1="2" y1="2" x2="22" y2="22"></line><path
					d="M8.5 16.5a5 5 0 0 1 7 0"
				></path><path d="m2 8.82a15 15 0 0 1 4.17-2.65"></path><path
					d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"
				></path><path d="m16.85 11.25a10 10 0 0 1 2.22 1.68"></path><path
					d="m5 13a10 10 0 0 1 5.24-2.76"
				></path><path d="m12 20h.01"></path></svg>
		{/if}
		<span class="text-sm font-medium">{isOnline ? labels.online : labels.offline}</span>
	</div>
{/if}
