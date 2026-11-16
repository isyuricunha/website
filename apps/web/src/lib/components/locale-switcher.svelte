<script lang="ts">
	import { goto } from '$app/navigation'
	import { i18n, supportedLanguages } from '@isyuricunha/i18n/config'

	let open = $state(false)

	// Mirrors the next-intl switch: store the preference in NEXT_LOCALE and go
	// to the same path with the new locale prefix (default locale unprefixed).
	function switchLanguage(locale: string) {
		open = false

		const here = new URL(window.location.href)
		const segments = here.pathname.split('/').filter(Boolean)
		const first = segments[0]

		let unprefixed = here.pathname

		if (first && i18n.locales.includes(first)) {
			unprefixed = `/${segments.slice(1).join('/')}`
		}

		if (unprefixed === '/') {
			unprefixed = ''
		}

		document.cookie = `NEXT_LOCALE=${locale}; path=/; secure; samesite=strict; max-age=31536000`

		const target = locale === i18n.defaultLocale ? unprefixed || '/' : `/${locale}${unprefixed}`

		void goto(target)
	}
</script>

<div class="relative">
	<button
		type="button"
		class="text-muted-foreground hover:bg-bg-hover hover:text-foreground flex size-9 items-center justify-center rounded-md transition-colors"
		aria-label="Change language"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
			class="size-4"
		>
			<path d="m5 8 6 6" />
			<path d="m4 14 6-6 2-3" />
			<path d="M2 5h12" />
			<path d="M7 2h1" />
			<path d="m22 22-5-10-5 10" />
			<path d="M14 18h6" />
		</svg>
	</button>

	{#if open}
		<button
			type="button"
			class="fixed inset-0 z-30 cursor-default"
			aria-label="Close language menu"
			onclick={() => (open = false)}
		></button>
		<ul class="bg-bg-elevated absolute right-0 z-40 mt-1 flex min-w-40 flex-col rounded-md border border-[var(--border-default)] p-1 shadow-lg">
			{#each supportedLanguages as language (language.code)}
				<li>
					<button
						type="button"
						class="text-muted-foreground hover:bg-bg-hover hover:text-foreground flex min-h-9 w-full items-center rounded-md px-3 text-sm transition-colors"
						onclick={() => switchLanguage(language.code)}
					>
						{language.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
