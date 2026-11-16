<script lang="ts">
	import { trpc } from '#lib/trpc-client.ts'
	import { formatMessage } from '#lib/i18n/format.ts'
	import { toastSuccess, toastError } from '#lib/toasts.svelte.ts'
	import type { RouterOutputs } from '@isyuricunha/trpc-server/root'
	import ConfirmationDialog from './confirmation-dialog.svelte'

	let { labels, locale }: { labels: Record<string, string>; locale: string } = $props()

	type SecurityStats = RouterOutputs['security']['getSecurityStats']
	type SecurityEvents = RouterOutputs['security']['getSecurityEvents']
	type IpRules = RouterOutputs['security']['getIpAccessRules']
	type LoginAttempts = RouterOutputs['security']['getLoginAttempts']
	type Lockouts = RouterOutputs['security']['getAccountLockouts']

	const allCategories = 'all'

	let selectedTab = $state('overview')
	let settingsSearchTerm = $state('')
	let selectedSettingsCategory = $state(allCategories)
	let editingSettingKey = $state<string | null>(null)
	let draftSettingValue = $state('')
	let draftSettingDescription = $state('')
	let draftSettingCategory = $state('')
	let confirmDialog = $state<{ open: boolean; title: string; description: string; action: () => void }>({
		open: false,
		title: '',
		description: '',
		action: () => {}
	})

	let securityStats = $state<SecurityStats | null>(null)
	let securityEvents = $state<SecurityEvents | null>(null)
	let ipRules = $state<IpRules | null>(null)
	let loginAttempts = $state<LoginAttempts | null>(null)
	let lockouts = $state<Lockouts | null>(null)
	let securitySettings = $state<{ settings: Record<string, Array<{ id: string; key: string; value: string; description: string | null; category: string; updatedAt: string | Date; updatedByUser?: { id: string; name: string; email: string } }>> } | null>(null)

	let statsLoading = $state(true)
	let eventsLoading = $state(true)
	let ipRulesLoading = $state(true)
	let attemptsLoading = $state(true)
	let lockoutsLoading = $state(true)
	let settingsLoading = $state(true)
	let statsError = $state(false)
	let eventsError = $state(false)
	let ipRulesError = $state(false)
	let attemptsError = $state(false)
	let lockoutsError = $state(false)
	let settingsError = $state(false)
	let isMutating = $state(false)
	let isAddingRule = $state(false)

	function fetchAll() {
		trpc.security.getSecurityStats
			.query()
			.then((data) => {
				securityStats = data as SecurityStats
				statsLoading = false
			})
			.catch(() => {
				statsError = true
				statsLoading = false
			})
		trpc.security.getSecurityEvents
			.query({ limit: 10 })
			.then((data) => (securityEvents = data as SecurityEvents))
			.catch(() => (eventsError = true))
			.finally(() => (eventsLoading = false))
		trpc.security.getIpAccessRules
			.query()
			.then((data) => (ipRules = data as IpRules))
			.catch(() => (ipRulesError = true))
			.finally(() => (ipRulesLoading = false))
		trpc.security.getLoginAttempts
			.query()
			.then((data) => (loginAttempts = data as LoginAttempts))
			.catch(() => (attemptsError = true))
			.finally(() => (attemptsLoading = false))
		trpc.security.getAccountLockouts
			.query({})
			.then((data) => (lockouts = data as Lockouts))
			.catch(() => (lockoutsError = true))
			.finally(() => (lockoutsLoading = false))
		trpc.security.getSecuritySettings
			.query()
			.then((data) => (securitySettings = data as never))
			.catch(() => (settingsError = true))
			.finally(() => (settingsLoading = false))
	}

	function addIpRule(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const ipAddress = formData.get('ipAddress') as string
		const type = formData.get('type') as 'whitelist' | 'blacklist'
		const description = formData.get('description') as string

		if (!ipAddress || !type) {
			toastError(labels['messages.ip-type-required'])
			return
		}

		isAddingRule = true
		isMutating = true
		trpc.security.addIpAccessRule
			.mutate({ ipAddress, type, description: description || undefined })
			.then(() => {
				toastSuccess(labels['messages.ip-rule-added'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.ip-rule-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => {
				isAddingRule = false
				isMutating = false
			})
	}

	function resolveEvent(eventId: string) {
		isMutating = true
		trpc.security.resolveSecurityEvent
			.mutate({ eventId })
			.then(() => {
				toastSuccess(labels['messages.event-resolved'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.event-resolve-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isMutating = false))
	}

	function unlockAccount(lockoutId: string) {
		isMutating = true
		trpc.security.unlockAccount
			.mutate({ lockoutId })
			.then(() => {
				toastSuccess(labels['messages.account-unlocked'])
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.account-unlock-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isMutating = false))
	}

	function saveEditingSetting() {
		if (!editingSettingKey) return
		isMutating = true
		trpc.security.updateSecuritySetting
			.mutate({
				key: editingSettingKey,
				value: draftSettingValue,
				description: draftSettingDescription || undefined,
				category: draftSettingCategory || undefined
			})
			.then(() => {
				toastSuccess(labels['messages.setting-updated'])
				editingSettingKey = null
				fetchAll()
			})
			.catch((error: { message?: string }) =>
				toastError(formatMessage(labels['messages.setting-update-failed'], { message: error.message ?? '' }, locale))
			)
			.finally(() => (isMutating = false))
	}

	function confirmResolveEvent(eventId: string, eventType: string) {
		confirmDialog = {
			open: true,
			title: labels['confirm.resolve-title'],
			description: formatMessage(labels['confirm.resolve-event'], { type: eventType }, locale),
			action: () => {
				resolveEvent(eventId)
				confirmDialog = { ...confirmDialog, open: false }
			}
		}
	}

	function confirmUnlockAccount(lockoutId: string, userId: string) {
		confirmDialog = {
			open: true,
			title: labels['confirm.unlock-title'],
			description: formatMessage(labels['confirm.unlock-account'], { userId }, locale),
			action: () => {
				unlockAccount(lockoutId)
				confirmDialog = { ...confirmDialog, open: false }
			}
		}
	}

	function severityBadge(severity: string) {
		switch (severity) {
			case 'critical':
			case 'high':
				return 'bg-red-500/15 text-red-500'
			case 'medium':
				return 'bg-bg-hover text-text-secondary'
			default:
				return 'border border-[var(--border-faint)]'
		}
	}

	function severityLabel(severity: string) {
		switch (severity) {
			case 'critical':
				return labels['severity.critical']
			case 'high':
				return labels['severity.high']
			case 'medium':
				return labels['severity.medium']
			case 'low':
				return labels['severity.low']
			default:
				return severity
		}
	}

	function ruleTypeLabel(type: string) {
		switch (type) {
			case 'whitelist':
				return labels['rule-types.whitelist']
			case 'blacklist':
				return labels['rule-types.blacklist']
			default:
				return type
		}
	}

	let categories = $derived(Object.keys(securitySettings?.settings ?? {}).toSorted((a, b) => a.localeCompare(b)))

	let filteredSettings = $derived.by(() => {
		const grouped = securitySettings?.settings ?? {}
		const result: Record<string, Array<{ id: string; key: string; value: string; description: string | null; category: string; updatedAt: string | Date; updatedByUser?: { id: string; name: string; email: string } }>> = {}

		for (const [category, settings] of Object.entries(grouped)) {
			if (selectedSettingsCategory !== allCategories && category !== selectedSettingsCategory) continue

			const items = settings.filter((setting) => {
				if (!settingsSearchTerm) return true
				const needle = settingsSearchTerm.toLowerCase()
				return (
					setting.key.toLowerCase().includes(needle) ||
					setting.value.toLowerCase().includes(needle) ||
					(setting.description?.toLowerCase().includes(needle) ?? false)
				)
			})

			if (items.length > 0) result[category] = items
		}

		return result
	})

	function startEditingSetting(setting: { key: string; value: string; description: string | null; category: string }) {
		editingSettingKey = setting.key
		draftSettingValue = setting.value
		draftSettingDescription = setting.description ?? ''
		draftSettingCategory = setting.category
	}

	function cancelEditingSetting() {
		editingSettingKey = null
		draftSettingValue = ''
		draftSettingDescription = ''
		draftSettingCategory = ''
	}

	let anyError = $derived(statsError || eventsError || ipRulesError || attemptsError || lockoutsError || settingsError)

	$effect(() => {
		fetchAll()
	})
</script>

{#if statsLoading}
	<div class="p-6">{labels.loading}</div>
{:else}
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-xl font-medium sm:text-2xl">{labels.title}</h1>
				<p class="text-text-secondary text-sm">{labels.description}</p>
			</div>
		</div>

		{#if anyError}
			<div class="text-destructive text-sm">{labels.error}</div>
		{/if}

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.security-events']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{securityStats?.events.total ?? '—'}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.critical-events'], { count: securityStats?.events.critical ?? '—' }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.login-attempts']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{securityStats?.loginAttempts.total ?? '—'}</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.failed-attempts'], { count: securityStats?.loginAttempts.failed ?? '—' }, locale)}
					</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.account-lockouts']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{securityStats?.lockouts.active ?? '—'}</div>
					<p class="text-text-secondary text-xs">{labels['stats.active-lockouts']}</p>
				</div>
			</div>

			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-0">
					<span class="text-sm font-medium">{labels['stats.two-factor-adoption']}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-text-secondary h-4 w-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.75 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
				</div>
				<div class="p-6 pt-0">
					<div class="text-2xl font-medium">{securityStats?.twoFactor.adoptionRate?.toFixed(1) ?? '—'}%</div>
					<p class="text-text-secondary text-xs">
						{formatMessage(labels['stats.users-enabled'], { count: securityStats?.twoFactor.enabledUsers ?? '—' }, locale)}
					</p>
				</div>
			</div>
		</div>

		<div class="bg-bg-hover grid w-full grid-cols-2 rounded-md p-1 sm:grid-cols-3 lg:grid-cols-5">
			{#each ['overview', 'events', 'ip-control', 'lockouts', 'settings'] as tab (tab)}
				<button type="button" class="rounded-md px-2 py-1.5 text-sm transition-colors {selectedTab === tab ? 'bg-bg-base text-text-primary shadow' : 'text-text-secondary hover:text-text-primary'}" onclick={() => (selectedTab = tab)}>
					{labels[`tabs.${tab}`]}
				</button>
			{/each}
		</div>

		{#if selectedTab === 'overview'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['overview.recent-events.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['overview.recent-events.description']}</p>
					</div>
					<div class="p-6">
						{#if eventsLoading}
							<div>{labels['events.loading']}</div>
						{:else if eventsError}
							<div class="text-destructive text-sm">{labels.error}</div>
						{:else}
							<div class="space-y-3">
								{#if (securityEvents?.events?.length ?? 0) > 0}
									{#each (securityEvents?.events ?? []).slice(0, 5) as event (event.id)}
										<div class="flex items-center justify-between">
											<div class="flex items-center space-x-2">
												<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {severityBadge(event.severity)}">
													{severityLabel(event.severity)}
												</span>
												<span class="text-sm">{event.eventType}</span>
											</div>
											<span class="text-text-secondary text-xs">{new Date(event.createdAt).toLocaleString()}</span>
										</div>
									{/each}
								{:else}
									<div class="text-text-secondary text-sm">{labels['events.no-recent']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['overview.login-attempts.title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['overview.login-attempts.description']}</p>
					</div>
					<div class="p-6">
						{#if attemptsLoading}
							<div>{labels['overview.login-attempts.loading']}</div>
						{:else if attemptsError}
							<div class="text-destructive text-sm">{labels.error}</div>
						{:else}
							<div class="space-y-2">
								<div class="flex justify-between">
									<span>{labels['overview.login-attempts.total']}</span>
									<span class="font-medium">{loginAttempts?.summary.total ?? '—'}</span>
								</div>
								<div class="flex justify-between">
									<span>{labels['overview.login-attempts.successful']}</span>
									<span class="text-accent-earth-text font-medium">{loginAttempts?.summary.successful ?? '—'}</span>
								</div>
								<div class="flex justify-between">
									<span>{labels['overview.login-attempts.failed']}</span>
									<span class="text-destructive font-medium">{loginAttempts?.summary.failed ?? '—'}</span>
								</div>
								<div class="flex justify-between">
									<span>{labels['overview.login-attempts.unique-ips']}</span>
									<span class="font-medium">{loginAttempts?.summary.uniqueIPs ?? '—'}</span>
								</div>
								<div class="flex justify-between">
									<span>{labels['overview.login-attempts.success-rate']}</span>
									<span class="font-medium">{loginAttempts?.summary.successRate?.toFixed(1) ?? '—'}%</span>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'events'}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="p-6 pb-0">
					<h3 class="font-medium">{labels['events.title']}</h3>
					<p class="text-muted-foreground text-sm">{labels['events.description']}</p>
				</div>
				<div class="p-6">
					{#if eventsLoading}
						<div>{labels['events.loading-security-events']}</div>
					{:else if eventsError}
						<div class="text-destructive text-sm">{labels.error}</div>
					{:else}
						<div class="space-y-4">
							{#if (securityEvents?.events?.length ?? 0) > 0}
								{#each securityEvents?.events ?? [] as event (event.id)}
									<div class="rounded-lg border border-[var(--border-subtle)] p-4">
										<div class="mb-2 flex items-center justify-between">
											<div class="flex items-center space-x-2">
												<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {severityBadge(event.severity)}">
													{severityLabel(event.severity)}
												</span>
												<span class="font-medium">{event.eventType}</span>
											</div>
											<div class="flex items-center space-x-2">
												<span class="text-text-secondary text-sm">{new Date(event.createdAt).toLocaleString()}</span>
												{#if !event.resolved}
													<button type="button" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50" onclick={() => confirmResolveEvent(event.id, event.eventType)} disabled={isMutating}>
														{labels['actions.resolve']}
													</button>
												{/if}
											</div>
										</div>
										{#if event.ipAddress}
											<div class="text-text-secondary text-sm">
												{formatMessage(labels['events.ip'], { ip: event.ipAddress }, locale)}
											</div>
										{/if}
										{#if event.user}
											<div class="text-text-secondary text-sm">
												{formatMessage(labels['events.user'], { name: event.user.name, email: event.user.email }, locale)}
											</div>
										{/if}
										{#if event.resolved}
											<span class="mt-2 inline-flex rounded-full border border-[var(--border-faint)] px-2.5 py-0.5 text-xs font-medium">
												{formatMessage(labels['events.resolved'], { date: event.resolvedAt ? new Date(event.resolvedAt).toLocaleString() : '' }, locale)}
											</span>
										{/if}
									</div>
								{/each}
							{:else}
								<div class="text-text-secondary text-center">{labels['events.empty']}</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{:else if selectedTab === 'ip-control'}
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['ip-control.add-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['ip-control.add-description']}</p>
					</div>
					<div class="p-6">
						<form onsubmit={addIpRule} class="space-y-4">
							<div>
								<label for="ipAddress" class="text-sm font-medium">{labels['fields.ip-address']}</label>
								<input id="ipAddress" name="ipAddress" placeholder="192.168.1.1 or 192.168.1.0/24" required class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<div>
								<label for="security-rule-type" class="text-sm font-medium">{labels['fields.rule-type']}</label>
								<select id="security-rule-type" name="type" required class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
									<option value="whitelist">{labels['rule-types.whitelist-allow']}</option>
									<option value="blacklist">{labels['rule-types.blacklist-block']}</option>
								</select>
							</div>
							<div>
								<label for="rule-description" class="text-sm font-medium">{labels['fields.description-optional']}</label>
								<input id="rule-description" name="description" placeholder={labels['fields.rule-description-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
							</div>
							<button type="submit" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={isAddingRule}>
								{isAddingRule ? labels['actions.adding'] : labels['actions.add-rule']}
							</button>
						</form>
					</div>
				</div>

				<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
					<div class="p-6 pb-0">
						<h3 class="font-medium">{labels['ip-control.rules-title']}</h3>
						<p class="text-muted-foreground text-sm">{labels['ip-control.rules-description']}</p>
					</div>
					<div class="p-6">
						{#if ipRulesLoading}
							<div>{labels['ip-control.loading-rules']}</div>
						{:else if ipRulesError}
							<div class="text-destructive text-sm">{labels.error}</div>
						{:else}
							<div class="space-y-3">
								{#if (ipRules?.rules?.length ?? 0) > 0}
									{#each ipRules?.rules ?? [] as rule (rule.id)}
										<div class="flex items-center justify-between rounded border border-[var(--border-faint)] p-3">
											<div>
												<div class="font-medium">{rule.ipAddress}</div>
												<div class="text-text-secondary text-sm">{rule.description || labels['ip-control.no-description']}</div>
											</div>
											<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {rule.type === 'whitelist' ? 'bg-accent-earth text-text-inverse' : 'bg-red-500/15 text-red-500'}">
												{ruleTypeLabel(rule.type)}
											</span>
										</div>
									{/each}
								{:else}
									<div class="text-text-secondary text-center">{labels['ip-control.empty']}</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if selectedTab === 'lockouts'}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="p-6 pb-0">
					<h3 class="font-medium">{labels['lockouts.title']}</h3>
					<p class="text-muted-foreground text-sm">{labels['lockouts.description']}</p>
				</div>
				<div class="p-6">
					{#if lockoutsLoading}
						<div>{labels['lockouts.loading']}</div>
					{:else if lockoutsError}
						<div class="text-destructive text-sm">{labels.error}</div>
					{:else}
						<div class="space-y-4">
							{#if (lockouts?.lockouts?.length ?? 0) > 0}
								{#each lockouts?.lockouts ?? [] as lockout (lockout.id)}
									<div class="rounded-lg border border-[var(--border-subtle)] p-4">
										<div class="flex items-center justify-between">
											<div>
												<div class="font-medium">
													{formatMessage(labels['lockouts.user-id'], { userId: lockout.userId }, locale)}
												</div>
												<div class="text-text-secondary text-sm">
													{formatMessage(labels['lockouts.lockout-id'], { lockoutId: lockout.id }, locale)}
												</div>
												<div class="text-text-secondary text-sm">
													{formatMessage(labels['lockouts.locked'], { date: new Date(lockout.lockedAt).toLocaleString() }, locale)}
												</div>
												<div class="text-text-secondary text-sm">
													{formatMessage(labels['lockouts.reason'], { reason: lockout.reason }, locale)}
												</div>
											</div>
											<button type="button" class="bg-accent-earth text-text-inverse inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" onclick={() => confirmUnlockAccount(lockout.id, lockout.userId)} disabled={isMutating}>
												{labels['actions.unlock-account']}
											</button>
										</div>
									</div>
								{/each}
							{:else}
								<div class="text-text-secondary text-center">{labels['lockouts.empty']}</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{:else if selectedTab === 'settings'}
			<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
				<div class="p-6 pb-0">
					<h3 class="font-medium">{labels['settings.title']}</h3>
					<p class="text-muted-foreground text-sm">{labels['settings.description']}</p>
				</div>
				<div class="space-y-4 p-6">
					<div class="grid gap-3 md:grid-cols-2">
						<div>
							<label for="security-settings-search" class="text-sm font-medium">{labels['fields.search']}</label>
							<input id="security-settings-search" aria-label={labels['fields.search']} bind:value={settingsSearchTerm} placeholder={labels['settings.search-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
						</div>
						<div>
							<label for="security-settings-category" class="text-sm font-medium">{labels['fields.category']}</label>
							<select id="security-settings-category" bind:value={selectedSettingsCategory} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm">
								<option value={allCategories}>{labels['settings.all-categories']}</option>
								{#each categories as category (category)}
									<option value={category}>{category}</option>
								{/each}
							</select>
						</div>
					</div>

					{#if settingsLoading}
						<div class="text-text-secondary py-8 text-center">{labels['settings.loading']}</div>
					{:else if settingsError}
						<div class="text-destructive py-8 text-center text-sm">{labels.error}</div>
					{/if}

					{#if !settingsLoading && !settingsError && Object.keys(filteredSettings).length === 0}
						<div class="text-text-secondary py-8 text-center">{labels['settings.empty']}</div>
					{/if}

					{#if !settingsLoading && !settingsError && Object.keys(filteredSettings).length > 0}
						<div class="space-y-4">
							{#each Object.entries(filteredSettings) as [category, settings] (category)}
								<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
									<div class="p-6 pb-0">
										<h4 class="text-base font-medium">{category}</h4>
									</div>
									<div class="space-y-3 p-6">
										{#each settings as setting (setting.id)}
											{@const isEditing = editingSettingKey === setting.key}
											<div class="rounded-lg border border-[var(--border-subtle)] p-4">
												<div class="flex items-start justify-between gap-4">
													<div class="min-w-0 flex-1 space-y-2">
														<div class="flex items-center gap-2">
															<span class="truncate font-medium">{setting.key}</span>
															<span class="inline-flex shrink-0 rounded-full border border-[var(--border-faint)] px-2.5 py-0.5 text-xs font-medium">{setting.category}</span>
														</div>

														{#if isEditing}
															<div class="space-y-3">
																<div>
																	<label for="setting-value-{setting.id}" class="text-sm font-medium">{labels['fields.value']}</label>
																	<textarea id="setting-value-{setting.id}" bind:value={draftSettingValue} rows="3" class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"></textarea>
																</div>
																<div>
																	<label for="setting-description-{setting.id}" class="text-sm font-medium">{labels['fields.description']}</label>
																	<input id="setting-description-{setting.id}" bind:value={draftSettingDescription} placeholder={labels['fields.optional-description-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
																</div>
																<div>
																	<label for="setting-category-{setting.id}" class="text-sm font-medium">{labels['fields.category']}</label>
																	<input id="setting-category-{setting.id}" bind:value={draftSettingCategory} placeholder={labels['fields.category-placeholder']} class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm" />
																</div>
															</div>
														{:else}
															<div class="space-y-1">
																<div class="text-text-secondary break-words text-sm">{setting.value}</div>
																{#if setting.description}
																	<div class="text-text-secondary break-words text-xs">{setting.description}</div>
																{/if}
															</div>
														{/if}

														<div class="text-text-secondary text-xs">
															{formatMessage(labels['settings.updated'], { date: new Date(setting.updatedAt).toLocaleString() }, locale)}
															{#if setting.updatedByUser}
																<span>
																	{formatMessage(labels['settings.updated-by'], { name: setting.updatedByUser.name }, locale)}
																</span>
															{/if}
														</div>
													</div>

													<div class="flex shrink-0 flex-col gap-2">
														{#if isEditing}
															<button type="button" class="bg-accent-earth text-text-inverse rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50" onclick={saveEditingSetting} disabled={isMutating}>
																{labels['actions.save']}
															</button>
															<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors disabled:opacity-50" onclick={cancelEditingSetting} disabled={isMutating}>
																{labels['common.cancel']}
															</button>
														{:else}
															<button type="button" class="hover:bg-bg-hover rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm transition-colors" onclick={() => startEditingSetting(setting)}>
																{labels['actions.edit']}
															</button>
														{/if}
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<ConfirmationDialog
	bind:open={confirmDialog.open}
	title={confirmDialog.title}
	description={confirmDialog.description}
	variant="destructive"
	onConfirm={confirmDialog.action}
	loading={isMutating}
	{labels}
/>
