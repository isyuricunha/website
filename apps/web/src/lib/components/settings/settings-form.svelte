<script lang="ts">
	import { authClient, useSession } from '#lib/auth-client.ts'
	import { trpc } from '#lib/trpc-client.ts'
	import { getAvatarAbbreviation } from '@isyuricunha/trpc-server/utils/get-avatar-abbreviation'
	import { getDefaultImage } from '@isyuricunha/trpc-server/utils/get-default-image'
	import { toastError, toastSuccess } from '#lib/toasts.svelte.ts'
	import PrivacyControls from '#lib/components/account/privacy-controls.svelte'

	let { labels }: { labels: Record<string, string> } = $props()

	const session = useSession()

	type ProfileForm = {
		image: string
		bio: string
		username: string
		isPublic: boolean
		nameColor: string
		nameEffect: string
	}

	let user = $derived(
		(
			$session.data?.user as
				| {
						id: string
						name?: string | null
						email?: string | null
						image?: string | null
						bio?: string | null
						username?: string | null
						isPublic?: boolean
						nameColor?: string | null
						nameEffect?: string | null
						isAnonymous?: boolean
						emailVerified?: boolean
						role?: string
				  }
				| null
				| undefined
		) ?? null
	)

	let profileForm = $state<ProfileForm>({
		image: '',
		bio: '',
		username: '',
		isPublic: true,
		nameColor: '',
		nameEffect: 'none'
	})

	// Re-sync the form when the session loads or the user changes (the React
	// version keyed state on a user-derived source key).
	$effect(() => {
		if (!user) return
		profileForm = {
			image: user.image ?? '',
			bio: user.bio ?? '',
			username: user.username ?? '',
			isPublic: user.isPublic ?? true,
			nameColor: user.nameColor ?? '',
			nameEffect: user.nameEffect ?? 'none'
		}
	})

	let emailForm = $state({ newEmail: '' })
	let passwordForm = $state({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
	let avatarFile = $state<File | null>(null)
	let avatarPending = $state(false)
	let isSavingProfile = $state(false)
	let isSavingEmail = $state(false)
	let isSavingPassword = $state(false)

	let defaultImage = $derived(user ? getDefaultImage(user.id) : null)
	let effectiveImage = $derived(profileForm.image || defaultImage || '')
	let isAnonymous = $derived(user?.isAnonymous === true)

	function saveProfile() {
		if (!user) return
		isSavingProfile = true
		authClient
			.updateUser({
				bio: profileForm.bio || undefined,
				username: profileForm.username || undefined,
				isPublic: profileForm.isPublic,
				nameColor: profileForm.nameColor || undefined,
				nameEffect: profileForm.nameEffect,
				image: profileForm.image || undefined
			})
			.then(({ error }) => {
				if (error) {
					toastError(error.message ?? labels['common.unknown-error'])
					return
				}
				toastSuccess(labels['messages.profile-updated'])
			})
			.catch((error: unknown) => {
				toastError(error instanceof Error ? error.message : labels['common.unknown-error'])
			})
			.finally(() => (isSavingProfile = false))
	}

	function uploadAvatar() {
		if (!user) return

		if (!avatarFile) {
			toastError(labels['messages.avatar-file-required'])
			return
		}

		if (!['image/png', 'image/jpeg', 'image/webp'].includes(avatarFile.type)) {
			toastError(labels['messages.avatar-invalid-type'])
			return
		}

		if (avatarFile.size > 5 * 1024 * 1024) {
			toastError(labels['messages.avatar-too-large'])
			return
		}

		avatarPending = true
		trpc.users.createAvatarUploadUrl
			.mutate({
				contentType: avatarFile.type as 'image/png' | 'image/jpeg' | 'image/webp',
				size: avatarFile.size
			})
			.then(async (result) => {
				const uploadResponse = await fetch(result.uploadUrl, {
					method: 'PUT',
					headers: result.requiredHeaders,
					body: avatarFile
				})

				if (!uploadResponse.ok) {
					throw new Error(`Upload failed with status ${uploadResponse.status}`)
				}

				const { error } = await authClient.updateUser({
					image: result.publicUrl
				})

				if (error) {
					toastError(error.message ?? labels['common.unknown-error'])
					return
				}

				toastSuccess(labels['messages.avatar-updated'])
				avatarFile = null
				profileForm = { ...profileForm, image: result.publicUrl }
			})
			.catch((error: unknown) => {
				toastError(error instanceof Error ? error.message : labels['common.unknown-error'])
			})
			.finally(() => (avatarPending = false))
	}

	function submitChangeEmail() {
		const newEmail = emailForm.newEmail.trim()
		if (!newEmail) {
			toastError(labels['messages.email-required'])
			return
		}

		isSavingEmail = true
		authClient
			.changeEmail({
				newEmail,
				callbackURL: '/settings'
			})
			.then(({ error }) => {
				if (error) {
					toastError(error.message ?? labels['common.unknown-error'])
					return
				}
				toastSuccess(labels['messages.email-verification-sent'])
				emailForm = { newEmail: '' }
			})
			.catch((error: unknown) => {
				toastError(error instanceof Error ? error.message : labels['common.unknown-error'])
			})
			.finally(() => (isSavingEmail = false))
	}

	function submitChangePassword() {
		if (!passwordForm.currentPassword) {
			toastError(labels['messages.current-password-required'])
			return
		}

		if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
			toastError(labels['messages.password-too-short'])
			return
		}

		if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
			toastError(labels['messages.passwords-do-not-match'])
			return
		}

		isSavingPassword = true
		authClient
			.changePassword({
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword,
				revokeOtherSessions: true
			})
			.then(({ error }) => {
				if (error) {
					toastError(error.message ?? labels['common.unknown-error'])
					return
				}
				toastSuccess(labels['messages.password-updated'])
				passwordForm = { currentPassword: '', newPassword: '', confirmNewPassword: '' }
			})
			.catch((error: unknown) => {
				toastError(error instanceof Error ? error.message : labels['common.unknown-error'])
			})
			.finally(() => (isSavingPassword = false))
	}

	let privacyLabels = $derived(
		Object.fromEntries(
			Object.entries(labels)
				.filter(([key]) => key.startsWith('privacy.'))
				.map(([key, value]) => [key.replace('privacy.', ''), value])
		)
	)
