<script lang="ts">
	import Icon from '#lib/components/simple-icon.svelte'

	let { labels }: { labels: Record<string, string> } = $props()

	const stackIcons = [
		'siDocker',
		'siKubernetes',
		'siNginx',
		'siApache',
		'siGooglecloud',
		'siDigitalocean',
		'siUbuntu',
		'siDebian',
		'siCentos',
		'siRedhat',
		'siMongodb',
		'siMysql',
		'siMariadb',
		'siApachecassandra',
		'siHeroui',
		'siOpenstack',
		'siTerraform',
		'siPuppet',
		'siAnsible',
		'siCloudflare',
		'siVmware',
		'siJenkins',
		'siFirebase',
		'siPostgresql',
		'siRedis',
		'siPrisma',
		'siPrometheus'
	] as const
</script>

<div class="shadow-feature-card bg-bg-surface flex min-h-60 flex-col gap-5 overflow-hidden rounded-lg p-4 lg:p-6">
	<div class="flex items-center gap-2">
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text size-[18px]">
			<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
		</svg>
		<h2 class="text-sm font-medium">{labels.stacks}</h2>
	</div>
	<div class="text-muted-foreground grid grid-cols-7 gap-3">
		{#each stackIcons as name (name)}
			<Icon icon={name} size={20} />
		{/each}
	</div>
</div>
