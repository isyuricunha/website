<script lang="ts">
	import { loadMessages } from '#lib/i18n/catalog'
	import { createTranslator } from '#lib/i18n/translator'
	import { i18n } from '@isyuricunha/i18n/config'

	type Props = {
		title: string
		description: string
		mdxHtml?: string
		locale: string
	}

	let { title, description, mdxHtml, locale }: Props = $props()

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

	let expanded = $state<Record<string, boolean>>({ laptop: true, infra: true })

	function toggleSection(key: string) {
		expanded[key] = !expanded[key]
	}

	type ComparisonItem = {
		name: string
		pros: string[]
		cons: string[]
		price: string
		rating: number
	}

	const devToolsComparison: ComparisonItem[] = $derived([
		{
			name: 'Docker',
			pros: [t('component.uses-page.tools.docker.pros.0'), t('component.uses-page.tools.docker.pros.1'), t('component.uses-page.tools.docker.pros.2')],
			cons: [t('component.uses-page.tools.docker.cons.0'), t('component.uses-page.tools.docker.cons.1')],
			price: t('component.uses-page.tools.common.price.free'),
			rating: 5
		},
		{
			name: 'Kubernetes',
			pros: [
				t('component.uses-page.tools.kubernetes.pros.0'),
				t('component.uses-page.tools.kubernetes.pros.1'),
				t('component.uses-page.tools.kubernetes.pros.2')
			],
			cons: [t('component.uses-page.tools.kubernetes.cons.0'), t('component.uses-page.tools.kubernetes.cons.1')],
			price: t('component.uses-page.tools.common.price.free'),
			rating: 4
		},
		{
			name: 'Terraform',
			pros: [t('component.uses-page.tools.terraform.pros.0'), t('component.uses-page.tools.terraform.pros.1'), t('component.uses-page.tools.terraform.pros.2')],
			cons: [t('component.uses-page.tools.terraform.cons.0'), t('component.uses-page.tools.terraform.cons.1')],
			price: t('component.uses-page.tools.common.price.free-paid'),
			rating: 4
		}
	])

	const sectionIcons: Record<string, string[]> = {
		Laptop: ['M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16'],
		'Stacks': ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'],
		Infra: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z']
	}

	const starPath = 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.39 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z'
</script>

