export const index = 0
let component_cache
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default)
export const imports = ['_app/immutable/nodes/0.3gjI7Omo.js', '_app/immutable/chunks/Ov_AgsIi.js']
export const stylesheets = ['_app/immutable/assets/0.Bi6MY8kg.css']
export const fonts = []
