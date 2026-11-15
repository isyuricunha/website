import {
  C as e,
  D as t,
  E as n,
  O as r,
  S as i,
  T as a,
  _ as o,
  a as s,
  b as c,
  c as l,
  d as u,
  f as d,
  g as f,
  h as p,
  i as m,
  k as h,
  l as g,
  m as _,
  n as v,
  p as y,
  r as b,
  s as x,
  t as ee,
  u as te,
  v as ne,
  w as S,
  y as re
} from './Ov_AgsIi.js'
import {
  a as ie,
  c as ae,
  d as oe,
  g as se,
  i as ce,
  l as le,
  n as ue,
  o as de,
  r as fe,
  s as pe,
  t as me,
  u as C
} from './CcCf-tEA.js'
import { payload as he } from '../entry/payload.DSmR2FwN.js'
var ge = class {
    constructor(e) {
      ;((this.status = e.status), (this.body = e))
    }
    toString() {
      return JSON.stringify(this.body)
    }
  },
  _e = class extends ge {},
  ve = class {
    constructor(e, t) {
      try {
        new Headers({ location: t })
      } catch {
        throw Error(
          `Invalid redirect location ${JSON.stringify(t)}: this string contains characters that cannot be used in HTTP headers`
        )
      }
      ;((this.status = e), (this.location = t))
    }
  },
  ye = class extends Error {
    constructor(e, t, n) {
      ;(super(n), (this.status = e), (this.text = t))
    }
  }
function be(...e) {
  let t = 5381
  for (let n of e)
    if (typeof n == `string`) {
      let e = n.length
      for (; e;) t = (t * 33) ^ n.charCodeAt(--e)
    } else if (ArrayBuffer.isView(n)) {
      let e = new Uint8Array(n.buffer, n.byteOffset, n.byteLength),
        r = e.length
      for (; r;) t = (t * 33) ^ e[--r]
    } else throw TypeError(`value must be a string or TypedArray`)
  return (t >>> 0).toString(36)
}
function xe(e, t) {
  let n = []
  return (e && n.push([...new Headers(e)].join(`,`)), t && n.push(t), be(...n))
}
;(new TextEncoder(), new TextDecoder())
function Se(e) {
  let t = atob(e),
    n = new Uint8Array(t.length)
  for (let e = 0; e < t.length; e++) n[e] = t.charCodeAt(e)
  return n
}
var Ce = 2 ** 32 - 1,
  we = Ce - 1,
  w = class extends Error {
    constructor(e, t, n, r) {
      ;(super(e),
        (this.name = `DevalueError`),
        (this.path = t.join(``)),
        (this.value = n),
        (this.root = r))
    }
  },
  Te = Object.getOwnPropertyNames(Object.prototype).sort().join(`\0`)
function Ee(e) {
  let t = Object.getPrototypeOf(e)
  return (
    t === Object.prototype ||
    t === null ||
    Object.getPrototypeOf(t) === null ||
    Object.getOwnPropertyNames(t).sort().join(`\0`) === Te
  )
}
function De(e) {
  return Object.prototype.toString.call(e).slice(8, -1)
}
function Oe(e) {
  return typeof Buffer < `u` && Buffer.isBuffer(e)
}
function ke(e) {
  switch (e) {
    case `"`:
      return `\\"`
    case `<`:
      return `\\u003C`
    case `\\`:
      return `\\\\`
    case `
`:
      return `\\n`
    case `\r`:
      return `\\r`
    case `	`:
      return `\\t`
    case `\b`:
      return `\\b`
    case `\f`:
      return `\\f`
    case `\u2028`:
      return `\\u2028`
    case `\u2029`:
      return `\\u2029`
    default:
      return e < ` ` ? `\\u${e.charCodeAt(0).toString(16).padStart(4, `0`)}` : ``
  }
}
function T(e) {
  let t = ``,
    n = 0,
    r = e.length
  for (let i = 0; i < r; i += 1) {
    let r = e[i],
      a = ke(r)
    a && ((t += e.slice(n, i) + a), (n = i + 1))
  }
  return `"${n === 0 ? e : t + e.slice(n)}"`
}
function Ae(e) {
  return Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
}
var je = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/
function Me(e) {
  return je.test(e) ? `.` + e : `[` + JSON.stringify(e) + `]`
}
function Ne(e) {
  return !(!Number.isInteger(e) || e < 0 || e > we)
}
function Pe(e) {
  return !(!Number.isInteger(e) || e < 0 || e > Ce)
}
function Fe(e) {
  if (e.length === 0 || (e.length > 1 && e.charCodeAt(0) === 48)) return !1
  for (let t = 0; t < e.length; t++) {
    let n = e.charCodeAt(t)
    if (n < 48 || n > 57) return !1
  }
  return Ne(+e)
}
function Ie(e) {
  for (var t = e.length - 1; t >= 0 && !Fe(e[t]); t--);
  return t + 1
}
function Le(e) {
  let t = Object.keys(e)
  return ((t.length = Ie(t)), t)
}
function Re(e) {
  return new Uint8Array(e).toBase64()
}
function ze(e) {
  return Uint8Array.fromBase64(e).buffer
}
function Be(e) {
  return Buffer.from(e).toString(`base64`)
}
function Ve(e) {
  return Uint8Array.from(Buffer.from(e, `base64`)).buffer
}
function He(e) {
  let t = new Uint8Array(e),
    n = ``,
    r = 32768
  for (let e = 0; e < t.length; e += r) {
    let i = t.subarray(e, e + r)
    n += String.fromCharCode.apply(null, i)
  }
  return btoa(n)
}
function Ue(e) {
  let t = atob(e),
    n = t.length,
    r = new Uint8Array(n)
  for (let e = 0; e < n; e++) r[e] = t.charCodeAt(e)
  return r.buffer
}
var We = typeof Uint8Array.fromBase64 == `function`,
  Ge = typeof process == `object` && process.versions?.node !== void 0,
  Ke = We ? Re : Ge ? Be : He,
  qe = We ? ze : Ge ? Ve : Ue
function Je(e, t) {
  if (!t) return e
  let n = {}
  for (let r of Object.keys(e)) n[r] = t[r] ?? e[r]
  return n
}
var Ye = Object.freeze({ kind: `not-plain` }),
  Xe = Object.freeze({ kind: `symbol-keys` }),
  Ze = Object.freeze({
    identify: (e) => e,
    typeOf: (e) => (e === null ? `null` : typeof e),
    toPrimitive: (e) => e,
    tagOf: (e) => De(e),
    isThenable: (e) => typeof e.then == `function`,
    toPromise: (e) => Promise.resolve(e),
    unbox: (e) => e.valueOf(),
    toISOString: (e) => (isNaN(e.getDate()) ? `` : e.toISOString()),
    toStringValue: (e) => e.toString(),
    regExpInfo: (e) => ({ source: e.source, flags: e.flags }),
    valuesOf: (e) => e,
    entriesOf: (e) => e,
    viewInfo: (e) => (
      Oe(e) && (e = new Uint8Array(e)),
      {
        buffer: e.buffer,
        byteOffset: e.byteOffset,
        byteLength: e.byteLength,
        length: e.length,
        bufferByteLength: e.buffer.byteLength
      }
    ),
    toArrayBuffer: (e) => e,
    lengthOf: (e) => e.length,
    hasOwn: (e, t) => Object.hasOwn(e, t),
    indicesOf: (e) => Le(e),
    shapeOf: (e) =>
      Ee(e)
        ? Ae(e).length > 0
          ? Xe
          : {
              kind: Object.getPrototypeOf(e) === null ? `null-proto` : `plain`,
              keys: Object.keys(e)
            }
        : Ye,
    get: (e, t) => e[t]
  }),
  Qe = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, `byteLength`).get,
  $e =
    typeof SharedArrayBuffer > `u`
      ? void 0
      : Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, `byteLength`).get,
  et = Object.freeze({
    fromPrimitive: (e) => e,
    fromISOString: (e) => new Date(e),
    fromStringValue: (e, t) =>
      e === `URL`
        ? new URL(t)
        : e === `URLSearchParams`
          ? new URLSearchParams(t)
          : Temporal[e.slice(9)].from(t),
    fromArrayBuffer: (e) => e,
    fromRegExpInfo: (e, t) => new RegExp(e, t),
    fromViewInfo: (e, t, n, r) => {
      try {
        Qe.call(t)
      } catch (e) {
        if (!$e) throw e
        $e.call(t)
      }
      let i = globalThis[e]
      return n === void 0 ? new i(t) : new i(t, n, r)
    },
    box: (e) => Object(e),
    createArray: (e) => Array(e),
    createSparseArray: (e) => {
      let t = []
      return ((t[we] = void 0), delete t[we], (t.length = e), t)
    },
    createObject: () => ({}),
    createNullPrototypeObject: () => Object.create(null),
    createSet: () => new Set(),
    createMap: () => new Map(),
    set: (e, t, n) => {
      e[t] = n
    },
    addValue: (e, t) => {
      e.add(t)
    },
    addEntry: (e, t, n) => {
      e.set(t, n)
    }
  })
