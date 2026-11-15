import { i as escape_html } from '../../chunks/server.js'
// src/routes/+page.svelte
function _page($$renderer, $$props) {
  let { data } = $$props
  $$renderer.push(
    `<main><h1>yuricunha.com</h1> <p>SvelteKit migration scaffold. Parity work in progress.</p> <pre>${escape_html(JSON.stringify(data ?? {}, null, 2))}</pre></main>`
  )
}
export { _page as default }

//# sourceMappingURL=_page.svelte.js.map