</script>

{#if $session.isPending}
	<p class="text-muted-foreground" role="status">{labels.description}</p>
{:else if !$session.data}
	<div class="space-y-2" role="status">
		<h3 class="text-lg font-semibold">{labels.title}</h3>
		<p class="text-muted-foreground text-sm">{labels['sign-in']}</p>
	</div>
{:else if user}
	<div class="space-y-10">
		<section id="profile" class="space-y-4">
			<div>
				<h3 class="text-lg font-semibold">{labels['sections.profile']}</h3>
				<p class="text-muted-foreground text-sm">{labels['sections.profile-description']}</p>
			</div>

			<div class="flex items-center gap-4">
				<div class="bg-bg-hover text-text-secondary flex size-12 items-center justify-center overflow-hidden rounded-full text-sm font-medium">
					{#if effectiveImage}
						<img src={effectiveImage} alt={user.name ?? ''} class="size-12 object-cover" />
					{:else}
						{getAvatarAbbreviation(user.name ?? '')}
					{/if}
				</div>
				<div class="flex-1">
					<label for="image" class="text-sm font-medium">{labels['fields.avatar-url']}</label>
					<input
						id="image"
						type="url"
						bind:value={profileForm.image}
						disabled={isAnonymous}
						placeholder={labels['fields.avatar-url-placeholder']}
						class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
					/>
					<div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
						<div class="flex-1">
							<label for="avatarFile" class="text-sm font-medium">
								{labels['fields.avatar-upload']}
							</label>
							<input
								id="avatarFile"
								type="file"
								accept="image/png,image/jpeg,image/webp"
								disabled={isAnonymous || avatarPending}
								onchange={(e) => (avatarFile = e.currentTarget.files?.[0] ?? null)}
								class="bg-bg-hover mt-1 w-full rounded-md border border-[var(--border-faint)] px-3 py-1.5 text-sm"
							/>
						</div>
						<button
							type="button"
							class="bg-bg-surface hover:bg-bg-hover rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
							disabled={isAnonymous || avatarPending || !avatarFile}
							onclick={uploadAvatar}
						>
							{labels['actions.upload-avatar']}
						</button>
					</div>
					{#if isAnonymous}
						<p class="text-muted-foreground mt-1 text-xs">
							{labels['messages.anonymous-avatar-restriction']}
						</p>
					{/if}
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<label for="username" class="text-sm font-medium">{labels['fields.username']}</label>
					<input
						id="username"
						bind:value={profileForm.username}
						placeholder={labels['fields.username-placeholder']}
						class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<label for="isPublic" class="text-sm font-medium">
						{labels['fields.public-profile']}
					</label>
					<select
						id="isPublic"
						bind:value={profileForm.isPublic}
						class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
					>
						<option value={true}>{labels['fields.public']}</option>
						<option value={false}>{labels['fields.private']}</option>
					</select>
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<label for="nameColor" class="text-sm font-medium">{labels['fields.name-color']}</label>
					<input
						id="nameColor"
						bind:value={profileForm.nameColor}
						placeholder={labels['fields.name-color-placeholder']}
						class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<label for="nameEffect" class="text-sm font-medium">
						{labels['fields.name-effect']}
					</label>
					<select
						id="nameEffect"
						bind:value={profileForm.nameEffect}
						class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
					>
						<option value="none">{labels['effects.none']}</option>
						<option value="rays">{labels['effects.rays']}</option>
						<option value="glow">{labels['effects.glow']}</option>
					</select>
				</div>
			</div>

			<div class="space-y-2">
				<label for="bio" class="text-sm font-medium">{labels['fields.bio']}</label>
				<textarea
					id="bio"
					bind:value={profileForm.bio}
					placeholder={labels['fields.bio-placeholder']}
					rows="3"
					class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
				></textarea>
			</div>

			<div class="flex justify-end">
				<button
					type="button"
					class="bg-accent-earth text-text-inverse rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
					onclick={saveProfile}
					disabled={isSavingProfile}
				>
					{labels['actions.save-profile']}
				</button>
			</div>
		</section>

		<section id="security" class="space-y-4">
			<div>
				<h3 class="text-lg font-semibold">{labels['sections.security']}</h3>
				<p class="text-muted-foreground text-sm">{labels['sections.security-description']}</p>
			</div>

			<div class="space-y-2">
				<label for="newEmail" class="text-sm font-medium">{labels['fields.new-email']}</label>
				<input
					id="newEmail"
					type="email"
					bind:value={emailForm.newEmail}
					placeholder={labels['fields.new-email-placeholder']}
					class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
				/>
			</div>

			<div class="flex justify-end">
				<button
					type="button"
					class="bg-bg-hover hover:bg-bg-base rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
					onclick={submitChangeEmail}
					disabled={isSavingEmail}
				>
					{labels['actions.change-email']}
				</button>
			</div>

			<div class="grid gap-4 sm:grid-cols-3">
				<div class="space-y-2">
					<label for="currentPassword" class="text-sm font-medium">
						{labels['fields.current-password']}
					</label>
					<input
						id="currentPassword"
						type="password"
						bind:value={passwordForm.currentPassword}
						class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
					/>
				</div>
				<div class="space-y-2">
					<label for="newPassword" class="text-sm font-medium">{labels['fields.new-password']}</label>
					<input
						id="newPassword"
						type="password"
						bind:value={passwordForm.newPassword}
						class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
					/>
				</div>
				<div class="space-y-2">
					<label for="confirmNewPassword" class="text-sm font-medium">
						{labels['fields.confirm-new-password']}
					</label>
					<input
						id="confirmNewPassword"
						type="password"
						bind:value={passwordForm.confirmNewPassword}
						class="bg-bg-hover w-full rounded-md border border-[var(--border-faint)] px-3 py-2 text-sm"
					/>
				</div>
			</div>

			<div class="flex justify-end">
				<button
					type="button"
					class="bg-bg-hover hover:bg-bg-base rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
					onclick={submitChangePassword}
					disabled={isSavingPassword}
				>
					{labels['actions.change-password']}
				</button>
			</div>
		</section>

		<PrivacyControls
			email={user.email ?? ''}
			canDelete={user.role === 'user' && Boolean(user.emailVerified) && !user.isAnonymous}
			labels={privacyLabels}
		/>
	</div>
{/if}
