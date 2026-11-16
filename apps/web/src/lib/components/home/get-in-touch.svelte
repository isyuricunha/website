<script lang="ts">
	type Props = {
		strings: {
			label: string
			title: string
			description: string
			availability: string
			imageAlt: string
			codeStatus: string
			codeEmail: string
			codeTimezone: string
		}
	}

	let { strings }: Props = $props()
</script>

<section class="editorial-section">
	<div class="editorial-text">
		<span class="label-mono">{strings.label}</span>
		<h2>{strings.title}</h2>
		<p>{strings.description}</p>
		<a href="mailto:me@yuricunha.com" class="cta-link">
			me@yuricunha.com
			{' '}
			<span class="yu-arrow" aria-hidden="true">&rarr;</span>
		</a>
	</div>

	<div class="app-window">
		<div class="app-window-chrome">
			<span class="window-dot"></span>
			<span class="window-dot"></span>
			<span class="window-dot"></span>
			<span class="label-mono ml-2 normal-case">{strings.availability}</span>
		</div>
		<div class="grid gap-6 p-6 sm:grid-cols-[180px_1fr] sm:p-8">
			<div class="bg-bg-surface relative aspect-square overflow-hidden rounded-lg">
				<img
					src="/images/me.png"
					alt={strings.imageAlt}
					width="3975"
					height="3975"
					loading="lazy"
					class="absolute inset-0 h-full w-full object-cover brightness-[0.82] saturate-[0.85]"
				/>
			</div>
			<div class="code-block self-center">
				<div>{strings.codeStatus}</div>
				<div>{strings.codeEmail}</div>
				<div>{strings.codeTimezone}</div>
			</div>
		</div>
	</div>
</section>