function tt(e, t, n) {
  return nt(JSON.parse(e), t, n)
}
function nt(e, t, n) {
  let r = Je(et, n?.operations)
  if (typeof e == `number`) return s(e, !0)
  if (!Array.isArray(e) || e.length === 0) throw Error(`Invalid input`)
  let i = e,
    a = Array(i.length),
    o = null
  function s(e, n = !1) {
    if (e === -1) return r.fromPrimitive(void 0)
    if (e === -3) return r.fromPrimitive(NaN)
    if (e === -4) return r.fromPrimitive(1 / 0)
    if (e === -5) return r.fromPrimitive(-1 / 0)
    if (e === -6) return r.fromPrimitive(-0)
    if (n || typeof e != `number`) throw Error(`Invalid input`)
    if (e in a) return a[e]
    if (e >= i.length) throw Error(`Invalid input`)
    let c = i[e]
    if (!c || typeof c != `object`) a[e] = r.fromPrimitive(c)
    else if (Array.isArray(c)) {
      if (typeof c[0] == `string`) {
        let n = c[0],
          l = t && Object.hasOwn(t, n) ? t[n] : void 0
        if (l) {
          let t = c[1]
          if ((typeof t != `number` && (t = i.push(c[1]) - 1), Object.hasOwn(a, t)))
            return (a[e] = l(a[t]))
          if (((o ??= new Set()), o.has(t))) throw Error(`Invalid circular reference`)
          return (o.add(t), (a[e] = l(s(t))), o.delete(t), a[e])
        }
        switch (n) {
          case `Date`:
            a[e] = r.fromISOString(c[1])
            break
          case `Set`:
            let t = r.createSet()
            a[e] = t
            for (let e = 1; e < c.length; e += 1) r.addValue(t, s(c[e]))
            break
          case `Map`:
            let o = r.createMap()
            a[e] = o
            for (let e = 1; e < c.length; e += 2) r.addEntry(o, s(c[e]), s(c[e + 1]))
            break
          case `RegExp`:
            a[e] = r.fromRegExpInfo(c[1], c[2])
            break
          case `Object`: {
            let t = c[1]
            if (typeof i[t] == `object` && i[t][0] !== `BigInt`) throw Error(`Invalid input`)
            a[e] = r.box(s(t))
            break
          }
          case `BigInt`:
            a[e] = r.fromPrimitive(BigInt(c[1]))
            break
          case `null`:
            let l = r.createNullPrototypeObject()
            a[e] = l
            for (let e = 1; e < c.length; e += 2) {
              let t = c[e]
              if (typeof t != `string`) throw Error(`Cannot parse an object with a non-string key`)
              if (t === `__proto__`)
                throw Error('Cannot parse an object with a `__proto__` property')
              r.set(l, t, s(c[e + 1]))
            }
            break
          case `Int8Array`:
          case `Uint8Array`:
          case `Uint8ClampedArray`:
          case `Int16Array`:
          case `Uint16Array`:
          case `Float16Array`:
          case `Int32Array`:
          case `Uint32Array`:
          case `Float32Array`:
          case `Float64Array`:
          case `BigInt64Array`:
          case `BigUint64Array`:
          case `DataView`: {
            if (i[c[1]][0] !== `ArrayBuffer`) throw Error(`Invalid data`)
            let t = s(c[1])
            a[e] = r.fromViewInfo(n, t, c[2], c[3])
            break
          }
          case `ArrayBuffer`: {
            let t = c[1]
            if (typeof t != `string`) throw Error(`Invalid ArrayBuffer encoding`)
            a[e] = r.fromArrayBuffer(qe(t))
            break
          }
          case `URL`:
          case `URLSearchParams`:
          case `Temporal.Duration`:
          case `Temporal.Instant`:
          case `Temporal.PlainDate`:
          case `Temporal.PlainTime`:
          case `Temporal.PlainDateTime`:
          case `Temporal.PlainMonthDay`:
          case `Temporal.PlainYearMonth`:
          case `Temporal.ZonedDateTime`:
            a[e] = r.fromStringValue(n, c[1])
            break
          default:
            throw Error(`Unknown type ${n}`)
        }
      } else if (c[0] === -7) {
        let t = c[1]
        if (!Pe(t)) throw Error(`Invalid input`)
        let n = r.createSparseArray(t)
        a[e] = n
        for (let e = 2; e < c.length; e += 2) {
          let i = c[e]
          if (!Ne(i) || i >= t) throw Error(`Invalid input`)
          r.set(n, i, s(c[e + 1]))
        }
      } else {
        let t = r.createArray(c.length)
        a[e] = t
        for (let e = 0; e < c.length; e += 1) {
          let n = c[e]
          n !== -2 && r.set(t, e, s(n))
        }
      }
    } else {
      let t = r.createObject()
      a[e] = t
      for (let e of Object.keys(c)) {
        if (e === `__proto__`) throw Error('Cannot parse an object with a `__proto__` property')
        r.set(t, e, s(c[e]))
      }
    }
    return a[e]
  }
  return s(0)
}
function rt(e, t, n) {
  let r = it(!1, e, t, n)
  return typeof r == `string` ? r : `[${r.join(`,`)}]`
}
function it(e, t, n, r) {
  let i = Je(Ze, r?.operations),
    a = [],
    o = new Map(),
    s = []
  if (n) for (let e of Object.getOwnPropertyNames(n)) s.push({ key: e, fn: n[e] })
  let c = [],
    l = 0
  function u(n, r) {
    let d = i.typeOf(n)
    if (d === `undefined`) return -1
    let f
    if (d === `number`) {
      if (((f = i.toPrimitive(n)), Number.isNaN(f))) return -3
      if (f === 1 / 0) return -4
      if (f === -1 / 0) return -5
      if (f === 0 && 1 / f < 0) return -6
    }
    let p = i.identify(n)
    if (o.has(p)) return o.get(p)
    ;((r ??= l++), o.set(p, r))
    for (let { key: e, fn: t } of s) {
      let i = t(n)
      if (i) return ((a[r] = `["${e}",${u(i)}]`), r)
    }
    if (d === `function`) throw new w(`Cannot stringify a function`, c, n, t)
    if (d === `symbol`) throw new w(`Cannot stringify a Symbol primitive`, c, n, t)
    let m = ``
    if (d !== `object`) m = at(d === `number` ? f : i.toPrimitive(n))
    else if (i.isThenable(n)) {
      if (!e)
        throw new w(`Cannot stringify a Promise or thenable — use stringifyAsync instead`, c, n, t)
      ;((m = i.toPromise(n).then((e) => {
        let t = u(e, r)
        t < 0 && (a[r] = t)
      })),
        m.catch(() => {}))
    } else {
      let e = i.tagOf(n)
      switch (e) {
        case `Number`:
        case `String`:
        case `Boolean`:
        case `BigInt`:
          m = `["Object",${u(i.unbox(n))}]`
          break
        case `Date`:
          m = `["Date","${i.toISOString(n)}"]`
          break
        case `URL`:
          m = `["URL",${T(i.toStringValue(n))}]`
          break
        case `URLSearchParams`:
          m = `["URLSearchParams",${T(i.toStringValue(n))}]`
          break
        case `RegExp`:
          let { source: r, flags: a } = i.regExpInfo(n)
          m = a ? `["RegExp",${T(r)},"${a}"]` : `["RegExp",${T(r)}]`
          break
        case `Array`: {
          let e = !1,
            t = i.lengthOf(n)
          m = `[`
          for (let r = 0; r < t; r += 1)
            if ((r > 0 && (m += `,`), i.hasOwn(n, r)))
              (c.push(`[${r}]`), (m += u(i.get(n, r))), c.pop())
            else if (e) m += -2
            else {
              let r = i.indicesOf(n),
                a = r.length,
                o = String(t).length
              if ((t - a) * 3 > 4 + o + a * (o + 1)) {
                m = `[-7,` + t
                for (let e = 0; e < r.length; e++) {
                  let t = r[e]
                  ;(c.push(`[${t}]`), (m += `,` + t + `,` + u(i.get(n, t))), c.pop())
                }
                break
              }
              ;((e = !0), (m += -2))
            }
          m += `]`
          break
        }
        case `Set`:
          m = `["Set"`
          for (let e of i.valuesOf(n)) m += `,${u(e)}`
          m += `]`
          break
        case `Map`:
          m = `["Map"`
          for (let [e, t] of i.entriesOf(n)) {
            let n = i.typeOf(e),
              r = n !== `object` && n !== `function` && n !== `symbol`
            ;(c.push(`.get(${r ? at(i.toPrimitive(e)) : `...`})`),
              (m += `,${u(e)},${u(t)}`),
              c.pop())
          }
          m += `]`
          break
        case `Int8Array`:
        case `Uint8Array`:
        case `Uint8ClampedArray`:
        case `Int16Array`:
        case `Uint16Array`:
        case `Float16Array`:
        case `Int32Array`:
        case `Uint32Array`:
        case `Float32Array`:
        case `Float64Array`:
        case `BigInt64Array`:
        case `BigUint64Array`: {
          let t = i.viewInfo(n)
          ;((m = `["` + e + `",` + u(t.buffer)),
            t.byteLength !== t.bufferByteLength && (m += `,${t.byteOffset},${t.length}`),
            (m += `]`))
          break
        }
        case `DataView`: {
          let t = i.viewInfo(n)
          ;((m = `["` + e + `",` + u(t.buffer)),
            t.byteLength !== t.bufferByteLength && (m += `,${t.byteOffset},${t.byteLength}`),
            (m += `]`))
          break
        }
        case `ArrayBuffer`:
          m = `["ArrayBuffer","${Ke(i.toArrayBuffer(n))}"]`
          break
        case `Temporal.Duration`:
        case `Temporal.Instant`:
        case `Temporal.PlainDate`:
        case `Temporal.PlainTime`:
        case `Temporal.PlainDateTime`:
        case `Temporal.PlainMonthDay`:
        case `Temporal.PlainYearMonth`:
        case `Temporal.ZonedDateTime`:
          m = `["${e}",${T(i.toStringValue(n))}]`
          break
        default: {
          let e = i.shapeOf(n)
          if (e.kind === `not-plain`) throw new w(`Cannot stringify arbitrary non-POJOs`, c, n, t)
          if (e.kind === `symbol-keys`)
            throw new w(`Cannot stringify POJOs with symbolic keys`, c, n, t)
          if (e.kind === `null-proto`) {
            m = `["null"`
            for (let r of e.keys) {
              if (r === `__proto__`)
                throw new w(`Cannot stringify objects with __proto__ keys`, c, n, t)
              ;(c.push(Me(r)), (m += `,${T(r)},${u(i.get(n, r))}`), c.pop())
            }
            m += `]`
          } else {
            m = `{`
            let r = !1
            for (let a of e.keys) {
              if (a === `__proto__`)
                throw new w(`Cannot stringify objects with __proto__ keys`, c, n, t)
              ;(r && (m += `,`),
                (r = !0),
                c.push(Me(a)),
                (m += `${T(a)}:${u(i.get(n, a))}`),
                c.pop())
            }
            m += `}`
          }
        }
      }
    }
    return ((a[r] = m), r)
  }
  let d = u(t)
  return d < 0 ? `${d}` : a
}
function at(e) {
  let t = typeof e
  return t === `string`
    ? T(e)
    : e === void 0
      ? `-1`
      : e === 0 && 1 / e < 0
        ? `-6`
        : t === `bigint`
          ? `["BigInt","${e}"]`
          : String(e)
}
var ot = () => {
    throw Error(``)
  },
  E = () => {
    throw Error(``)
  },
  st = {},
  ct = {}
