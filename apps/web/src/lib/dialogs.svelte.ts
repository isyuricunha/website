/**
 * Global dialog state shared by header controls, the mascot and page
 * components. Mirrors the original dialogs store contract.
 */
export const dialogs = $state({
  isSignInOpen: false
})

export function openSignIn(): void {
  dialogs.isSignInOpen = true
}

export function closeSignIn(): void {
  dialogs.isSignInOpen = false
}
