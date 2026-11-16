<script lang="ts">
	import createGlobe from 'cobe'
	import { onMount } from 'svelte'

	let { labels }: { labels: Record<string, string> } = $props()

	let canvas = $state<HTMLCanvasElement | undefined>()
	let fadeMask = 'radial-gradient(circle at 50% 50%, rgb(0, 0, 0) 60%, rgb(0, 0, 0, 0) 70%)'
	let pointerInteracting: { x: number; y: number } | null = null
	let rotation = { r: 0, v: 0 }
	let rotationTarget = { r: 0, v: 0 }

	onMount(() => {
		const canvasEl = canvas
		if (!canvasEl) return
		let width = canvasEl.offsetWidth
		const onResize = () => {
			width = canvasEl.offsetWidth
		}
		onResize()
		const resizeObserver = new ResizeObserver(onResize)
		resizeObserver.observe(canvasEl)

		const globe = createGlobe(canvasEl, {
			devicePixelRatio: 2,
			width: width * 2,
			height: width * 2,
			phi: 4.75,
			theta: 0,
			dark: 1,
			diffuse: 2,
			mapSamples: 12_000,
			mapBrightness: 2,
			baseColor: [0.61, 0.56, 0.5],
			markerColor: [0.79, 0.34, 0.16],
			glowColor: [0.79, 0.34, 0.16],
			markers: [{ location: [-23.5505, -46.6333], size: 0.1 }],
			scale: 0.75,
			onRender: (state: Record<string, number>) => {
				rotation.r += (rotationTarget.r - rotation.r) * 0.12
				rotation.v += (rotationTarget.v - rotation.v) * 0.12

				state.phi = 4.75 + rotation.r
				state.theta = 0 + rotation.v
				state.width = width * 3
				state.height = width * 3
			}
		} as Parameters<typeof createGlobe>[1])

		return () => {
			globe.destroy()
			resizeObserver.disconnect()
		}
	})

	function pointerDown(event: PointerEvent) {
		pointerInteracting = { x: event.clientX, y: event.clientY }
		if (canvas) canvas.style.cursor = 'grabbing'
	}

	function pointerUpOrOut() {
		pointerInteracting = null
		if (canvas) canvas.style.cursor = 'grab'
	}

	function pointerMove(event: PointerEvent) {
		if (!pointerInteracting) return
		const deltaX = event.clientX - pointerInteracting.x
		const deltaY = event.clientY - pointerInteracting.y
		pointerInteracting = { x: event.clientX, y: event.clientY }
		rotationTarget = {
			r: rotationTarget.r + deltaX / 200,
			v: rotationTarget.v + deltaY / 200
		}
	}

	function touchStart(event: TouchEvent) {
		const touch = event.touches[0]
		if (!touch) return
		pointerInteracting = { x: touch.clientX, y: touch.clientY }
		if (canvas) canvas.style.cursor = 'grabbing'
	}

	function touchMove(event: TouchEvent) {
		const touch = event.touches[0]
		if (!touch || !pointerInteracting) return
		const deltaX = touch.clientX - pointerInteracting.x
		const deltaY = touch.clientY - pointerInteracting.y
		pointerInteracting = { x: touch.clientX, y: touch.clientY }
		rotationTarget = {
			r: rotationTarget.r + deltaX / 100,
			v: rotationTarget.v + deltaY / 100
		}
	}
</script>

<div class="shadow-feature-card bg-bg-surface relative flex h-60 flex-col gap-6 overflow-hidden rounded-lg p-4 lg:p-6">
	<div class="flex items-center gap-2">
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-accent-earth-text size-[18px]">
			<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
			<circle cx="12" cy="10" r="3" />
		</svg>
		<h2 class="text-sm font-medium">{labels['about-me.location']}</h2>
	</div>
	<div class="absolute inset-x-0 bottom-[-190px] mx-auto aspect-square h-[388px] [@media(max-width:420px)]:bottom-[-140px] [@media(max-width:420px)]:h-[320px] [@media(min-width:768px)_and_(max-width:858px)]:h-[350px]">
		<div style="width: 100%; height: 100%; display: flex; place-items: center; place-content: center; overflow: visible;">
			<div style="width: 100%; aspect-ratio: 1/1; max-width: 800px; -webkit-mask-image: {fadeMask}; mask-image: {fadeMask};">
				<canvas
					bind:this={canvas}
					onpointerdown={pointerDown}
					onpointerup={pointerUpOrOut}
					onpointerout={pointerUpOrOut}
					onpointermove={pointerMove}
					ontouchstart={touchStart}
					ontouchmove={touchMove}
					style="width: 100%; height: 100%; contain: layout paint size; cursor: grab; user-select: none;"
				></canvas>
			</div>
		</div>
	</div>
</div>
