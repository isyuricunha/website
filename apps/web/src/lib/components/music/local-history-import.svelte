<script lang="ts">
	import { flags } from '#lib/flags.ts'

	let { labels }: { labels: Record<string, string> } = $props()

	// Simple parser for Spotify extended streaming history JSON files (array of
	// plays). Runs entirely client-side; no upload.
	const MAX_IMPORT_BYTES = 100 * 1024 * 1024

	type LocalPlay = {
		ts: string
		master_metadata_track_name?: string
		master_metadata_album_artist_name?: string
		master_metadata_album_album_name?: string
		ms_played?: number
	}

	let count = $state<number | null>(null)
	let artists = $state<number | null>(null)
	let durationMs = $state<number | null>(null)
	let error = $state<string | null>(null)

	async function onFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement
		const file = input.files?.[0]
		try {
			error = null
			if (!file) return
			if (file.size > MAX_IMPORT_BYTES) {
				throw new Error(labels['import.file-too-large'] || 'This file is too large to parse.')
			}
			const text = await file.text()
			const data: unknown = JSON.parse(text)
			if (!Array.isArray(data)) throw new Error(labels['import.invalid-file'])
			const list = data as LocalPlay[]
			count = list.length
			const artistSet = new Set<string>()
			let total = 0
			for (const play of list) {
				if (play.master_metadata_album_artist_name)
					artistSet.add(play.master_metadata_album_artist_name)
				total += play.ms_played ?? 0
			}
			artists = artistSet.size
			durationMs = total
		} catch (error_) {
			error = error_ instanceof Error ? error_.message : labels['import.parse-error']
		}
	}
</script>

{#if flags.lastfmImport}
	<div class="bg-bg-surface rounded-lg border border-[var(--border-subtle)]">
		<div class="p-6 pb-0">
			<h3 class="text-base font-medium sm:text-lg">{labels['import.title']}</h3>
			<p class="text-text-secondary text-xs sm:text-sm">{labels['import.subtitle']}</p>
		</div>
		<div class="p-6">
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<label for="musicHistoryFile" class="text-sm">{labels['import.choose']}</label>
					<input
						id="musicHistoryFile"
						type="file"
						accept="application/json"
						onchange={onFile}
						class="bg-bg-hover rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm"
					/>
				</div>
				{#if error}<p class="text-destructive text-sm">{error}</p>{/if}
				{#if count !== null}
					<div class="grid grid-cols-3 gap-3">
						<div class="bg-bg-hover rounded p-3">
							<div class="text-text-secondary text-xs">{labels['import.plays']}</div>
							<div class="text-lg font-medium">{count}</div>
						</div>
						<div class="bg-bg-hover rounded p-3">
							<div class="text-text-secondary text-xs">{labels['import.artists']}</div>
							<div class="text-lg font-medium">{artists ?? '—'}</div>
						</div>
						<div class="bg-bg-hover rounded p-3">
							<div class="text-text-secondary text-xs">{labels['import.duration']}</div>
							<div class="text-lg font-medium">
								{durationMs ? Math.round(durationMs / 3_600_000) + 'h' : '—'}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