function lt(e) {
  let t = Object.entries(e)
  ;(t.length,
    (st = Object.fromEntries(t.map(([e, t]) => [e, t.encode]))),
    (ct = Object.fromEntries(t.map(([e, t]) => [e, t.decode]))),
    (ot = (e) => rt(e, st)),
    (E = (e) => tt(e, ct)))
}
function ut(e, t) {
  return e.origin === t.origin ? e.href.slice(t.origin.length) : e.href
}
function dt(e, t) {
  return e + `/` + t
}
var ft = window.fetch
window.fetch = (e, t) => (
  (e instanceof Request ? e.method : t?.method || `GET`) !== `GET` && ht(e),
  ft(e, t)
)
var D = new Map()
function pt(e, t) {
  let n = _t(e, t)
  if (n) {
    let e = document.querySelector(n)
    if (e?.textContent) {
      e.remove()
      let { body: t, ...r } = JSON.parse(e.textContent)
      e.getAttribute(`data-b64`) !== null && (t = Se(t))
      let i = e.getAttribute(`data-ttl`)
      return (
        i && D.set(n, { body: t, init: r, ttl: 1e3 * Number(i) }),
        Promise.resolve(new Response(t, r))
      )
    }
  }
  return window.fetch(e, t)
}
function mt(e, t, n) {
  if (D.size > 0) {
    let t = _t(e, n),
      r = t && D.get(t)
    if (r) {
      if (
        performance.now() < r.ttl &&
        [`default`, `force-cache`, `only-if-cached`, void 0].includes(n?.cache)
      )
        return new Response(r.body, r.init)
      D.delete(t)
    }
  }
  return window.fetch(t, n)
}
function ht(e) {
  let t = _t(gt(e))
  for (let e of D.keys()) e.startsWith(t) && D.delete(e)
}
function gt(e) {
  return ut(new URL(e instanceof Request ? e.url : e, location.href), location)
}
function _t(e, t) {
  let n = `script[data-sveltekit-fetched][data-url=${JSON.stringify(e instanceof Request ? e.url : e)}]`
  if (t?.headers || t?.body) {
    let e = t.body
    if (e && typeof e != `string` && !ArrayBuffer.isView(e)) return null
    n += `[data-hash="${xe(t.headers, e)}"]`
  }
  return n
}
function vt({ nodes: e, server_loads: t, dictionary: n, matchers: r }) {
  let i = new Set(t)
  return Object.entries(n).map(([t, [n, i, s]]) => {
    let { pattern: c, params: l } = le(t),
      u = {
        id: t,
        exec: (e) => {
          let t = c.exec(e)
          if (t) return ae(t, l, r)
        },
        errors: [1, ...(s || [])].map((t) => e[t]),
        layouts: [0, ...(i || [])].map(o),
        leaf: a(n)
      }
    return ((u.errors.length = u.layouts.length = Math.max(u.errors.length, u.layouts.length)), u)
  })
  function a(t) {
    let n = t < 0
    return (n && (t = ~t), [n, e[t]])
  }
  function o(t) {
    return t === void 0 ? t : [i.has(t), e[t]]
  }
}
function yt(e, t = JSON.parse) {
  try {
    return t(sessionStorage[e])
  } catch {}
}
function bt(e, t, n = JSON.stringify) {
  let r = n(t)
  try {
    sessionStorage[e] = r
  } catch {}
}
var xt = `sveltekit:snapshot`,
  St = `sveltekit:navigation-snapshot`,
  Ct = `sveltekit:history-info`,
  O = `sveltekit:metadata`,
  k = { tap: 1, hover: 2, viewport: 3, eager: 4, false: -1 },
  wt = location.origin
