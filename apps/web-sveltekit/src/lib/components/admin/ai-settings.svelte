<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'

	let {
		labels
	}: {
		labels: Record<string, string>
	} = $props()

	type Settings = {
		endpoint: string
		model: string
		apiKeyPreview: string | null
		source: 'database' | 'environment' | null
	}

	let initialized = $state(false)
	let endpoint = $state('')
	let apiKey = $state('')
	let model = $state('')
	let modelSearch = $state('')
	let models = $state<string[]>([])
	let showApiKey = $state(false)
	let apiKeyPreview = $state<string | null>(null)
	let configSource = $state<'database' | 'environment' | null>(null)
	let modelsCached = $state<boolean | null>(null)
	let modelsFetchedAt = $state<string | null>(null)
	let status = $state<'pending' | 'success' | 'error'>('pending')
	let isLoading = $derived(status === 'pending')
	let isBusy = $state(false)
	let loadingModels = $state(false)
	let savingSettings = $state(false)

	function fetchSettings() {
		trpc.aiSettings.getSettings
			.query()
			.then((settings) => {
				const data = settings as Settings
				// Initialize form state exactly once so refetches never overwrite
				// in-progress edits (same guarded pattern as the React version).
				if (!initialized && data) {
					initialized = true
					endpoint = data.endpoint
					model = data.model
					apiKeyPreview = data.apiKeyPreview
					configSource = data.source
				}
				status = 'success'
			})
			.catch(() => (status = 'error'))
	}

	function loadModels(forceRefresh: boolean) {
		if (!endpoint.trim()) {
			toastError('Enter an endpoint before loading models')
			return
		}
		if (!apiKeyPreview && !apiKey.trim()) {
			toastError('Enter an API key before loading models')
			return
		}

		loadingModels = true
		isBusy = true
		trpc.aiSettings.listModels
			.mutate({
				endpoint: endpoint.trim(),
				apiKey: apiKey.trim() || undefined,
				forceRefresh
			})
			.then((data) => {
				const result = data as { models: string[]; cached: boolean; fetchedAt: string }
				models = result.models
				modelsCached = result.cached
				modelsFetchedAt = result.fetchedAt
				toastSuccess(`${result.models.length} models loaded`)
			})
			.catch((error: { message?: string }) => toastError(error.message ?? 'Failed to load models'))
			.finally(() => {
				loadingModels = false
				isBusy = false
			})
	}

	function saveSettings() {
		if (!endpoint.trim() || !model.trim()) {
			toastError('Endpoint and model are required')
			return
		}
		if (!apiKeyPreview && !apiKey.trim()) {
			toastError('API key is required')
			return
		}

		savingSettings = true
		isBusy = true
		trpc.aiSettings.saveSettings
			.mutate({
				endpoint: endpoint.trim(),
				model: model.trim(),
				apiKey: apiKey.trim() || undefined
			})
			.then((data) => {
				const result = data as { apiKeyPreview: string | null; source: 'database' | 'environment' | null }
				apiKey = ''
				apiKeyPreview = result.apiKeyPreview
				configSource = result.source
				toastSuccess('Runtime settings saved')
				fetchSettings()
			})
			.catch((error: { message?: string }) => toastError(error.message ?? 'Failed to save settings'))
			.finally(() => {
				savingSettings = false
				isBusy = false
			})
	}

	let filteredModels = $derived.by(() => {
		const query = modelSearch.trim().toLowerCase()
		if (!query) return models
		return models.filter((item) => item.toLowerCase().includes(query))
	})

	$effect(() => {
		fetchSettings()
	})
</script>

