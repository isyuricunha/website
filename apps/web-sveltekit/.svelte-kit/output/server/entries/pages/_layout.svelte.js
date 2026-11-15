import '../../chunks/server.js'
// src/routes/+layout.svelte
function _layout($$renderer, $$props) {
  let { children } = $$props
  children($$renderer)
  $$renderer.push(`<!---->`)
}
export { _layout as default }

//# sourceMappingURL=_layout.svelte.js.map
