<script lang="ts">
	let { title, description, labels }: { title: string; description: string; labels: Record<string, string> } = $props()
</script>

<div class="mb-8 flex items-center justify-between border-b-[0.5px] border-[var(--border-faint)] pb-8">
	<div class="space-y-2">
		<span class="label-mono">{labels['common.admin-label']}</span>
		<h2 class="text-[clamp(28px,3vw,36px)] font-medium tracking-tighter">{title}</h2>
		<p class="text-text-secondary max-w-2xl text-[15px] leading-relaxed">{description}</p>
	</div>
</div>