{#if status === 'error'}
	<div class="text-destructive p-6">Failed to load AI settings.</div>
{:else}
	<div class="space-y-6">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Runtime AI settings</h1>
			<p class="text-text-secondary mt-1 text-sm">
				Change the API key, endpoint and model without deploying the website.
			</p>
		</div>

		<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
			<div class="p-6 pb-0">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h3 class="font-medium">Connection</h3>
						<p class="text-muted-foreground text-sm">
							The key is encrypted before it is stored and is never returned to the browser.
						</p>
					</div>
					{#if configSource}
						<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {configSource === 'database' ? 'bg-accent-earth text-text-inverse' : 'bg-bg-hover text-text-secondary'}">
							{configSource === 'database' ? 'Runtime configuration' : 'Environment fallback'}
						</span>
					{/if}
				</div>
			</div>
			<div class="space-y-5 p-6">
				<div class="space-y-2">
					<label for="ai-api-key" class="text-sm font-medium">API key</label>
					<div class="relative">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-tertiary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2">
							<circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" />
						</svg>
						<input
							id="ai-api-key"
							type={showApiKey ? 'text' : 'password'}
							bind:value={apiKey}
							placeholder={apiKeyPreview ? `Configured key ending in ${apiKeyPreview}` : 'Enter API key'}
							autocomplete="new-password"
							class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] py-2 pr-11 pl-10 text-sm"
							disabled={isLoading || isBusy}
						/>
						<button
							type="button"
							class="hover:bg-bg-hover absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 rounded-md"
							onclick={() => (showApiKey = !showApiKey)}
							aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
						>
							{#if showApiKey}
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto h-4 w-4"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mx-auto h-4 w-4"><path d="M2.062 12.348a1 1 0 0 1 0-.678 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .678 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
							{/if}
						</button>
					</div>
					<p class="text-text-tertiary text-xs">
						Leave this field empty to keep the currently stored key.
					</p>
				</div>

				<div class="space-y-2">
					<label for="ai-endpoint" class="text-sm font-medium">Endpoint</label>
					<div class="relative">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-tertiary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2">
							<rect width="20" height="8" x="2" y="2" rx="2" /><rect width="20" height="8" x="2" y="14" rx="2" /><line x1="6" x2="6.01" y1="6" y2="6" /><line x1="6" x2="6.01" y1="18" y2="18" />
						</svg>
						<input
							id="ai-endpoint"
							type="url"
							bind:value={endpoint}
							placeholder="https://example.com/v1"
							class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] py-2 pl-10 pr-3 text-sm"
							disabled={isLoading || isBusy}
						/>
					</div>
					<p class="text-text-tertiary text-xs">
						Use the API base URL. The server calls /models and /chat/completions below it.
					</p>
				</div>

				<div class="flex flex-wrap gap-2">
					<button type="button" class="bg-bg-hover hover:bg-bg-base inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" onclick={() => loadModels(false)} disabled={isLoading || isBusy}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4 {loadingModels ? 'animate-spin' : ''}">
							<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
						</svg>
						Load models
					</button>
					<button type="button" class="hover:bg-bg-hover inline-flex items-center rounded-md border border-[var(--border-faint)] px-4 py-2 text-sm transition-colors disabled:opacity-50" onclick={() => loadModels(true)} disabled={isLoading || isBusy}>
						Refresh cache
					</button>
					{#if modelsCached !== null}
						<span class="text-text-tertiary self-center text-xs">
							{modelsCached ? 'Loaded from cache' : 'Loaded from endpoint'}
							{modelsFetchedAt ? ` · ${new Date(modelsFetchedAt).toLocaleString()}` : ''}
						</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
			<div class="p-6 pb-0">
				<h3 class="font-medium">Model</h3>
				<p class="text-muted-foreground text-sm">Search the models returned by the configured endpoint.</p>
			</div>
			<div class="space-y-4 p-6">
				<div class="space-y-2">
					<label for="selected-model" class="text-sm font-medium">Selected model</label>
					<input id="selected-model" bind:value={model} readonly placeholder="Load and select a model" class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
				</div>

				<div class="space-y-2">
					<label for="model-search" class="text-sm font-medium">Search models</label>
					<div class="relative">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-tertiary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2">
							<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
						</svg>
						<input id="model-search" bind:value={modelSearch} placeholder="Search by model ID" class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] py-2 pl-10 pr-3 text-sm" disabled={models.length === 0 || isBusy} />
					</div>
				</div>

				<div class="h-72 overflow-y-auto rounded-md border border-[var(--border-faint)]">
					<div class="p-2">
						{#if filteredModels.length > 0}
							{#each filteredModels as item (item)}
								<button
									type="button"
									class="hover:bg-bg-surface flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors {item === model ? 'bg-action-primary-soft text-action-primary' : ''}"
									onclick={() => (model = item)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-4 w-4 {item === model ? '' : 'opacity-0'}">
										<polyline points="20 6 9 17 4 12" />
									</svg>
									<span class="min-w-0 flex-1 truncate font-mono">{item}</span>
								</button>
							{/each}
						{:else}
							<div class="text-text-tertiary flex h-64 items-center justify-center px-4 text-center text-sm">
								{models.length === 0
									? 'Load models from the endpoint to choose one.'
									: 'No models match the current search.'}
							</div>
						{/if}
					</div>
				</div>

				<div class="flex justify-end">
					<button type="button" class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" onclick={saveSettings} disabled={isLoading || isBusy}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mr-2 h-4 w-4">
							<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" /><path d="M7 3v4a1 1 0 0 0 1 1h7" />
						</svg>
						{savingSettings ? 'Saving...' : 'Save settings'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