function Tt(e) {
  if (e instanceof URL) return e
  let t = document.baseURI
  if (!t) {
    let e = document.getElementsByTagName(`base`)
    t = e.length ? e[0].href : document.URL
  }
  return new URL(e, t)
}
function Et() {
  return { x: pageXOffset, y: pageYOffset }
}
function A(e, t) {
  return e.getAttribute(`data-sveltekit-${t}`)
}
var Dt = { ...k, '': k.hover }
function Ot(e) {
  let t = e.assignedSlot ?? e.parentNode
  return (t?.nodeType === 11 && (t = t.host), t)
}
function kt(e, t) {
  for (; e && e !== t;) {
    if ((e instanceof HTMLAnchorElement || e instanceof SVGAElement) && e.hasAttribute(`href`))
      return e
    e = Ot(e)
  }
}
function At(e, t, n) {
  let r
  try {
    if (
      ((r = new URL(e instanceof SVGAElement ? e.href.baseVal : e.href, document.baseURI)),
      n && r.hash.match(/^#[^/]/))
    ) {
      let e = location.hash.split(`#`)[1] || `/`
      r.hash = `#${e}${r.hash}`
    }
  } catch {}
  let i = e instanceof SVGAElement ? e.target.baseVal : e.target,
    a = !r || !!i || jt(r, t, n) || (e.getAttribute(`rel`) || ``).split(/\s+/).includes(`external`),
    o = r?.origin === wt && e.hasAttribute(`download`)
  return { url: r, external: a, target: i, download: o }
}
function j(e) {
  let t = null,
    n = null,
    r = null,
    i = null,
    a = null,
    o = e
  for (; o && o !== document.documentElement;)
    (t === null && (t = A(o, `preload-code`)),
      n === null && (n = A(o, `preload-data`)),
      r === null && (r = A(o, `reload`)),
      i === null && (i = A(o, `replacestate`)),
      a === null && (a = A(o, `reset`)),
      (o = Ot(o)))
  function s(e) {
    switch (e) {
      case ``:
      case `true`:
        return !0
      case `false`:
        return !1
      default:
        return
    }
  }
  return {
    preload_code: Dt[t ?? `false`],
    preload_data: Dt[n ?? `false`],
    reload: s(r),
    replace_state: s(i),
    reset: s(a) ?? !0
  }
}
function jt(e, t, n) {
  return e.origin !== wt || !e.pathname.startsWith(t)
    ? !0
    : n
      ? e.pathname !== location.pathname
      : !1
}
function Mt(e, t) {
  let n = t ? (e.hash.split(`#`, 3)[2] ?? ``) : e.hash.slice(1)
  return n ? document.getElementById(decodeURIComponent(n)) : null
}
function Nt(e) {}
function Pt(e) {
  let t = document.activeElement
  e && (t instanceof HTMLElement || t instanceof SVGElement) && t !== document.body && t.blur()
}
function Ft(e) {
  let t = e.getAttribute(`tabindex`)
  ;(e.setAttribute(`tabindex`, `-1`),
    e.focus({ preventScroll: !0, focusVisible: !1 }),
    t === null ? e.removeAttribute(`tabindex`) : e.setAttribute(`tabindex`, t))
}
function It(e) {
  let t = window.parent === window || document.hasFocus(),
    n = document.querySelector(`[autofocus]`)
  if (n) t && n.focus()
  else {
    t && Ft(Mt(e, !1) ?? document.body)
    let n = getSelection()
    if (n && n.type !== `None`) {
      let e = []
      for (let t = 0; t < n.rangeCount; t += 1) e.push(n.getRangeAt(t))
      setTimeout(() => {
        if (n.rangeCount === e.length) {
          for (let t = 0; t < n.rangeCount; t += 1) {
            let r = e[t],
              i = n.getRangeAt(t)
            if (
              r.commonAncestorContainer !== i.commonAncestorContainer ||
              r.startContainer !== i.startContainer ||
              r.endContainer !== i.endContainer ||
              r.startOffset !== i.startOffset ||
              r.endOffset !== i.endOffset
            )
              return
          }
          n.removeAllRanges()
        }
      })
    }
  }
}
var Lt = !0
function Rt(e, t, n) {
  if (t && Lt) {
    if (n) scrollTo(n.x, n.y)
    else {
      let t = Mt(e, !1)
      t ? t.scrollIntoView() : scrollTo(0, 0)
    }
  }
  Lt = !0
}
function zt(e) {
  throw Error(`https://svelte.dev/e/kit/redirect_loop`)
}
var M = yt(`sveltekit:navigation-snapshot`) ?? {},
  Bt = new Set()
function Vt() {
  return new Set(Bt)
}
function Ht(e) {
  Bt.size === 0
    ? delete M[e]
    : (M[e] = Object.fromEntries(Array.from(Bt, ({ id: e, capture: t }) => [e, ot(t())])))
}
function Ut(e, t) {
  let n = M[e]
  for (let e of Bt) n && Object.hasOwn(n, e.id) ? e.restore(E(n[e.id])) : t?.has(e) && e.reset?.()
}
function Wt(e) {
  delete M[e]
}
function Gt(e) {
  ;(Ht(e), bt(St, M))
}
var Kt = new Set([`load`, `prerender`, `csr`, `ssr`, `trailingSlash`, `config`])
;([...Kt], [...new Set([...Kt])])
function N() {}
var qt = y(
    `<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>`
  ),
  Jt = y(`<!> <!>`, 1)
function Yt(o, s) {
  t(s, !0)
  let l = (e, t = h, n = h) => {
      let r = (e, t = h) => {
          var n = d(),
            r = c(n)
          ;(b(
            r,
            () => p(o),
            (e, n) => {
              n(e, {
                get error() {
                  return t()
                }
              })
            }
          ),
            u(e, n))
        },
        i = a(() => t().component),
        o = a(() => t().error),
        g = a(() => t().data)
      var _ = d(),
        y = c(_)
      ;(te(
        y,
        {
          get failed() {
            return p(o) ? r : void 0
          },
          get onerror() {
            return p(o) ? s.onerror : void 0
          }
        },
        (e) => {
          var r = d(),
            a = c(r),
            o = (e) => {
              var r = d(),
                a = c(r)
              ;(b(
                a,
                () => p(i),
                (e, r) => {
                  v(
                    r(e, {
                      get data() {
                        return p(g)
                      },
                      get form() {
                        return s.form
                      },
                      get params() {
                        return s.page.params
                      },
                      children: (e, r) => {
                        l(
                          e,
                          () => t().child,
                          () => n() + 1
                        )
                      },
                      $$slots: { default: !0 }
                    }),
                    (e) => (f()[n()] = e),
                    () => f()?.[n()]
                  )
                }
              ),
                u(e, r))
            },
            h = (e) => {
              var t = d(),
                r = c(t)
              ;(b(
                r,
                () => p(i),
                (e, t) => {
                  v(
                    t(e, {
                      get data() {
                        return p(g)
                      },
                      get form() {
                        return s.form
                      },
                      get params() {
                        return s.page.params
                      },
                      get error() {
                        return s.error
                      }
                    }),
                    (e) => (f()[n()] = e),
                    () => f()?.[n()]
                  )
                }
              ),
                u(e, t))
            }
          ;(m(a, (e) => {
            t().child ? e(o) : e(h, -1)
          }),
            u(e, r))
        }
      ),
        u(e, _))
    },
    f = ee(s, `components`, 7),
    y = S(!1),
    x = S(!1),
    ie = S(``)
  rr(() => {
    p(y) ? (e(x, !0), e(ie, document.title || `untitled page`, !0)) : e(y, !0)
  })
  var ae = Jt(),
    oe = c(ae)
  l(
    oe,
    () => s.tree,
    () => 0
  )
  var se = i(oe, 2),
    ce = (e) => {
      var t = qt(),
        n = re(t),
        i = (e) => {
          var t = _()
          ;(ne(() => g(t, p(ie))), u(e, t))
        }
      ;(m(n, (e) => {
        p(x) && e(i)
      }),
        r(t),
        u(e, t))
    }
  ;(m(se, (e) => {
    p(y) && e(ce)
  }),
    u(o, ae),
    n())
}
var Xt = class {
    #e
    get form() {
      return p(this.#e)
    }
    set form(t) {
      e(this.#e, t)
    }
    #t
    get error() {
      return p(this.#t)
    }
    set error(t) {
      e(this.#t, t)
    }
    page
    components = []
    tree
    onerror
    constructor({ page: e, tree: t, form: n, error: r, onerror: i = N }) {
      ;((this.page = e), (this.tree = t), (this.onerror = i), (this.#e = S(n)), (this.#t = S(r)))
    }
  },
  Zt = class {
    component
    error
    #e = S({})
    get data() {
      return p(this.#e)
    }
    set data(t) {
      e(this.#e, t)
    }
    #t = S()
    get child() {
      return p(this.#t)
    }
    set child(t) {
      e(this.#t, t)
    }
    constructor(e, t) {
      ;((this.component = e), (this.error = t))
    }
  }
function Qt(e, t, n) {
  let r = [void 0],
    i = -1
  for (let a = 1; a < e.length; a += 1) {
    if (!e[a]) continue
    let o = a - 1
    for (; o > i + 1 && t[o] == null;) --o
    i = o
    let s = t[o]
    r.push(s == null ? void 0 : n(s)?.catch(() => void 0))
  }
  return Promise.all(r)
}
function* $t(e, t, n) {
  for (; e--;) {
    let r = n[e]
    if (r != null) {
      let n = e
      for (; !t[n];) --n
      yield { error: r, idx: n + 1 }
    }
  }
}
var en = new Set([`icon`, `shortcut icon`, `apple-touch-icon`]),
  P = new Set(),
  F = yt(`sveltekit:history-info`) ?? {},
  I = yt(`sveltekit:snapshot`) ?? {},
  L
function tn(e) {
  F[e].scroll = Et()
}
function nn(e, t) {
  F[e] = { ...F[e], resetIndex: t.resetIndex }
}
function rn(e, t) {
  Wt(e)
  let n = e + 1
  for (; F[n];) (delete F[n], Wt(n), (n += 1))
  for (n = t + 1; I[n];) (delete I[n], (n += 1))
}
function R(e, t = !1) {
  return (t ? location.replace(e.href) : (location.href = e.href), new Promise(N))
}
async function an() {
  try {
    if (`serviceWorker` in navigator) {
      let e = await navigator.serviceWorker.getRegistration(C || `/`)
      e && (await e.update())
    }
  } catch {}
}
var on,
  sn,
  cn,
  z,
  ln,
  B,
  un = {},
  dn = {},
  fn = [],
  V = null
function H() {
  ;(V?.fork?.then((e) => e?.discard()), (V = null), (Q = { element: void 0, href: void 0 }))
}
var pn = new Map(),
  mn = new Set(),
  hn = new Set(),
  U = new Set(),
  W = { branch: [], error: null, url: null, nav: null },
  gn = !1,
  _n = !1,
  G = !1,
  K = null,
  vn = !1,
  yn = !1,
  q,
  J,
  Y
function bn(e = history.state) {
  return e?.[O]
}
var X,
  xn,
  Sn = new Set(),
  Cn = new Map(),
  wn = new Map()
;(oe(async (e) => {
  typeof e == `string` && (e = new URL(e, location.href))
  let t = await Z(e, !1)
  return t ? { id: t.route.id, params: t.params } : null
}),
  Promise.resolve())
function Tn(e, t, n) {
  return Dn(e, t, n)
}
function* En(e) {
  for (let [t, n] of e) for (let [e, r] of n) yield [dt(t, e), r]
}
async function Dn(e, t, n) {
  if (he.data) {
    let { q: e = {}, p: t = {}, l: n = {}, f: r = {} } = he.data
    for (let t in e) un[t] = e[t]
    for (let e in n) un[e] = n[e]
    for (let e in r) un[e] = r[e]
    for (let e in t) dn[e] = t[e]
  }
  ;(document.URL !== location.href && (location.href = location.href),
    (B = e),
    lt(B.hooks.transport ?? {}),
    await e.hooks.init?.(),
    (on = vt(e)),
    (z = document.documentElement),
    (ln = t),
    (sn = e.nodes[0]),
    (cn = e.nodes[1]))
  let [r] = await Promise.all([sn(), cn()]),
    i = new Zt(r.component, void 0)
  L = new Xt({ page: me, tree: i, form: void 0, error: void 0, onerror: (e, t) => P.add(t) })
  let a = bn()
  ;((q = a?.historyIndex ?? 0),
    (J = a?.navigationIndex ?? 0),
    (Y = a?.resetIndex ?? 0),
    q ||
      ((q = J = Y = Date.now()),
      history.replaceState(
        {
          ...history.state,
          [O]: {
            historyIndex: q,
            navigationIndex: J,
            state: ot({}),
            persistState: !1,
            resetIndex: q
          }
        },
        ``
      )),
    nn(q, bn()))
  let o = F[q]?.scroll
  function s() {
    o && ((history.scrollRestoration = `manual`), scrollTo(o.x, o.y))
  }
  ;(n
    ? (s(), await or(ln, n))
    : (await Zn({
        type: `enter`,
        url: Tt(B.hash ? lr(new URL(location.href)) : location.href),
        replace_state: !0,
        state: a?.persistState ? E(a.state) : {},
        persist_state: a?.persistState ?? !1
      }),
      s()),
    ar())
}
function On() {
  ;((fn.length = 0), (yn = !1))
}
function kn(e) {
  L.components.some((e) => e?.snapshot) && (I[e] = L.components.map((e) => e?.snapshot?.capture()))
}
function An(e) {
  I[e]?.forEach((e, t) => {
    L.components[t]?.snapshot?.restore(e)
  })
}
function jn() {
  ;(tn(q), bt(Ct, F), kn(J), bt(xt, I), Gt(q))
}
async function Mn(e, t = {}, n = 0, r = {}, i) {
  let a, s
  ;(t.refreshAll && H(),
    await Zn({
      type: t.type ?? `goto`,
      url: Tt(e),
      reset: t.reset,
      replace_state: t.replace,
      state: t.state,
      persist_state: t.persistState,
      event: t.event,
      action_result: t.action_result,
      redirect_count: n,
      nav_token: r,
      intent: i,
      accept: () => {
        if (t.refreshAll) {
          ;((yn = !0), (a = new Set()))
          for (let [e, t] of En(Cn)) (t.resource?.reset(), a.add(e))
          s = new Set()
          for (let [e] of En(wn)) s.add(e)
        }
        t.invalidate && t.invalidate.forEach(ir)
      }
    }),
    t.refreshAll &&
      o()
        .then(o)
        .then(() => {
          for (let [e, { resource: t }] of En(Cn)) a?.has(e) && t.start()
          for (let [e, { resource: t }] of En(wn)) s?.has(e) && t.reconnect()
        }))
}
async function Nn(e) {
  if (e.id !== V?.id) {
    H()
    let t = {}
    ;(Sn.add(t),
      (V = {
        id: e.id,
        token: t,
        promise: Un({ ...e, preload: t }).finally(() => {
          Sn.delete(t)
        }),
        fork: null
      }),
      V.promise.catch(H))
  }
  return V.promise
}
async function Pn(e) {
  await Promise.all([...e.layouts, e.leaf].filter(Boolean).map(([, e]) => e()))
}
async function Fn(e) {
  let t = (await Z(e, !1))?.route
  t && (await Pn(t))
}
async function In(e, t, n) {
  let r = {
    params: e.state.params,
    route: { id: e.state.route?.id ?? null },
    url: new URL(location.href)
  }
  if (
    ((W = { ...e.state, nav: r }),
    ur(e),
    (n ? x : l)(Yt, {
      target: t,
      props: L,
      transformError: async (e) => {
        let t = await $(e, W.nav)
        return (fe({ error: t, status: t.status }), t)
      }
    }),
    await Promise.resolve(),
    n)
  ) {
    let e = {
      from: null,
      to: { ...r, scroll: F[q]?.scroll ?? Et() },
      willUnload: !1,
      type: `enter`,
      shallow: !1,
      complete: Promise.resolve()
    }
    U.forEach((t) => t(e))
  }
  ;(An(J), gn && Ut(q), (_n = !0))
}
async function Ln({
  url: e,
  params: t,
  branch: n,
  errors: r,
  status: i,
  error: a,
  route: o,
  form: s
}) {
  let c = `never`
  if (C && (e.pathname === C || e.pathname === C + `/`)) c = `always`
  else for (let e of n) e?.slash !== void 0 && (c = e.slash)
  ;((e.pathname = de(e.pathname, c)), (e.search = e.search))
  let l = {
    type: `loaded`,
    state: { url: e, params: t, branch: n, error: a, route: o },
    props: { page: { ...me }, tree: {} }
  }
  ;(a && (l.props.error = a), s !== void 0 && (l.props.form = s))
  let u = {},
    d = !me,
    f = r && (await Qt(n, r, (e) => e().then((e) => e.component))),
    p = l.props.tree,
    m = 1,
    h = L.tree
  for (let e = 0; e < n.length; e += 1) {
    let t = n[e],
      r = W.branch[e]
    if (
      t &&
      (d || !h || t?.data !== r?.data
        ? ((p.data = { ...u, ...t.data }), (d = !0))
        : (p.data = h.data),
      (u = p.data),
      e < n.length - 1)
    ) {
      let t = e + 1
      for (; t < n.length && !n[t];) t += 1
      let r = n[t]
      r && ((p = p.child = new Zt(r.node.component, f?.[m++])), (h = h?.child))
    }
  }
  return (
    (!W.url || e.href !== W.url.href || W.error !== a || (s !== void 0 && s !== me.form) || d) &&
      (l.props.page = {
        error: a,
        params: t,
        route: { id: o?.id ?? null },
        state: {},
        shallow: null,
        status: i ?? a?.status ?? 200,
        url: new URL(e),
        form: s ?? null,
        data: u
      }),
    l
  )
}
async function Rn({ loader: e, parent: t, url: n, params: r, route: i, server_data_node: a }) {
  let o = {
      dependencies: new Set(),
      params: new Set(),
      parent: !1,
      route: !1,
      url: !1,
      search_params: new Set()
    },
    s = await e()
  return {
    node: s,
    loader: e,
    server: a,
    universal: s.universal?.load ? { type: `data`, data: null, uses: o } : null,
    data: a?.data ?? null,
    slash: s.universal?.trailingSlash ?? a?.slash
  }
}
function zn(e, t, n) {
  let r = new URL(e instanceof Request ? e.url : e, n),
    i = ut(r, n)
  return { resolved: r, promise: _n ? mt(i, r.href, t) : pt(i, t) }
}
function Bn(e, t, n, r, i, a) {
  if (yn) return !0
  if (!i) return !1
  if ((i.parent && e) || (i.route && t) || (i.url && n)) return !0
  for (let e of i.search_params) if (r.has(e)) return !0
  for (let e of i.params) if (a[e] !== W.params[e]) return !0
  for (let e of i.dependencies) if (fn.some((t) => t(new URL(e)))) return !0
  return !1
}
function Vn(e, t) {
  return e?.type === `data` ? e : e?.type === `skip` ? (t ?? null) : null
}
function Hn(e, t) {
  if (!e) return new Set(t.searchParams.keys())
  let n = new Set([...e.searchParams.keys(), ...t.searchParams.keys()])
  for (let r of n) {
    let i = e.searchParams.getAll(r).sort(),
      a = t.searchParams.getAll(r).sort()
    i.length === a.length && i.every((e, t) => e === a[t]) && n.delete(r)
  }
  return n
}
async function Un({
  id: e,
  invalidating: t,
  url: n,
  params: r,
  route: i,
  preload: a,
  action_result: o
}) {
  if (!o && V?.id === e) return (Sn.delete(V.token), V.promise)
  let { errors: s, layouts: c, leaf: l } = i,
    u = [...c, l],
    d = u.length - 1,
    f = o?.type === `error`
  ;(s.forEach((e) => e?.().catch(N)), u.forEach((e) => e?.[1]().catch(N)))
  let p = W.url ? e !== Yn(W.url) : !1,
    m = !W.route || i.id !== W.route.id,
    h = Hn(W.url, n),
    g = !1,
    _ = u.map(async (e, t) => {
      if (!e || (f && t === d)) return
      let a = W.branch[t]
      return e[1] === a?.loader && !Bn(g, m, p, h, a.universal?.uses, r)
        ? a
        : ((g = !0),
          Rn({
            loader: e[1],
            url: n,
            params: r,
            route: i,
            parent: async () => {
              let e = {}
              for (let n = 0; n < t; n += 1) Object.assign(e, (await _[n])?.data)
              return e
            },
            server_data_node: Vn(e[0] ? { type: `skip` } : null, e[0] ? a?.server : void 0)
          }))
    })
  for (let e of _) e.catch(N)
  let v = []
  for (let e = 0; e < u.length; e += 1)
    if (u[e])
      try {
        v.push(await _[e])
      } catch (t) {
        if (t instanceof ve) return { type: `redirect`, status: t.status, location: t.location }
        if (a && Sn.has(a)) throw await $(t, { params: r, url: n, route: { id: i.id } })
        let o
        if (t instanceof ge) o = await $(t, { params: r, url: n, route: { id: i.id } })
        else {
          if (await ce.check()) return (await an(), await R(n))
          o = await $(t, { params: r, url: n, route: { id: i.id } })
        }
        return Gn({ i: e, branch: v, errors: s, error: o, url: n, params: r, route: i })
      }
    else v.push(void 0)
  return o?.type === `error`
    ? Gn({
        i: u.length,
        branch: v,
        errors: s,
        error: o.error,
        status: o.status,
        url: n,
        params: r,
        route: i
      })
    : Ln({
        url: n,
        params: r,
        branch: v,
        errors: s,
        error: null,
        route: i,
        status: o?.status,
        form: o?.type === `success` || o?.type === `failure` ? (o.data ?? null) : t ? void 0 : null
      })
}
async function Wn(e, t, n) {
  for (let { error: r, idx: i } of $t(e, t, n))
    try {
      return t
        .slice(0, i)
        .concat({ node: await r(), loader: r, data: {}, server: null, universal: null })
    } catch {
      continue
    }
}
async function Gn({
  i: e,
  branch: t,
  errors: n,
  error: r,
  status: i,
  url: a,
  params: o,
  route: s
}) {
  let c = await Wn(e, t, n)
  return c
    ? Ln({ url: a, params: o, branch: c, errors: n, error: r, status: i, route: s })
    : er(a, { id: s.id }, r)
}
async function Kn({ error: e, url: t, route: n }) {
  let r = {}
  try {
    return Ln({
      url: t,
      params: r,
      branch: [
        await Rn({
          loader: sn,
          url: t,
          params: r,
          route: n,
          parent: () => Promise.resolve({}),
          server_data_node: Vn(null)
        }),
        { node: await cn(), loader: cn, universal: null, server: null, data: null }
      ],
      error: e,
      errors: [],
      route: null
    })
  } catch (e) {
    if (e instanceof ve) {
      await Mn(new URL(e.location, location.href))
      return
    }
    let i = await B.get_error_template(),
      a = await $(e, { url: t, params: r, route: n }),
      o = String(a?.message ?? ``)
        .replace(/&/g, `&amp;`)
        .replace(/</g, `&lt;`)
        .replace(/>/g, `&gt;`),
      s = i({ status: a.status, message: o }),
      c = new DOMParser().parseFromString(s, `text/html`)
    throw (
      document.documentElement.replaceChild(document.adoptNode(c.head), document.head),
      document.documentElement.replaceChild(document.adoptNode(c.body), document.body),
      e
    )
  }
}
async function qn(e) {
  let t = e.href
  if (pn.has(t)) return pn.get(t)
  let n
  try {
    let r = (async () => {
      let t =
        (await B.hooks.reroute({ url: new URL(e), fetch: async (t, n) => zn(t, n, e).promise })) ??
        e
      if (typeof t == `string`) {
        let n = new URL(e)
        ;(B.hash ? (n.hash = t) : (n.pathname = t), (t = n))
      }
      return t
    })()
    ;(pn.set(t, r), (n = await r))
  } catch {
    pn.delete(t)
    return
  }
  return n
}
async function Z(e, t) {
  if (e && !jt(e, C, B.hash)) {
    let n = await qn(e)
    if (!n) return
    let r = Jn(n)
    for (let n of on) {
      let i = n.exec(r)
      if (i) return { id: Yn(e), invalidating: t, route: n, params: i, url: e }
    }
  }
}
function Jn(e) {
  return (
    ie(B.hash ? e.hash.replace(/^#/, ``).replace(/[?#].+/, ``) : e.pathname.slice(C.length)) || `/`
  )
}
function Yn(e) {
  return (B.hash ? e.hash.replace(/^#/, ``) : e.pathname) + e.search
}
function Xn({
  url: e,
  type: t,
  intent: n,
  delta: r,
  event: i,
  scroll: a,
  shallow: o = !1,
  target: s
}) {
  let c = !1,
    l = cr(W, n, e, t, a ?? null, o, s)
  ;(l.navigation.type === `popstate` && r !== void 0 && (l.navigation.delta = r),
    i !== void 0 && (l.navigation.event = i))
  let u = {
    ...l.navigation,
    cancel: () => {
      ;((c = !0), l.reject(Error(`navigation cancelled`)))
    }
  }
  return (G || mn.forEach((e) => e(u)), c ? null : l)
}
async function Zn({
  type: e,
  url: t,
  popped: n,
  reset: r = !0,
  replace_state: i,
  state: a = {},
  persist_state: o = !1,
  redirect_count: s = 0,
  nav_token: c = {},
  accept: l = N,
  block: u = N,
  event: d,
  intent: p,
  action_result: m
}) {
  let h = X,
    g = xn
  ;((X = xn = c), (p ??= await Z(t, !1)))
  let _ =
    e === `enter`
      ? cr(W, p, t, e)
      : Xn({
          url: t,
          type: e,
          delta: n?.delta,
          intent: p,
          scroll: n?.scroll,
          shallow: !!n?.shallow,
          target: n?.shallow ?? void 0,
          event: d
        })
  if (!_) {
    ;(u(), X === c && (X = h), xn === c && (xn = g))
    return
  }
  let v = q,
    y = J,
    b = Vt()
  ;(l(), (G = !0), _n && _.navigation.type !== `enter` && ue(_.navigation))
  let x = p && (await Un({ ...p, action_result: m }))
  if (!x) {
    let e = jt(t, C, B.hash),
      n = e && !1
    if (e && !n) return await R(t, i)
    x = await er(
      t,
      { id: null },
      await $(
        new ye(
          404,
          `Not Found`,
          `Not found: ${t.pathname}${n ? ` (did you forget the hash?)` : ``}`
        ),
        { url: t, params: {}, route: { id: null } }
      ),
      i
    )
  }
  if (((t = p?.url || t), X !== c)) {
    _.reject(Error(`navigation aborted`))
    return
  }
  if (!x) return
  if (x.type === `redirect`) {
    if (s < 20) {
      ;(V?.id === p?.id && H(),
        await Zn({
          type: e,
          url: new URL(x.location, t),
          popped: n,
          reset: r,
          replace_state: i,
          state: a,
          persist_state: o,
          redirect_count: s + 1,
          nav_token: c
        }),
        _.fulfil(void 0))
      return
    }
    if (
      ((x = await Kn({
        error: await $(
          se(() => zt({ url: t.href })),
          { url: t, params: {}, route: { id: null } }
        ),
        url: t,
        route: { id: null }
      })),
      !x)
    )
      return
  } else if (x.props.page.status >= 400 && (await ce.check())) return (await an(), await R(t, i))
  if (
    (On(),
    _n && !n && (tn(v), kn(y), i ? Wt(v) : Ht(v)),
    x.props.page.url.pathname !== t.pathname && (t.pathname = x.props.page.url.pathname),
    n)
  )
    a = n.state
  else {
    let n = ot(a)
    a = E(n)
    let s = +!i
    e !== `enter` && r && (Y += 1)
    let c = {
      [O]: {
        historyIndex: (q += s),
        navigationIndex: (J += s),
        state: n,
        persistState: o,
        resetIndex: Y
      }
    }
    ;((i ? history.replaceState : history.pushState).call(history, c, ``, t),
      nn(q, c[O]),
      i || rn(q, J))
  }
  let ee = p && V?.id === p.id ? V.fork : null
  ;(V?.fork && !ee ? H() : ((V = null), (Q = { element: void 0, href: void 0 })),
    (x.props.page.state = a),
    (x.props.page.shallow = n?.shallow ?? null))
  let te
  if (_n) {
    await Qn(_.navigation)
    let e = n?.shallow
      ? { params: x.state.params, route: { id: x.state.route?.id ?? null }, url: x.state.url }
      : _.navigation.to
    ;((W = { ...x.state, nav: { params: e.params, route: e.route, url: e.url } }),
      x.props.page && (x.props.page.url = t),
      Pt(r))
    let i = ee && (await ee)
    if (i) {
      te = i.commit()
      for (let e of P) e()
      P.clear()
    } else
      (ur(x),
        (te = f().then(() => {
          for (let e of P) e()
          P.clear()
        })))
    vn = !0
  } else await In(x, ln, !1)
  ;(await $n(_, c, t, n?.scroll, r, te)) && (e === `popstate` && An(J), Ut(q, b), ue(null))
}
async function Qn(e) {
  let t = (await Promise.all(Array.from(hn, (t) => t(e)))).filter((e) => typeof e == `function`)
  if (t.length > 0) {
    function e() {
      t.forEach((e) => U.delete(e))
    }
    ;(t.push(e), t.forEach((e) => U.add(e)))
  }
}
async function $n(e, t, n, r, i, a) {
  return (
    await a,
    X === t
      ? (Rt(n, i, r),
        i && document.activeElement === document.body && It(n),
        (G = !1),
        e.fulfil(void 0),
        e.navigation.to && (e.navigation.to.scroll = Et()),
        U.forEach((t) => t(e.navigation)),
        !0)
      : (e.reject(Error(`navigation aborted`)), !1)
  )
}
async function er(e, t, n, r) {
  return e.origin === wt && e.pathname === location.pathname && !gn
    ? await Kn({ error: n, url: e, route: t })
    : await R(e, r)
}
var Q = { element: void 0, href: void 0 }
function tr() {
  let e, t, n
  function r() {
    ;(clearTimeout(e),
      t?.removeEventListener(`mousemove`, i),
      t?.removeEventListener(`mouseleave`, r),
      (t = void 0))
  }
  function i() {
    ;(clearTimeout(e),
      (e = setTimeout(() => {
        t && s(t, k.hover)
      }, 20)))
  }
  z.addEventListener(`mouseover`, (e) => {
    if (!(e.target instanceof Element)) return
    let n = kt(e.target, z)
    if (!n || n === t) return
    ;(r(), (t = n))
    let a = j(n)
    ;(a.preload_code < k.hover && a.preload_data < k.hover) ||
      (n.addEventListener(`mousemove`, i), n.addEventListener(`mouseleave`, r, { once: !0 }), i())
  })
  function a(e) {
    if (e.defaultPrevented) return
    let t = kt(e.composedPath()[0], z)
    t && s(t, k.tap)
  }
  ;(z.addEventListener(`mousedown`, a), z.addEventListener(`touchstart`, a, { passive: !0 }))
  let o = new IntersectionObserver(
    (e) => {
      for (let t of e) t.isIntersecting && (Fn(new URL(t.target.href)), o.unobserve(t.target))
    },
    { threshold: 0 }
  )
  async function s(e, t) {
    let r = e === Q.element && e?.href === Q.href && t >= n
    if (!e || r) return
    let { url: i, external: a, download: o } = At(e, C, B.hash)
    if (a || o) return
    let s = j(e),
      c = i && Yn(W.url) === Yn(i)
    if (!(s.reload || c)) {
      if (t <= s.preload_data) {
        ;((Q = { element: e, href: e.href }), (n = k.tap))
        let t = await Z(i, !1)
        if (!t) return
        Nn(t).catch(N)
      } else t <= s.preload_code && ((Q = { element: e, href: e.href }), (n = t), Fn(i))
    }
  }
  function c() {
    o.disconnect()
    for (let e of z.querySelectorAll(`a`)) {
      let { url: t, external: n, download: r } = At(e, C, B.hash)
      if (n || r) continue
      let i = j(e)
      i.reload ||
        (i.preload_code === k.viewport && o.observe(e), i.preload_code === k.eager && Fn(t))
    }
  }
  ;(U.add(c), c())
}
async function $(e, t) {
  if (e instanceof _e) return e.body
  let n
  n =
    e instanceof ge
      ? { kind: `app`, error: e.body }
      : e instanceof ye
        ? { kind: `framework`, error: { status: e.status, message: e.text } }
        : { kind: `unknown`, error: e }
  let r = n.kind === `unknown` ? { status: 500, message: `Internal Error` } : n.error,
    i = { ...n, event: t },
    a = await B.hooks.handleError(i)
  return { ...r, ...a }
}
function nr(e, t) {
  s(
    () => (
      e.add(t),
      () => {
        e.delete(t)
      }
    )
  )
}
function rr(e) {
  nr(U, e)
}
function ir(e) {
  if (typeof e == `function`) fn.push(e)
  else {
    let { href: t } = new URL(e, location.href)
    fn.push((e) => e.href === t)
  }
}
function ar() {
  ;((history.scrollRestoration = `manual`),
    addEventListener(`beforeunload`, (e) => {
      let t = !1
      if ((jn(), !G)) {
        let e = cr(W, void 0, null, `leave`),
          n = {
            ...e.navigation,
            cancel: () => {
              ;((t = !0), e.reject(Error(`navigation cancelled`)))
            }
          }
        mn.forEach((e) => e(n))
      }
      t && (e.preventDefault(), (e.returnValue = ``))
    }),
    addEventListener(`visibilitychange`, () => {
      document.visibilityState === `hidden` ? jn() : ce.check()
    }),
    addEventListener(`focus`, () => {
      ce.check()
    }),
    navigator.connection?.saveData || tr(),
    z.addEventListener(`click`, async (t) => {
      if (t.button || t.metaKey || t.ctrlKey || t.shiftKey || t.altKey || t.defaultPrevented) return
      let n = kt(t.composedPath()[0], z)
      if (!n) return
      let { url: r, external: i, target: a, download: o } = At(n, C, B.hash)
      if (!r) return
      if (a === `_parent` || a === `_top`) {
        if (window.parent !== window) return
      } else if (a && a !== `_self`) return
      let s = j(n)
      if (
        (!(n instanceof SVGAElement) &&
          r.protocol !== location.protocol &&
          r.protocol !== `https:` &&
          r.protocol !== `http:`) ||
        o
      )
        return
      let [c, l] = (B.hash ? r.hash.replace(/^#/, ``) : r.href).split(`#`),
        u = c === pe(location)
      if (i || (s.reload && (!u || !l))) {
        Xn({ url: r, type: `link`, event: t }) ? (G = !0) : t.preventDefault()
        return
      }
      if (l !== void 0 && u) {
        let [, i] = W.url.href.split(`#`)
        if (i === l) {
          if (
            (t.preventDefault(),
            l === `` || (l === `top` && n.ownerDocument.getElementById(`top`) === null))
          )
            scrollTo({ top: 0 })
          else {
            let e = n.ownerDocument.getElementById(decodeURIComponent(l))
            e && (e.scrollIntoView(), e.focus())
          }
          return
        }
        if (((K = { ...bn(), resetIndex: Y + +!!s.reset }), tn(q), e(r), !s.replace_state)) return
        K = null
      }
      ;(t.preventDefault(),
        await new Promise((e) => {
          ;(requestAnimationFrame(() => {
            setTimeout(e, 0)
          }),
            setTimeout(e, 100))
        }))
      let d = r.href !== location.href
      await Mn(r, {
        type: `link`,
        reset: s.reset,
        replace: s.replace_state ?? !d,
        refreshAll: !d,
        event: t
      })
    }),
    z.addEventListener(`submit`, (e) => {
      if (e.defaultPrevented) return
      let t = HTMLFormElement.prototype.cloneNode.call(e.target),
        n = e.submitter
      if ((n?.formTarget || t.target) === `_blank` || (n?.formMethod || t.method) !== `get`) return
      let r = new URL((n?.hasAttribute(`formaction`) && n?.formAction) || t.action)
      if (jt(r, C, !1)) return
      let i = e.target,
        a = j(i)
      if (a.reload) return
      ;(e.preventDefault(), e.stopPropagation())
      let o = new FormData(i, n)
      ;((r.search = new URLSearchParams(o).toString()),
        Zn({
          type: `form`,
          url: r,
          reset: a.reset,
          replace_state: a.replace_state ?? r.href === location.href,
          event: e
        }))
    }),
    addEventListener(`popstate`, async (t) => {
      let n = bn(t.state)
      if (n?.historyIndex) {
        let r = n.historyIndex,
          i = F[q]
        if (r === q) return
        X = xn = {}
        let a = r - q,
          o = n.resetIndex,
          s = o !== (i?.resetIndex ?? Y),
          c = F[r]?.scroll,
          l = E(n.state),
          u = new URL(n.pageUrl ?? location.href),
          d = n.navigationIndex,
          f = W.url && (location.href + W.url.href).includes(`#`) ? pe(location) === pe(W.url) : !1,
          p = d === J && ((vn && (n.pageUrl === void 0 || n.pageUrl === location.href)) || f),
          m = n.pageUrl ? new URL(location.href) : null,
          h = q,
          g = J,
          _ = Y
        ;(tn(h), p || kn(g), Ht(h), (q = r), (J = d), (Y = o))
        let v = X,
          y = m ? await Z(m, !1) : void 0
        if (X !== v) return
        let b = m
          ? { params: y?.params ?? null, route: y ? { id: y.route.id } : null, url: m }
          : null
        if (p) {
          ;(Pt(s),
            fe({ state: l, shallow: b }),
            e(u),
            s && c && scrollTo(c.x, c.y),
            Ut(q, Vt()),
            (G = !1),
            ue(null))
          return
        }
        await Zn({
          type: `popstate`,
          url: u,
          reset: s,
          popped: { state: l, scroll: c, delta: a, shallow: b },
          block: () => {
            ;((q = h), (J = g), (Y = _), history.go(-a))
          },
          nav_token: v,
          event: t
        })
      } else K || (e(new URL(location.href)), B.hash && location.reload())
    }),
    addEventListener(`hashchange`, () => {
      if (K) {
        let e = K
        ;((K = null),
          (Y = e.resetIndex),
          history.replaceState(
            { ...history.state, [O]: { ...e, historyIndex: ++q, navigationIndex: J } },
            ``,
            location.href
          ),
          nn(q, e))
      }
    }))
  for (let e of document.querySelectorAll(`link`)) en.has(e.rel) && (e.href = e.href)
  addEventListener(`pageshow`, (e) => {
    if (e.persisted) {
      ue(null)
      let e = F[q]?.scroll
      e && scrollTo(e.x, e.y)
    }
  })
  function e(e) {
    ;((W.url = e), fe({ url: e }))
  }
}
async function or(
  e,
  { status: t, error: n, node_ids: r, params: i, route: a, server_route: o, data: s, form: c }
) {
  gn = !0
  let l = new URL(location.href),
    u
  ;(({ params: i = {}, route: a = { id: null } } = (await Z(l, !1)) || {}),
    (u = on.find(({ id: e }) => e === a.id)))
  let d,
    f = !0
  try {
    let e = r.map(async (t, n) => {
        let r = s[n]
        return (
          r?.uses && (r.uses = sr(r.uses)),
          Rn({
            loader: B.nodes[t],
            url: l,
            params: i,
            route: a,
            parent: async () => {
              let t = {}
              for (let r = 0; r < n; r += 1) Object.assign(t, (await e[r]).data)
              return t
            },
            server_data_node: Vn(r)
          })
        )
      }),
      o = await Promise.all(e)
    if (u) {
      let e = u.layouts
      for (let t = 0; t < e.length; t++) e[t] || o.splice(t, 0, void 0)
    }
    d = await Ln({
      url: l,
      params: i,
      branch: o,
      status: t,
      error: n,
      errors: u?.errors,
      form: c,
      route: u ?? null
    })
  } catch (t) {
    if (t instanceof ve) return await R(new URL(t.location, location.href))
    ;((d = await Kn({ error: await $(t, { url: l, params: i, route: a }), url: l, route: a })),
      (e.textContent = ``),
      (f = !1))
  }
  if (d) {
    if (d.props.page) {
      let e = bn()
      d.props.page.state = e?.persistState ? E(e.state) : {}
    }
    await In(d, e, f)
  }
}
function sr(e) {
  return {
    dependencies: new Set(e?.dependencies ?? []),
    params: new Set(e?.params ?? []),
    parent: !!e?.parent,
    route: !!e?.route,
    url: !!e?.url,
    search_params: new Set(e?.search_params ?? [])
  }
}
function cr(e, t, n, r, i = null, a = !1, o) {
  let s,
    c,
    l = new Promise((e, t) => {
      ;((s = e), (c = t))
    })
  return (
    l.catch(N),
    {
      navigation: {
        from:
          r === `enter`
            ? null
            : { params: e.params, route: { id: e.route?.id ?? null }, url: e.url, scroll: Et() },
        to: n && {
          params: o ? o.params : (t?.params ?? null),
          route: { id: o ? (o.route?.id ?? null) : (t?.route?.id ?? null) },
          url: o?.url ?? n,
          scroll: i
        },
        willUnload: !a && !t,
        type: r,
        shallow: a,
        complete: l
      },
      fulfil: s,
      reject: c
    }
  )
}
function lr(e) {
  let t = new URL(e)
  return ((t.hash = decodeURIComponent(e.hash)), t)
}
function ur(e) {
  ;(fe(e.props.page),
    (L.tree.data = e.props.tree.data),
    (L.tree.child = e.props.tree.child),
    `form` in e.props && (L.form = e.props.form),
    `error` in e.props && (L.error = e.props.error))
}
export { Nt as load_css, Tn as start }
