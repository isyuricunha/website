<script lang="ts">
	import MascotIcon from './mascot-icon.svelte'
	import { type MascotStateController } from './mascot-state.svelte'

	let { isOpen, onClose, mascot }: { isOpen: boolean; onClose: () => void; mascot: MascotStateController } = $props()

	type Difficulty = 'easy' | 'medium' | 'hard'
	type GameMode = 'classic' | 'survival' | 'challenge'

	let score = $state(0)
	let timeLeft = $state(30)
	let isPlaying = $state(false)
	let targetPosition = $state({ x: 50, y: 50 })
	let highScore = $state(0)
	let difficulty = $state<Difficulty>('easy')
	let gameMode = $state<GameMode>('classic')
	let multiplier = $state(1)
	let achievements = $state<string[]>([])
	let multiplierTimeout: ReturnType<typeof setTimeout> | null = null

	// Load persisted high score on mount only (localStorage is browser-only).
	$effect(() => {
		try {
			const saved = globalThis.localStorage?.getItem('vc_mascot_game_high_score')
			highScore = saved ? Number.parseInt(saved) : 0
		} catch {
			highScore = 0
		}
		return () => {
			if (multiplierTimeout) clearTimeout(multiplierTimeout)
		}
	})

	// Game timer - runs continuously without restarting on score changes
	$effect(() => {
		if (!isPlaying) return
		const timer = setInterval(() => {
			if (timeLeft <= 1) {
				isPlaying = false
				timeLeft = 0
				return
			}
			timeLeft = timeLeft - 1
		}, 1000)
		return () => clearInterval(timer)
	})

	function getDifficultySettings() {
		switch (difficulty) {
			case 'easy':
				return { size: 48, speed: 1000, scoreMultiplier: 1 }
			case 'medium':
				return { size: 32, speed: 800, scoreMultiplier: 2 }
			case 'hard':
				return { size: 24, speed: 600, scoreMultiplier: 3 }
			default:
				return { size: 48, speed: 1000, scoreMultiplier: 1 }
		}
	}

	function moveTarget() {
		const x = Math.random() * 80 + 10 // 10% to 90%
		const y = Math.random() * 80 + 10 // 10% to 90%
		targetPosition = { x, y }

		// Challenge mode: occasional multiplier boost
		const boostRoll = Math.random()
		if (boostRoll < 0.05) {
			if (gameMode !== 'challenge') return
			multiplier = 2
			if (multiplierTimeout) clearTimeout(multiplierTimeout)
			multiplierTimeout = setTimeout(() => {
				multiplier = 1
				multiplierTimeout = null
			}, 3000)
		}
	}

	function saveHighScore(value: number) {
		try {
			globalThis.localStorage?.setItem('vc_mascot_game_high_score', value.toString())
		} catch {
			// Ignore localStorage errors
		}
	}

	function startGame() {
		score = 0
		timeLeft = gameMode === 'survival' ? 60 : 30
		isPlaying = true
		multiplier = 1
		moveTarget()
	}

	function handleTargetClick() {
		if (!isPlaying) return

		const settings = getDifficultySettings()
		const basePoints = settings.scoreMultiplier * multiplier
		const nextScore = score + basePoints
		score = nextScore
		if (nextScore > highScore) {
			highScore = nextScore
			saveHighScore(nextScore)
		}
		moveTarget()

		// Survival mode: time decreases faster as score increases
		if (gameMode === 'survival') {
			timeLeft = Math.max(1, timeLeft - Math.floor(score / 10))
		}

		// Check for achievements
		if (nextScore === 10 && !achievements.includes('first_10')) {
			achievements = [...achievements, 'first_10']
		}
		if (nextScore === 50 && !achievements.includes('speed_demon')) {
			achievements = [...achievements, 'speed_demon']
		}
	}

	const targetSize = $derived(getDifficultySettings().size)
</script>

