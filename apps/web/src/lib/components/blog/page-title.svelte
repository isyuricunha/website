<script lang="ts">
	let { title, description, animate = true }: { title: string; description: string; animate?: boolean } = $props()
</script>

<div class="mt-6 mb-16 border-b-[0.5px] border-[var(--border-faint)] pb-10 sm:mt-12 sm:mb-24 sm:pb-14">
	<h1 class="my-4 text-[clamp(32px,4vw,52px)] font-normal tracking-tighter {animate ? 'page-title-reveal' : ''}">
		{title}
	</h1>
	<h2 class="text-text-secondary mb-8 max-w-2xl text-sm leading-relaxed sm:text-[15px] {animate ? 'page-title-reveal page-title-delay' : ''}">
		{description}
	</h2>
</div>

<style>
	@keyframes pageTitleUp {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.page-title-reveal {
		animation: pageTitleUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
	}

	.page-title-delay {
		animation-delay: 0.08s;
	}

	@media (prefers-reduced-motion: reduce) {
		.page-title-reveal {
			animation: none;
		}
	}
</style>
