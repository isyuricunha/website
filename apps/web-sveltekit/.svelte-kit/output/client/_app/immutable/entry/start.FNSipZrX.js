const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      '../chunks/bp2wfkm4.js',
      '../chunks/Ov_AgsIi.js',
      '../chunks/CcCf-tEA.js',
      './payload.DSmR2FwN.js'
    ])
) => i.map((i) => d[i])
import { set_payload as e } from './payload.DSmR2FwN.js'
import { t } from '../chunks/DclECHGd.js'
var n
function r(r) {
  ;(e(r),
    (n ??= t(
      () => import(`../chunks/bp2wfkm4.js`),
      __vite__mapDeps([0, 1, 2, 3]),
      import.meta.url
    )))
}
async function i(...e) {
  return (await n).start(...e)
}
async function a(...e) {
  return (await n).load_css(...e)
}
export { r as init, a as load_css, i as start }