{#if isOpen}
	<div class="bg-bg-base/80 fixed inset-0 z-50 flex items-center justify-center">
		<div class="bg-popover text-popover-foreground relative w-96 max-w-[90vw] rounded-lg border p-6 shadow-lg">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">{mascot.t('mascot.game.title')}</h2>
				<button
					type="button"
					aria-label={mascot.t('mascot.game.close')}
					class="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none rounded p-1 transition-colors"
					onclick={onClose}
				>
					<MascotIcon name="x" size={16} />
				</button>
			</div>

			<div class="mb-4 flex items-center justify-between text-sm">
				<div class="flex items-center gap-4">
					<span>{mascot.t('mascot.game.score')}: {score}</span>
					<span>{mascot.t('mascot.game.time')}: {timeLeft}s</span>
				</div>
				<div class="flex items-center gap-1">
					<MascotIcon name="trophy" size={16} class="text-accent-earth-text" />
					<span class="text-sm">{highScore}</span>
				</div>
			</div>

			<!-- Game Settings -->
			<div class="mb-4 space-y-3">
				<div class="flex items-center justify-between">
					<label for="difficulty-select" class="text-sm font-medium">
						{mascot.t('mascot.game.difficulty.label')}
					</label>
					<select
						id="difficulty-select"
						bind:value={difficulty}
						aria-label={mascot.t('mascot.game.difficulty.aria')}
						class="h-9 w-28 rounded border text-xs"
					>
						<option value="easy">{mascot.t('mascot.game.difficulty.options.easy')}</option>
						<option value="medium">{mascot.t('mascot.game.difficulty.options.medium')}</option>
						<option value="hard">{mascot.t('mascot.game.difficulty.options.hard')}</option>
					</select>
				</div>
				<div class="flex items-center justify-between">
					<label for="mode-select" class="text-sm font-medium">
						{mascot.t('mascot.game.mode.label')}
					</label>
					<select
						id="mode-select"
						bind:value={gameMode}
						aria-label={mascot.t('mascot.game.mode.aria')}
						class="h-9 w-32 rounded border text-xs"
					>
						<option value="classic">{mascot.t('mascot.game.mode.options.classic')}</option>
						<option value="survival">{mascot.t('mascot.game.mode.options.survival')}</option>
						<option value="challenge">{mascot.t('mascot.game.mode.options.challenge')}</option>
					</select>
				</div>
			</div>

			{#if isPlaying}
				<div class="bg-muted relative h-64 w-full rounded border">
					<button
						type="button"
						class="bg-accent-earth focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none hover:bg-accent-earth-hover absolute rounded-full transition-colors {multiplier > 1
							? 'animate-pulse bg-[var(--accent-dim)]'
							: ''}"
						style="left: {targetPosition.x}%; top: {targetPosition.y}%; transform: translate(-50%, -50%); width: {targetSize}px; height: {targetSize}px;"
						onclick={handleTargetClick}
						aria-label={mascot.t('mascot.game.clickTarget')}
					>
					</button>
					{#if multiplier > 1}
						<div class="text-accent-earth-text absolute top-2 left-2 rounded bg-[var(--accent-dim)] px-2 py-1 text-xs font-medium">
							{multiplier}x
						</div>
					{/if}
				</div>
			{:else}
				<div class="text-center">
					<p class="text-muted-foreground mb-4 text-sm">
						{timeLeft === 0
							? mascot.t('mascot.game.gameOver', { score })
							: mascot.t('mascot.game.instructions')}
					</p>
					<button
						type="button"
						class="bg-accent-earth text-text-inverse hover:bg-accent-earth-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none rounded px-4 py-2 text-sm font-medium transition-colors"
						onclick={startGame}
					>
						{mascot.t(timeLeft === 0 ? 'mascot.game.playAgain' : 'mascot.game.start')}
					</button>
				</div>
			{/if}

			<div class="mt-4 text-center">
				<p class="text-muted-foreground text-xs">{mascot.t('mascot.game.highScore')}: {highScore}</p>
			</div>
		</div>
	</div>
{/if}