<div class="mx-auto max-w-4xl">
	<div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<h1 class="mb-2 text-[clamp(32px,4vw,52px)] leading-[1.08] font-normal tracking-tighter">
				{title}
			</h1>
			<p class="text-muted-foreground text-sm sm:text-base">{description}</p>
		</div>
		<span class="border-input text-muted-foreground inline-flex items-center self-start rounded-full border px-2.5 py-0.5 text-xs sm:self-auto">
			<svg class="mr-1 size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path></svg>
			{t('component.uses-page.badge.updated-recently')}
		</span>
	</div>

	{#if mdxHtml}
		<div class="uses-content-wrapper">
			{@html mdxHtml}
		</div>
	{:else}
		<div class="bg-bg-surface shadow-feature-card mb-8 overflow-hidden rounded-lg border border-[var(--border-subtle)]">
			<button
				type="button"
				class="bg-bg-elevated hover:bg-bg-hover flex w-full items-center justify-between px-4 py-4 text-left transition-colors"
				onclick={() => toggleSection('laptop')}
			>
				<div class="flex items-center gap-3">
					<svg class="text-accent-earth-text size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						{#each sectionIcons.Laptop as path (path)}
							<path d={path}></path>
						{/each}
					</svg>
					<h2 class="text-lg font-medium tracking-tighter sm:text-xl">{t('component.uses-page.sections.laptop.title')}</h2>
				</div>
				<svg class="text-muted-foreground size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					{#if expanded['laptop']}
						<path d="m18 15-6-6-6 6"></path>
					{:else}
						<path d="m6 9 6 6 6-6"></path>
					{/if}
				</svg>
			</button>
			{#if expanded['laptop']}
				<div class="p-4 sm:p-6">
					<div class="mb-6">
						<img
							src="/images/uses/ideapad-3i.png"
							alt="Ideapad Gaming 3 R7"
							width="512"
							height="512"
							loading="lazy"
							class="rounded-lg border border-[var(--border-subtle)]"
						/>
					</div>
				</div>
			{/if}
		</div>

		<div class="bg-bg-surface shadow-feature-card mb-8 overflow-hidden rounded-lg border border-[var(--border-subtle)]">
			<button
				type="button"
				class="bg-bg-elevated hover:bg-bg-hover flex w-full items-center justify-between px-4 py-4 text-left transition-colors"
				onclick={() => toggleSection('infra')}
			>
				<div class="flex items-center gap-3">
					<svg class="text-accent-earth-text size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						{#each sectionIcons.Infra as path (path)}
							<path d={path}></path>
						{/each}
					</svg>
					<h2 class="text-lg font-medium tracking-tighter sm:text-xl">{t('component.uses-page.sections.infra-devops.title')}</h2>
				</div>
				<svg class="text-muted-foreground size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					{#if expanded['infra']}
						<path d="m18 15-6-6-6 6"></path>
					{:else}
						<path d="m6 9 6 6 6-6"></path>
					{/if}
				</svg>
			</button>
			{#if expanded['infra']}
				<div class="p-4 sm:p-6">
					<div class="bg-bg-surface my-8 overflow-hidden rounded-lg border border-[var(--border-subtle)]">
						<div class="bg-bg-elevated border-[var(--border-faint)] border-b px-4 py-3">
							<h3 class="flex items-center gap-2 text-sm font-medium sm:text-base">
								<svg class="text-accent-earth-text size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={starPath}></path></svg>
								{t('component.uses-page.sections.infra-devops.comparison-title')}
							</h3>
						</div>
						<div class="overflow-x-auto p-1">
							<table class="border-separate table-fixed w-full min-w-[1100px] border-spacing-0">
								<thead class="bg-bg-elevated">
									<tr>
										<th class="text-muted-foreground w-[16%] px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">{t('component.uses-page.table.headers.tool')}</th>
										<th class="text-muted-foreground w-[34%] px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">{t('component.uses-page.table.headers.pros')}</th>
										<th class="text-muted-foreground w-[34%] px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">{t('component.uses-page.table.headers.cons')}</th>
										<th class="text-muted-foreground w-[10%] px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">{t('component.uses-page.table.headers.price')}</th>
										<th class="text-muted-foreground w-[6%] px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">{t('component.uses-page.table.headers.rating')}</th>
									</tr>
								</thead>
								<tbody class="divide-border divide-y">
									{#each devToolsComparison as item, index (item.name)}
										<tr class="hover:bg-bg-hover transition-colors">
											<td class="border-border/50 border-r px-8 py-6 align-top">
												<div class="mr-4 text-sm leading-relaxed font-medium break-words">{item.name}</div>
											</td>
											<td class="border-border/50 border-r px-8 py-6 align-top">
												<ul class="text-accent-earth-text mr-4 space-y-2 text-xs leading-relaxed">
													{#each item.pros as pro, i (i)}
														<li class="break-words">• {pro}</li>
													{/each}
												</ul>
											</td>
											<td class="border-border/50 border-r px-8 py-6 align-top">
												<ul class="text-muted-foreground mr-4 space-y-2 text-xs leading-relaxed">
													{#each item.cons as con, i (i)}
														<li class="break-words">• {con}</li>
													{/each}
												</ul>
											</td>
											<td class="border-border/50 border-r px-8 py-6 align-top">
												<span class="mr-4 text-sm break-words">{item.price}</span>
											</td>
											<td class="px-8 py-6 align-top">
												<div class="flex flex-col items-start gap-1">
													<div class="flex">
														{#each Array(5) as _, i (i)}
															<svg
																class={`size-3 ${i < item.rating ? 'text-accent-earth-text fill-current' : 'text-muted-foreground/30'}`}
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
																aria-hidden="true"
															><path d={starPath}></path></svg>
														{/each}
													</div>
													<span class="text-muted-foreground text-xs whitespace-nowrap">
														{t('component.uses-page.table.rating-out-of', { rating: item.rating })}
													</span>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
