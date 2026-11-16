<script lang="ts">
	type Props = {
		strings: {
			locationTimezone: string
			titleTop: string
			titleMiddleLeft: string
			titleMiddleRight: string
			amazing: string
			titleBottom: string
			description: string
			viewProjects: string
			readBlog: string
			codeDatabaseSpecialist: string
			codeRegion: string
			codeFocus: string
			siteTitle: string
		}
		reversedTitleOrder: boolean
	}

	let { strings, reversedTitleOrder }: Props = $props()
</script>

<section class="relative grid min-h-[calc(100vh-10rem)] items-center gap-12 overflow-x-clip py-16 sm:py-20 lg:grid-cols-[1fr_0.7fr] lg:py-24">
	<div class="yu-rise yu-d1 flex flex-col items-start gap-6">
		<span class="label-mono">{strings.locationTimezone}</span>
		<h1 class="max-w-4xl text-[clamp(32px,4vw,52px)] font-normal tracking-tighter text-balance">
			<span>{strings.titleTop}</span>
			{' '}
			<span>{strings.titleMiddleLeft}</span>
			{' '}
			{#if reversedTitleOrder}
				<span>{strings.titleMiddleRight}</span>
				{' '}
				<span class="yu-shimmer-gold">{strings.amazing}</span>
			{:else}
				<span class="yu-shimmer-gold">{strings.amazing}</span>
				{' '}
				<span>{strings.titleMiddleRight}</span>
			{/if}
			{' '}
			<span>{strings.titleBottom}</span>
		</h1>
		<p class="text-muted-foreground max-w-xl text-[15px] leading-relaxed">
			{strings.description}
		</p>

		<div class="flex flex-col gap-3 sm:flex-row">
			<a
				href="/projects"
				class="border-accent-earth-hover bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex min-h-9 items-center justify-center rounded-md border px-5 py-2 text-[13px] font-medium transition-colors"
			>
				{strings.viewProjects}
			</a>
			<a
				href="/blog"
				class="text-muted-foreground hover:bg-bg-hover hover:text-foreground inline-flex min-h-9 items-center justify-center rounded-md border border-[var(--border-default)] px-5 py-2 text-[13px] font-medium transition-colors hover:border-[var(--border-strong)]"
			>
				{strings.readBlog}
			</a>
		</div>
	</div>

	<div class="yu-rise yu-d2 relative mx-auto w-full max-w-sm">
		<div class="yu-glow" aria-hidden="true"></div>
		<div class="app-window w-full">
			<div class="app-window-chrome">
				<span class="window-dot"></span>
				<span class="window-dot"></span>
				<span class="window-dot"></span>
			</div>
			<div class="flex flex-col items-center gap-6 p-8">
				<div class="relative size-28">
					<img
						src="/images/avatar.png"
						alt={strings.siteTitle}
						width="112"
						height="112"
						loading="eager"
						class="absolute inset-0 h-full w-full rounded-lg object-cover"
					/>
				</div>
				<div class="code-block w-full">
					<div class="text-text-tertiary">{strings.codeDatabaseSpecialist}</div>
					<div>{strings.codeRegion}</div>
					<div>
						{strings.codeFocus}
						<span class="yu-caret" aria-hidden="true"></span>
					</div>
				</div>
				<p class="text-muted-foreground text-center text-sm">
					{strings.locationTimezone}
				</p>
			</div>
		</div>
	</div>
</section>
