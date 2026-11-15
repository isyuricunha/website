typeof window < `u` && ((window.__svelte ??= {}).v ??= new Set()).add(`5`)
var e = {},
  t = Symbol(`uninitialized`),
  n = Array.isArray,
  r = Array.prototype.indexOf,
  i = Array.prototype.includes,
  a = Array.from,
  o = Object.defineProperty,
  s = Object.getOwnPropertyDescriptor,
  c = Object.prototype,
  l = Array.prototype,
  u = Object.getPrototypeOf,
  d = Object.isExtensible,
  f = () => {}
function p(e) {
  for (var t = 0; t < e.length; t++) e[t]()
}
function m() {
  var e, t
  return {
    promise: new Promise((n, r) => {
      ;((e = n), (t = r))
    }),
    resolve: e,
    reject: t
  }
}
var h = 1024,
  g = 2048,
  _ = 4096,
  v = 8192,
  ee = 16384,
  te = 32768,
  ne = 1 << 25,
  re = 65536,
  ie = 1 << 19,
  ae = 1 << 20,
  oe = 1 << 21,
  se = 1 << 22,
  ce = 1 << 23,
  le = Symbol(`$state`),
  ue = Symbol(`component`),
  de = Symbol(`legacy props`),
  fe = Symbol(`attributes`),
  pe = Symbol(`class`),
  me = Symbol(`style`),
  he = Symbol(`text`),
  ge = new (class extends Error {
    name = `StaleReactionError`
    message = 'The reaction that called `getAbortSignal()` was re-run or destroyed'
  })()
globalThis.document?.contentType
function _e() {
  console.warn(`https://svelte.dev/e/derived_inert`)
}
function ve(e) {
  console.warn(`https://svelte.dev/e/hydration_mismatch`)
}
function ye() {
  console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`)
}
var y = !1
function b(e) {
  y = e
}
var x
function S(t) {
  if (t === null) throw (ve(), e)
  return (x = t)
}
function be() {
  return S(I(x))
}
function xe(t) {
  if (y) {
    if (I(x) !== null) throw (ve(), e)
    x = t
  }
}
function Se(e = 1) {
  if (y) {
    for (var t = e, n = x; t--;) n = I(n)
    x = n
  }
}
function Ce(e = !0) {
  for (var t = 0, n = x; ;) {
    if (n.nodeType === 8) {
      var r = n.data
      if (r === `]`) {
        if (t === 0) return n
        --t
      } else (r === `[` || r === `[!` || (r[0] === `[` && !isNaN(Number(r.slice(1))))) && (t += 1)
    }
    var i = I(n)
    ;(e && n.remove(), (n = i))
  }
}
function we(t) {
  if (!t || t.nodeType !== 8) throw (ve(), e)
  return t.data
}
function Te(e) {
  return e === this.v
}
function Ee(e, t) {
  return e == e ? e !== t || (typeof e == `object` && !!e) || typeof e == `function` : t == t
}
function De(e) {
  return !Ee(e, this.v)
}
function Oe(e) {
  throw Error(`https://svelte.dev/e/lifecycle_outside_component`)
}
function ke() {
  throw Error(`https://svelte.dev/e/async_derived_orphan`)
}
function Ae(e) {
  throw Error(`https://svelte.dev/e/effect_in_teardown`)
}
function je() {
  throw Error(`https://svelte.dev/e/effect_in_unowned_derived`)
}
function Me(e) {
  throw Error(`https://svelte.dev/e/effect_orphan`)
}
function Ne() {
  throw Error(`https://svelte.dev/e/effect_update_depth_exceeded`)
}
function Pe() {
  throw Error(`https://svelte.dev/e/hydration_failed`)
}
function Fe(e) {
  throw Error(`https://svelte.dev/e/props_invalid_value`)
}
function Ie() {
  throw Error(`https://svelte.dev/e/state_descriptors_fixed`)
}
function Le() {
  throw Error(`https://svelte.dev/e/state_prototype_fixed`)
}
function Re() {
  throw Error(`https://svelte.dev/e/state_unsafe_mutation`)
}
function ze() {
  throw Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`)
}
var C = null
function Be(e) {
  C = e
}
function Ve(e, t = !1, n) {
  C = { p: C, i: !1, c: null, e: null, s: e, x: null, r: G, l: null }
}
function He(e) {
  var t = C,
    n = t.e
  if (n !== null) {
    t.e = null
    for (var r of n) tn(r)
  }
  return (e !== void 0 && (t.x = e), (t.i = !0), (C = t.p), Ue(e))
}
function Ue(e = {}) {
  return (o(e, ue, { value: !0 }), e)
}
function We() {
  return !0
}
var w = []
function Ge() {
  var e = w
  ;((w = []), p(e))
}
function T(e) {
  if (w.length === 0 && !mt) {
    var t = w
    queueMicrotask(() => {
      t === w && Ge()
    })
  }
  w.push(e)
}
function Ke() {
  for (; w.length > 0;) Ge()
}
var qe = ~(g | _ | h)
function E(e, t) {
  e.f = (e.f & qe) | t
}
function Je(e) {
  e.f & 512 || e.deps === null ? E(e, h) : E(e, _)
}
function Ye(e, t) {
  ;(e.f & 2048 ? t.set(e, g) : e.f & 4096 && t.get(e) !== 2048 && t.set(e, _), E(e, h))
}
function Xe(e) {
  var t = H,
    n = G
  ;(W(null), K(null))
  try {
    return e()
  } finally {
    ;(W(t), K(n))
  }
}
function Ze(e, t, n, r) {
  let i = We() ? tt : at
  var a = e.filter((e) => !e.settled),
    o = t.map(i)
  if (n.length === 0 && a.length === 0) {
    r(o)
    return
  }
  var s = G,
    c = Qe(),
    l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null
  function u(e) {
    if (!(s.f & 16384)) {
      c()
      try {
        r([...o, ...e])
      } catch (e) {
        L(e, s)
      }
      $e()
    }
  }
  var d = et()
  if (n.length === 0) {
    l.then(() => u([])).finally(d)
    return
  }
  function f() {
    Promise.all(n.map((e) => rt(e)))
      .then(u)
      .catch((e) => L(e, s))
      .finally(d)
  }
  l
    ? l.then(() => {
        s.f & 16384 ? d() : (c(), f(), $e())
      })
    : f()
}
function Qe() {
  var e = G,
    t = H,
    n = C,
    r = D
  return function (i = !0) {
    ;(K(e), W(t), Be(n), i && !(e.f & 16384) && (r?.activate(), r?.apply()))
  }
}
function $e(e = !0) {
  ;(K(null), W(null), Be(null), e && D?.deactivate())
}
function et() {
  var e = G,
    t = e.b,
    n = D,
    r = !!t?.is_rendered()
  return (
    t?.update_pending_count(1, n),
    n.increment(r, e),
    () => {
      ;(t?.update_pending_count(-1, n), n.decrement(r, e))
    }
  )
}
function tt(e) {
  var n = 2 | g
  return (
    G !== null && (G.f |= ie),
    {
      ctx: C,
      deps: null,
      effects: null,
      equals: Te,
      f: n,
      fn: e,
      reactions: null,
      rv: 0,
      v: t,
      wv: 0,
      parent: G,
      ac: null
    }
  )
}
var nt = Symbol(`obsolete`)
function rt(e, n, r) {
  let i = G
  i === null && ke()
  var a = void 0,
    o = kt(t),
    s = !H,
    c = new Set()
  return (
    an(() => {
      var t = G,
        n = m()
      a = n.promise
      try {
        Promise.resolve(e())
          .then(n.resolve, (e) => {
            e !== ge && n.reject(e)
          })
          .finally($e)
      } catch (e) {
        ;(n.reject(e), $e())
      }
      var r = D
      if (s) {
        if (t.f & 32768) var l = et()
        if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(nt)
        else for (let e of c.values()) e.reject(nt)
        ;(c.add(n), r.async_deriveds.set(t, n))
      }
      let u = (e, t = void 0) => {
        ;(l?.(),
          c.delete(n),
          t !== nt &&
            (r.activate(),
            t ? ((o.f |= ce), jt(o, t)) : (o.f & 8388608 && (o.f ^= ce), jt(o, e)),
            r.deactivate()))
      }
      n.promise.then(u, (e) => u(null, e || `unknown`))
    }),
    $t(() => {
      for (let e of c) e.reject(nt)
    }),
    new Promise((e) => {
      function t(n) {
        function r() {
          n === a ? e(o) : t(a)
        }
        n.then(r, r)
      }
      t(a)
    })
  )
}
function it(e) {
  let t = tt(e)
  return (xn(t), t)
}
function at(e) {
  let t = tt(e)
  return ((t.equals = De), t)
}
function ot(e) {
  var t = e.effects
  if (t !== null) {
    e.effects = null
    for (var n = 0; n < t.length; n += 1) B(t[n])
  }
}
function st(e) {
  var n,
    r = G,
    i = e.parent
  if (!V && i !== null && e.v !== t && i.f & 24576) return (_e(), e.v)
  K(i)
  try {
    ;(ot(e), (n = kn(e)))
  } finally {
    K(r)
  }
  return n
}
function ct(e) {
  var t = st(e)
  !e.equals(t) &&
  ((e.wv = En()),
  (!D?.is_fork || e.deps === null) &&
    (D === null ? (e.v = t) : (D.capture(e, t, !0), ft?.capture(e, t, !0)), e.deps === null))
    ? E(e, h)
    : V || (O === null ? Je(e) : (Qt() || D?.is_fork) && O.set(e, t))
}
function lt(e) {
  if (e.effects !== null)
    for (let t of e.effects)
      (t.teardown || t.ac) &&
        (t.teardown?.(),
        t.ac !== null &&
          Xe(() => {
            ;(t.ac.abort(ge), (t.ac = null))
          }),
        t.fn !== null && (t.teardown = f),
        Mn(t, 0),
        un(t))
}
function ut(e) {
  if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Nn(t)
}
var dt = null,
  D = null,
  ft = null,
  O = null,
  pt = null,
  mt = !1,
  ht = !1,
  gt = null,
  _t = null,
  vt = 0,
  yt = 1,
  bt = class e {
    id = yt++
    started = !1
    linked = !0
    prev = null
    next = null
    async_deriveds = new Map()
    current = new Map()
    previous = new Map()
    #e = new Set()
    #t = new Set()
    #n = 0
    #r = new Map()
    #i = null
    #a = []
    #o = []
    #s = new Map()
    #c = new Map()
    #l = new Set()
    is_fork = !1
    #u = !1
    constructor() {
      ;(dt === null ? (dt = this) : ((dt.next = this), (this.prev = dt)), (dt = this))
    }
    #d() {
      if (this.is_fork) return !0
      for (let e of this.#r.keys()) if (!this.#f(e)) return !0
      return !1
    }
    #f(e) {
      for (var t = e; t !== null; t = t.parent) if (this.#c.has(t)) return !0
      return !1
    }
    skip_effect(e) {
      ;(this.#c.has(e) || this.#c.set(e, { d: [], m: [] }), this.#l.delete(e))
    }
    unskip_effect(e, t = (e) => this.schedule(e)) {
      var n = this.#c.get(e)
      if (n) {
        this.#c.delete(e)
        for (var r of n.d) (E(r, g), t(r))
        for (r of n.m) (E(r, _), t(r))
      }
      this.#l.add(e)
    }
    #p() {
      var e = []
      for (let i of this.#a)
        if (!(i.f & 16384 || !(i.f & 6144))) {
          for (var t = i, n = !1; t.parent !== null;) {
            t = t.parent
            var r = t.f
            if (r & 96) {
              if (!(r & 1024)) {
                n = !0
                break
              }
              t.f ^= h
            }
          }
          n || e.push(t)
        }
      return ((this.#a = []), e)
    }
    #m() {
      this.started = !0
      for (let [e, t] of this.#s) (E(e, t), this.schedule(e))
      this.apply()
      for (var t = (gt = []), n = [], r = (_t = []); this.#a.length > 0;) {
        vt++ > 1e3 && (this.#b(), St())
        for (let e of this.#p())
          try {
            this.#h(e, t, n)
          } catch (t) {
            throw (Et(e), this.#d() || this.discard(), t)
          }
      }
      if (((D = null), r.length > 0)) {
        var i = e.ensure()
        for (let e of r) i.schedule(e)
      }
      if (((gt = null), (_t = null), this.#d())) {
        ;(this.#y(n), this.#y(t))
        for (let [e, t] of this.#c) Tt(e, t)
        r.length > 0 && D.#m()
        return
      }
      let a = this.#g()
      if (a) (this.#y(n), this.#y(t), a.#v(this))
      else {
        this.#s.clear()
        for (let e of this.#e) e(this)
        ;(this.#e.clear(), (ft = this), Ct(n), Ct(t), (ft = null), this.#i?.resolve())
        var o = D
        ;(this.#n === 0 && (this.#a.length === 0 || o !== null) && this.#b(),
          o !== null && (A.clear(), o.#m()))
      }
    }
    #h(e, t, n) {
      e.f ^= h
      for (var r = e.first; r !== null;) {
        var i = r.f,
          a = !!(i & 96)
        if (!((a && i & 1024) || i & 8192 || this.#c.has(r)) && r.fn !== null) {
          a
            ? (r.f ^= h)
            : i & 4
              ? t.push(r)
              : Dn(r) && (i & 16 && this.add_dirty_reaction(r, _), Nn(r))
          var o = r.first
          if (o !== null) {
            r = o
            continue
          }
        }
        for (; r !== null;) {
          var s = r.next
          if (s !== null) {
            r = s
            break
          }
          r = r.parent
        }
      }
    }
    #g() {
      for (var e = this.prev; e !== null; e = e.prev) if (!e.is_fork && this.#_(e)) return e
      return null
    }
    #_(e) {
      for (let [t, [, n]] of this.current) if (!n && e.current.has(t)) return !0
      return !1
    }
    #v(e) {
      for (let [t, n] of e.current)
        (!this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)),
          this.current.set(t, n))
      for (let [t, n] of e.async_deriveds) {
        let e = this.async_deriveds.get(t)
        e && n.promise.then(e.resolve).catch(e.reject)
      }
      ;(e.async_deriveds.clear(), this.transfer_reactions(e.#s))
      let t = (e) => {
        var n = e.reactions
        if (n !== null && !(e.f & 2 && !(e.f & 6144)))
          for (let e of n) {
            var r = e.f
            if (r & 2) t(e)
            else {
              var i = e
              r & 4194320 &&
                !this.async_deriveds.has(i) &&
                (this.#s.delete(i), E(i, g), this.schedule(i))
            }
          }
      }
      for (let e of this.current.keys()) t(e)
      ;(this.oncommit(() => e.discard()), e.#b(), (D = this), this.#m())
    }
    #y(e) {
      for (var t = 0; t < e.length; t += 1) Ye(e[t], this.#s)
    }
    capture(e, n, r = !1) {
      ;(e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v),
        e.f & 8388608 || (this.current.set(e, [n, r]), O?.set(e, n)),
        this.is_fork || (e.v = n))
    }
    activate() {
      D = this
    }
    deactivate() {
      ;((D = null), (O = null))
    }
    flush() {
      try {
        ;((ht = !0), (D = this), this.#m())
      } finally {
        ;((vt = 0),
          (pt = null),
          (gt = null),
          (_t = null),
          (ht = !1),
          (D = null),
          (O = null),
          A.clear())
      }
    }
    discard() {
      for (let e of this.#t) e(this)
      this.#t.clear()
      for (let e of this.async_deriveds.values()) e.reject(nt)
      ;(this.#b(), this.#i?.resolve())
    }
    register_created_effect(e) {
      this.#o.push(e)
    }
    increment(e, t) {
      if (((this.#n += 1), e)) {
        let e = this.#r.get(t) ?? 0
        this.#r.set(t, e + 1)
      }
    }
    decrement(e, t) {
      if ((--this.#n, e)) {
        let e = this.#r.get(t) ?? 0
        e === 1 ? this.#r.delete(t) : this.#r.set(t, e - 1)
      }
      this.#u ||
        ((this.#u = !0),
        T(() => {
          ;((this.#u = !1), this.linked && this.flush())
        }))
    }
    transfer_reactions(e) {
      for (let [t, n] of e) this.add_dirty_reaction(t, n)
      e.clear()
    }
    add_dirty_reaction(e, t) {
      ;(t === 2048 || this.#s.get(e) !== 2048) && this.#s.set(e, t)
    }
    oncommit(e) {
      this.#e.add(e)
    }
    ondiscard(e) {
      this.#t.add(e)
    }
    settled() {
      return (this.#i ??= m()).promise
    }
    static ensure() {
      if (D === null) {
        let t = (D = new e())
        !ht &&
          !mt &&
          T(() => {
            t.started || t.flush()
          })
      }
      return D
    }
    apply() {
      O = null
    }
    schedule(e) {
      ;((pt = e),
        e.b?.is_pending && e.f & 16777228 && !(e.f & 32768) ? e.b.defer_effect(e) : this.#a.push(e))
    }
    #b() {
      if (this.linked) {
        var e = this.prev,
          t = this.next
        ;(e === null || (e.next = t), t === null ? (dt = e) : (t.prev = e), (this.linked = !1))
      }
    }
  }
function xt(e) {
  var t = mt,
    n = ft
  ;((ft = null), (mt = !0))
  try {
    var r
    for (e && (xt(), (r = e())); ;) {
      if ((Ke(), D === null)) return r
      D.flush()
    }
  } finally {
    ;((mt = t), (ft = n))
  }
}
function St() {
  try {
    Ne()
  } catch (e) {
    L(e, pt)
  }
}
var k = null
function Ct(e) {
  var t = e.length
  if (t !== 0) {
    for (var n = 0; n < t;) {
      var r = e[n++]
      if (
        !(r.f & 24576) &&
        Dn(r) &&
        ((k = new Set()),
        Nn(r),
        r.deps === null &&
          r.first === null &&
          r.nodes === null &&
          r.teardown === null &&
          r.ac === null &&
          pn(r),
        k?.size > 0)
      ) {
        A.clear()
        for (let e of k) {
          if (e.f & 24576) continue
          let t = [e],
            n = e.parent
          for (; n !== null;) (k.has(n) && (k.delete(n), t.push(n)), (n = n.parent))
          for (let e = t.length - 1; e >= 0; e--) {
            let n = t[e]
            n.f & 24576 || Nn(n)
          }
        }
        k.clear()
      }
    }
    k = null
  }
}
function wt(e) {
  D.schedule(e)
}
function Tt(e, t) {
  if (!(e.f & 32 && e.f & 1024)) {
    ;(e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), E(e, h))
    for (var n = e.first; n !== null;) (Tt(n, t), (n = n.next))
  }
}
function Et(e) {
  E(e, h)
  for (var t = e.first; t !== null;) (Et(t), (t = t.next))
}
var Dt = new Set(),
  A = new Map(),
  Ot = !1
function kt(e, t) {
  return { f: 0, v: e, reactions: null, equals: Te, rv: 0, wv: 0 }
}
function j(e, t) {
  let n = kt(e, t)
  return (xn(n), n)
}
function M(e, t, n = !1) {
  return (
    H !== null &&
      (!U || H.f & 131072) &&
      We() &&
      H.f & 4325394 &&
      (q === null || !q.has(e)) &&
      Re(),
    jt(e, n ? Ft(t) : t, _t)
  )
}
var N = null,
  At = 0
function jt(e, t, n = null) {
  if (!e.equals(t)) {
    V ? A.set(e, t) : A.has(e) || A.set(e, e.v)
    var r = bt.ensure()
    if ((r.capture(e, t), e.f & 2)) {
      let t = e
      ;(e.f & 2048 && st(t), O === null && Je(t))
    }
    ;((e.wv = En()),
      (N = null),
      (At = 0),
      Pt(e, g, n),
      (N = null),
      We() && G !== null && G.f & 1024 && !(G.f & 96) && (X === null ? Sn([e]) : X.push(e)),
      !r.is_fork && Dt.size > 0 && !Ot && Mt())
  }
  return t
}
function Mt() {
  Ot = !1
  for (let e of Dt) {
    e.f & 1024 && E(e, _)
    let t
    try {
      t = Dn(e)
    } catch {
      t = !0
    }
    t && Nn(e)
  }
  Dt.clear()
}
function Nt(e) {
  M(e, e.v + 1)
}
function Pt(e, t, n) {
  var r = e.reactions
  if (r !== null) {
    var i = We(),
      a = r.length
    if (((At += a), At > 1e5 && N === null && (N = new Set()), N !== null)) {
      if (N.has(e)) return
      N.add(e)
    }
    for (var o = 0; o < a; o++) {
      var s = r[o],
        c = s.f
      if (i || s !== G) {
        var l = (c & g) === 0
        if ((l && E(s, t), c & 131072)) Dt.add(s)
        else if (c & 2) {
          var u = s
          ;(O?.delete(u), Pt(u, _, n))
        } else if (l) {
          var d = s
          ;(c & 16 && k !== null && k.add(d), n === null ? wt(d) : n.push(d))
        }
      }
    }
  }
}
function Ft(e) {
  if (typeof e != `object` || !e || le in e || ue in e) return e
  let r = u(e)
  if (r !== c && r !== l) return e
  var i = new Map(),
    a = n(e),
    o = j(0),
    d = null,
    f = wn,
    p = (e) => {
      if (wn === f) return e()
      var t = H,
        n = wn
      ;(W(null), Tn(f))
      var r = e()
      return (W(t), Tn(n), r)
    }
  return (
    a && i.set(`length`, j(e.length, d)),
    new Proxy(e, {
      defineProperty(e, t, n) {
        ;(`value` in n && n.configurable !== !1 && n.enumerable !== !1 && n.writable !== !1) || Ie()
        var r = i.get(t)
        return (
          r === void 0
            ? p(() => {
                var e = j(n.value, d)
                return (i.set(t, e), e)
              })
            : M(r, n.value, !0),
          !0
        )
      },
      deleteProperty(e, n) {
        var r = i.get(n)
        if (r === void 0) {
          if (n in e) {
            let e = p(() => j(t, d))
            ;(i.set(n, e), Nt(o))
          }
        } else (M(r, t), Nt(o))
        return !0
      },
      get(n, r, a) {
        if (r === le) return e
        var o = i.get(r),
          c = r in n
        if (
          (o === void 0 &&
            (!c || s(n, r)?.writable) &&
            ((o = p(() => j(Ft(c ? n[r] : t), d))), i.set(r, o)),
          o !== void 0)
        ) {
          var l = Q(o)
          return l === t ? void 0 : l
        }
        return Reflect.get(n, r, a)
      },
      getOwnPropertyDescriptor(e, n) {
        this.has?.(e, n)
        var r = Reflect.getOwnPropertyDescriptor(e, n),
          a = i.get(n)
        if (a !== void 0) {
          var o = Q(a)
          if (o === t) return
          if (r && `value` in r) r.value = o
          else return { enumerable: !0, configurable: !0, value: o, writable: !0 }
        }
        return r
      },
      has(e, n) {
        if (n === le) return !0
        var r = i.get(n),
          a = (r !== void 0 && r.v !== t) || Reflect.has(e, n)
        return (r !== void 0 || ((G !== null || H !== null) && (!a || s(e, n)?.writable))) &&
          (r === void 0 && ((r = p(() => j(a ? Ft(e[n]) : t, d))), i.set(n, r)), Q(r) === t)
          ? !1
          : a
      },
      set(e, n, r, c) {
        var l = i.get(n),
          u = n in e
        if (a && n === `length`)
          for (var f = r; f < l.v; f += 1) {
            var m = i.get(f + ``)
            m === void 0 ? f in e && ((m = p(() => j(t, d))), i.set(f + ``, m)) : M(m, t)
          }
        if (l === void 0)
          (!u || s(e, n)?.writable) && ((l = p(() => j(void 0, d))), M(l, Ft(r)), i.set(n, l))
        else {
          u = l.v !== t
          var h = p(() => Ft(r))
          M(l, h)
        }
        var g = Reflect.getOwnPropertyDescriptor(e, n)
        if ((g?.set && g.set.call(c, r), !u)) {
          if (a && typeof n == `string`) {
            var _ = i.get(`length`),
              v = Number(n)
            Number.isInteger(v) && v >= _.v && M(_, v + 1)
          }
          Nt(o)
        }
        return !0
      },
      ownKeys(e) {
        Q(o)
        var n = Reflect.ownKeys(e).filter((e) => {
          var n = i.get(e)
          return n === void 0 || n.v !== t
        })
        for (var [r, a] of i) a.v !== t && !(r in e) && n.push(r)
        return n
      },
      setPrototypeOf() {
        Le()
      }
    })
  )
}
var It, Lt, Rt, zt
function Bt() {
  if (It === void 0) {
    ;((It = window), (Lt = /Firefox/.test(navigator.userAgent)))
    var e = Element.prototype,
      t = Node.prototype,
      n = Text.prototype
    ;((Rt = s(t, `firstChild`).get),
      (zt = s(t, `nextSibling`).get),
      d(e) && ((e[pe] = void 0), (e[fe] = null), (e[me] = void 0), (e.__e = void 0)),
      d(n) && (n[he] = void 0))
  }
}
function P(e = ``) {
  return document.createTextNode(e)
}
function F(e) {
  return Rt.call(e)
}
function I(e) {
  return zt.call(e)
}
function Vt(e, t) {
  if (!y) return F(e)
  var n = F(x)
  if (n === null) n = x.appendChild(P())
  else if (t && n.nodeType !== 3) {
    var r = P()
    return (n?.before(r), S(r), r)
  }
  return (t && Jt(n), S(n), n)
}
function Ht(e, t = !1) {
  if (!y) {
    var n = F(e)
    return n instanceof Comment && n.data === `` ? I(n) : n
  }
  if (t) {
    if (x?.nodeType !== 3) {
      var r = P()
      return (x?.before(r), S(r), r)
    }
    Jt(x)
  }
  return x
}
function Ut(e, t = !1) {
  if (!y) return F(e)
  var n = Vt(e, t)
  return (xe(e), n)
}
function Wt(e, t = 1, n = !1) {
  let r = y ? x : e
  for (var i; t--;) ((i = r), (r = I(r)))
  if (!y) return r
  if (n) {
    if (r?.nodeType !== 3) {
      var a = P()
      return (r === null ? i?.after(a) : r.before(a), S(a), a)
    }
    Jt(r)
  }
  return (S(r), r)
}
function Gt(e) {
  e.textContent = ``
}
function Kt() {
  return !1
}
function qt(e, t, n) {
  return t == null || t === `http://www.w3.org/1999/xhtml`
    ? n
      ? document.createElement(e, { is: n })
      : document.createElement(e)
    : n
      ? document.createElementNS(t, e, { is: n })
      : document.createElementNS(t, e)
}
function Jt(e) {
  if (e.nodeValue.length < 65536) return
  let t = e.nextSibling
  for (; t !== null && t.nodeType === 3;)
    (t.remove(), (e.nodeValue += t.nodeValue), (t = e.nextSibling))
}
function Yt(e) {
  var t = G
  if (t === null) return ((H.f |= ce), e)
  if (!(t.f & 32768) && !(t.f & 4)) throw e
  L(e, t)
}
function L(t, n) {
  if (t === e) throw t
  if (!(n !== null && n.f & 16384)) {
    for (; n !== null;) {
      if (n.f & 128 && !(n.f & 33570816)) {
        if (!(n.f & 32768)) throw t
        try {
          n.b.error(t)
          return
        } catch (e) {
          t = e
        }
      }
      n = n.parent
    }
    throw t
  }
}
function Xt(e) {
  ;(G === null && (H === null && Me(e), je()), V && Ae(e))
}
function Zt(e, t) {
  var n = t.last
  n === null ? (t.last = t.first = e) : ((n.next = e), (e.prev = n), (t.last = e))
}
function R(e, t) {
  var n = G
  n !== null && n.f & 8192 && (e |= v)
  var r = {
    ctx: C,
    deps: null,
    nodes: null,
    f: e | g | 512,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: n,
    b: n && n.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  }
  D?.register_created_effect(r)
  var i = r
  if (e & 4) gt === null ? bt.ensure().schedule(r) : gt.push(r)
  else if (t !== null) {
    try {
      Nn(r)
    } catch (e) {
      throw (B(r), e)
    }
    i.deps === null &&
      i.teardown === null &&
      i.nodes === null &&
      i.first === i.last &&
      !(i.f & 524288) &&
      ((i = i.first), e & 16 && e & 65536 && i !== null && (i.f |= re))
  }
  if (i !== null && ((i.parent = n), n !== null && Zt(i, n), H !== null && H.f & 2 && !(e & 64))) {
    var a = H
    ;(a.effects ??= []).push(i)
  }
  return r
}
function Qt() {
  return H !== null && !U
}
function $t(e) {
  let t = R(8, null)
  return (E(t, h), (t.teardown = e), t)
}
function en(e) {
  Xt(`$effect`)
  var t = G.f
  if (!H && t & 32 && C !== null && !C.i) {
    var n = C
    ;(n.e ??= []).push(e)
  } else return tn(e)
}
function tn(e) {
  return R(4 | ae, e)
}
function nn(e) {
  bt.ensure()
  let t = R(64 | ie, e)
  return (e = {}) =>
    new Promise((n) => {
      e.outro
        ? mn(t, () => {
            ;(B(t), n(void 0))
          })
        : (B(t), n(void 0))
    })
}
function rn(e) {
  return R(4, e)
}
function an(e) {
  return R(se | ie, e)
}
function on(e, t = 0) {
  return R(8 | t, e)
}
function sn(e, t = [], n = [], r = []) {
  Ze(r, t, n, (t) => {
    R(8, () => {
      e(...t.map(Q))
    })
  })
}
function cn(e, t = 0) {
  return R(16 | t, e)
}
function z(e) {
  return R(32 | ie, e)
}
function ln(e) {
  var t = e.teardown
  if (t !== null) {
    let n = V,
      r = H
    ;(bn(!0), W(null))
    try {
      t.call(null)
    } catch (t) {
      L(t, e.parent)
    } finally {
      ;(bn(n), W(r))
    }
  }
}
function un(e, t = !1) {
  var n = e.first
  for (e.first = e.last = null; n !== null;) {
    let e = n.ac
    e !== null &&
      Xe(() => {
        e.abort(ge)
      })
    var r = n.next
    ;(n.f & 64 ? (n.parent = null) : B(n, t), (n = r))
  }
}
function dn(e) {
  for (var t = e.first; t !== null;) {
    var n = t.next
    ;(t.f & 32 || B(t), (t = n))
  }
}
function B(e, t = !0) {
  var n = !1
  ;((t || e.f & 262144) &&
    e.nodes !== null &&
    e.nodes.end !== null &&
    (fn(e.nodes.start, e.nodes.end), (n = !0)),
    (e.f |= ne),
    un(e, t && !n),
    Mn(e, 0))
  var r = e.nodes && e.nodes.t
  if (r !== null) for (let e of r) e.stop()
  ;(ln(e), (e.f ^= ne), (e.f |= ee))
  var i = e.parent
  ;(i !== null && i.first !== null && pn(e),
    (e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null))
}
function fn(e, t) {
  for (; e !== null;) {
    var n = e === t ? null : I(e)
    ;(e.remove(), (e = n))
  }
}
function pn(e) {
  var t = e.parent,
    n = e.prev,
    r = e.next
  ;(n !== null && (n.next = r),
    r !== null && (r.prev = n),
    t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n)))
}
function mn(e, t, n = !0) {
  var r = []
  ;((e.f |= 256), hn(e, r, !0))
  var i = () => {
      ;(n && B(e), t && t())
    },
    a = r.length
  if (a > 0) {
    var o = () => --a || i()
    for (var s of r) s.out(o)
  } else i()
}
function hn(e, t, n) {
  if (!(e.f & 8192)) {
    e.f ^= v
    var r = e.nodes && e.nodes.t
    if (r !== null) for (let e of r) (e.is_global || n) && t.push(e)
    for (var i = e.first; i !== null;) {
      var a = i.next
      if (!(i.f & 64)) {
        var o = !!(i.f & 65536) || (!!(i.f & 32) && !!(e.f & 16))
        hn(i, t, o ? n : !1)
      }
      i = a
    }
  }
}
function gn(e) {
  ;((e.f &= -257), _n(e, !0))
}
function _n(e, t) {
  if (!(e.f & 256) && e.f & 8192) {
    ;((e.f ^= v), e.f & 1024 || (E(e, g), bt.ensure().schedule(e)))
    for (var n = e.first; n !== null;) {
      var r = n.next,
        i = !!(n.f & 65536) || !!(n.f & 32)
      ;(_n(n, i ? t : !1), (n = r))
    }
    var a = e.nodes && e.nodes.t
    if (a !== null) for (let e of a) (e.is_global || t) && e.in()
  }
}
function vn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
      var i = n === r ? null : I(n)
      ;(t.append(n), (n = i))
    }
}
var yn = null,
  V = !1
function bn(e) {
  V = e
}
var H = null,
  U = !1
function W(e) {
  H = e
}
var G = null
function K(e) {
  G = e
}
var q = null
function xn(e) {
  H !== null && (H.f & 2097152 || H.f & 2) && (q ??= new Set()).add(e)
}
var J = null,
  Y = 0,
  X = null
function Sn(e) {
  X = e
}
var Cn = 1,
  Z = 0,
  wn = Z
function Tn(e) {
  wn = e
}
function En() {
  return ++Cn
}
function Dn(e) {
  var t = e.f
  if (t & 2048) return !0
  if (t & 4096) {
    for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
      var a = n[i]
      if ((Dn(a) && ct(a), a.wv > e.wv)) return !0
    }
    t & 512 && O === null && E(e, h)
  }
  return !1
}
function On(e, t, n = !0) {
  var r = e.reactions
  if (r !== null && !(q !== null && q.has(e)))
    for (var i = 0; i < r.length; i++) {
      var a = r[i]
      a.f & 2 ? On(a, t, !1) : t === a && (n ? E(a, g) : a.f & 1024 && E(a, _), wt(a))
    }
}
function kn(e) {
  var t = J,
    n = Y,
    r = X,
    i = H,
    a = q,
    o = C,
    s = U,
    c = wn,
    l = e.f
  ;((J = null),
    (Y = 0),
    (X = null),
    (H = l & 96 ? null : e),
    (q = null),
    Be(e.ctx),
    (U = !1),
    (wn = ++Z),
    e.ac !== null &&
      (Xe(() => {
        e.ac.abort(ge)
      }),
      (e.ac = null)))
  try {
    e.f |= oe
    var u = e.fn,
      d = u()
    e.f |= te
    var f = An(e)
    if (We() && X !== null && !U && f !== null && !(e.f & 6146))
      for (var p = 0; p < X.length; p++) On(X[p], e)
    if (i !== null && i !== e) {
      if ((Z++, i.deps !== null)) for (let e = 0; e < n; e += 1) i.deps[e].rv = Z
      if (t !== null) for (let e of t) e.rv = Z
      X !== null && (r === null ? (r = X) : r.push(...X))
    }
    return (e.f & 8388608 && (e.f ^= ce), d)
  } catch (t) {
    return (An(e), Yt(t))
  } finally {
    ;((e.f ^= oe), (J = t), (Y = n), (X = r), (H = i), (q = a), Be(o), (U = s), (wn = c))
  }
}
function An(e) {
  var t = e.deps,
    n = D?.is_fork
  if (J !== null) {
    var r
    if ((n || Mn(e, Y), t !== null && Y > 0))
      for (t.length = Y + J.length, r = 0; r < J.length; r++) t[Y + r] = J[r]
    else e.deps = t = J
    if (Qt() && e.f & 512) for (r = Y; r < t.length; r++) (t[r].reactions ??= []).push(e)
  } else !n && t !== null && Y < t.length && (Mn(e, Y), (t.length = Y))
  return t
}
function jn(e, n) {
  let a = n.reactions
  if (a !== null) {
    var o = r.call(a, e)
    if (o !== -1) {
      var s = a.length - 1
      s === 0 ? (a = n.reactions = null) : ((a[o] = a[s]), a.pop())
    }
  }
  if (a === null && n.f & 2 && (J === null || !i.call(J, n))) {
    var c = n
    ;(c.f & 512 && (c.f ^= 512),
      c.v !== t && Je(c),
      c.ac !== null &&
        Xe(() => {
          ;(c.ac.abort(ge), (c.ac = null), E(c, g))
        }),
      lt(c),
      Mn(c, 0))
  }
}
function Mn(e, t) {
  var n = e.deps
  if (n !== null) for (var r = t; r < n.length; r++) jn(e, n[r])
}
function Nn(e) {
  var t = e.f
  if (!(t & 16384)) {
    E(e, h)
    var n = G
    G = e
    try {
      ;(t & 16777232 ? dn(e) : un(e), ln(e))
      var r = kn(e)
      ;((e.teardown = typeof r == `function` ? r : null), (e.wv = Cn))
    } finally {
      G = n
    }
  }
}
async function Pn() {
  ;(await Promise.resolve(), xt())
}
function Fn() {
  return bt.ensure().settled()
}
function Q(e) {
  var t = !!(e.f & 2)
  if ((yn?.add(e), H !== null && !U && !(G !== null && G.f & 16384) && (q === null || !q.has(e)))) {
    var n = H.deps
    if (H.f & 2097152)
      e.rv < Z &&
        ((e.rv = Z),
        J === null && n !== null && n[Y] === e ? Y++ : J === null ? (J = [e]) : J.push(e))
    else {
      ;((H.deps ??= []), i.call(H.deps, e) || H.deps.push(e))
      var r = e.reactions
      r === null ? (e.reactions = [H]) : i.call(r, H) || r.push(H)
    }
  }
  if (V && A.has(e)) return A.get(e)
  if (t) {
    var a = e
    if (V) {
      var o = a.v
      return (((!(a.f & 1024) && a.reactions !== null) || Ln(a)) && (o = st(a)), A.set(a, o), o)
    }
    var s = !(a.f & 512) && !U && H !== null && !!(H.f & 512),
      c = (a.f & te) === 0
    ;(Dn(a) && (s && (a.f |= 512), ct(a)), s && !c && (ut(a), In(a)))
  }
  if (O?.has(e)) return O.get(e)
  if (e.f & 8388608) throw e.v
  return e.v
}
function In(e) {
  if (((e.f |= 512), e.deps !== null))
    for (let n of e.deps) {
      var t = n.reactions
      ;(t === null ? (n.reactions = [e]) : i.call(t, e) || t.push(e),
        n.f & 2 && !(n.f & 512) && (ut(n), In(n)))
    }
}
function Ln(e) {
  if (e.v === t) return !0
  if (e.deps === null) return !1
  for (let t of e.deps) if (A.has(t) || (t.f & 2 && Ln(t))) return !0
  return !1
}
function Rn(e) {
  var t = U
  try {
    return ((U = !0), e())
  } finally {
    U = t
  }
}
var zn = Symbol(`events`),
  Bn = new Set(),
  Vn = new Set(),
  Hn = null,
  Un = !1
function Wn(e) {
  var t = this,
    n = t.ownerDocument,
    r = e.type,
    i = e.composedPath?.() || [],
    a = i[0] || e.target
  ;((Hn = e),
    Un ||
      ((Un = !0),
      setTimeout(() => {
        ;((Un = !1), (Hn = null))
      })))
  var s = 0,
    c = Hn === e && e[zn]
  if (c) {
    var l = i.indexOf(c)
    if (l !== -1 && (t === document || t === window)) {
      e[zn] = t
      return
    }
    var u = i.indexOf(t)
    if (u === -1) return
    l <= u && (s = l)
  }
  if (((a = i[s] || e.target), a !== t)) {
    o(e, `currentTarget`, {
      configurable: !0,
      get() {
        return a || n
      }
    })
    var d = H,
      f = G
    ;(W(null), K(null))
    try {
      for (var p, m = []; a !== null && a !== t;) {
        try {
          var h = a[zn]?.[r]
          h == null || (a.disabled && e.target !== a) || h.call(a, e)
        } catch (e) {
          p ? m.push(e) : (p = e)
        }
        if (e.cancelBubble) break
        ;(s++, (a = s < i.length ? i[s] : null))
      }
      if (p) {
        for (let e of m)
          queueMicrotask(() => {
            throw e
          })
        throw p
      }
    } finally {
      ;((e[zn] = t), delete e.currentTarget, W(d), K(f))
    }
  }
}
var Gn =
  globalThis?.window?.trustedTypes &&
  globalThis.window.trustedTypes.createPolicy(`svelte-trusted-html`, { createHTML: (e) => e })
function Kn(e) {
  return Gn?.createHTML(e) ?? e
}
function qn(e) {
  var t = qt(`template`)
  return ((t.innerHTML = Kn(e.replaceAll(`<!>`, `<!---->`))), t.content)
}
function $(e, t) {
  var n = G
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null })
}
function Jn(e, t) {
  var n = !!(t & 1),
    r = !!(t & 2),
    i,
    a = !e.startsWith(`<!>`)
  return () => {
    if (y) return ($(x, null), x)
    i === void 0 && ((i = qn(a ? e : `<!>` + e)), n || (i = F(i)))
    var t = r || Lt ? document.importNode(i, !0) : i.cloneNode(!0)
    if (n) {
      var o = F(t),
        s = t.lastChild
      $(o, s)
    } else $(t, t)
    return t
  }
}
function Yn(e = ``) {
  if (!y) {
    var t = P(e + ``)
    return ($(t, t), t)
  }
  var n = x
  return (n.nodeType === 3 ? Jt(n) : (n.before((n = P())), S(n)), $(n, n), n)
}
function Xn() {
  if (y) return ($(x, null), x)
  var e = document.createDocumentFragment(),
    t = document.createComment(``),
    n = P()
  return (e.append(t, n), $(t, n), e)
}
function Zn(e, t) {
  if (y) {
    var n = G
    ;((n.f & 32768 && n.nodes.end !== null) || (n.nodes.end = x), be())
  } else e !== null && e.before(t)
}
;[
  ...`allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback`.split(
    `.`
  )
]
var Qn = [`touchstart`, `touchmove`]
function $n(e) {
  return Qn.includes(e)
}
function er(e) {
  let t = 0,
    n = kt(0),
    r
  return () => {
    Qt() &&
      (Q(n),
      on(
        () => (
          t === 0 && (r = Rn(() => e(() => Nt(n)))),
          (t += 1),
          () => {
            T(() => {
              ;(--t, t === 0 && (r?.(), (r = void 0), Nt(n)))
            })
          }
        )
      ))
  }
}
var tr = re | ie
function nr(e, t, n, r) {
  new rr(e, t, n, r)
}
var rr = class {
  parent
  is_pending = !1
  transform_error
  #e
  #t = y ? x : null
  #n
  #r
  #i
  #a = null
  #o = null
  #s = null
  #c = null
  #l = 0
  #u = 0
  #d = !1
  #f = new Map()
  #p = null
  #m = er(
    () => (
      (this.#p = kt(this.#l)),
      () => {
        this.#p = null
      }
    )
  )
  constructor(e, t, n, r) {
    ;((this.#e = e),
      (this.#n = t),
      (this.#r = (e) => {
        var t = G
        ;((t.b = this), (t.f |= 128), n(e))
      }),
      (this.parent = G.b),
      (this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e)),
      (this.#i = cn(() => {
        if (y) {
          let e = we(this.#t)
          be()
          let t = e === `[!`
          if (e.startsWith(`[?`)) {
            let t = JSON.parse(e.slice(2))
            this.#g(t)
          } else t ? this.#y() : this.#h()
        } else this.#b()
      }, tr)),
      y && (this.#e = x))
  }
  #h() {
    try {
      this.#a = z(() => this.#r(this.#e))
    } catch (e) {
      this.error(e)
    }
  }
  #g(e) {
    let t = this.#n.failed,
      { reset: n, invoke_onerror: r } = this.#_(e)
    ;(T(r),
      t &&
        (this.#s = z(() => {
          t(
            this.#e,
            () => e,
            () => n
          )
        })))
  }
  #_(e) {
    var t = !1,
      n = !1
    let r = () => {
      this.#v() ||
        (t
          ? ye()
          : ((t = !0),
            n && ze(),
            this.#s !== null &&
              mn(this.#s, () => {
                this.#s = null
              }),
            this.#S(() => {
              this.#b()
            })))
    }
    return {
      reset: r,
      invoke_onerror: () => {
        if (!this.#v())
          try {
            ;((n = !0), this.#n.onerror?.(e, r), (n = !1))
          } catch (e) {
            L(e, this.#i && this.#i.parent)
          }
      }
    }
  }
  #v() {
    return (this.#i.f & (ee | ne)) !== 0
  }
  #y() {
    let e = this.#n.pending
    e &&
      ((this.is_pending = !0),
      (this.#o = z(() => e(this.#e))),
      T(() => {
        if (!this.#v()) {
          var e = (this.#c = document.createDocumentFragment()),
            t = P(),
            n = !1
          ;(e.append(t),
            (this.#a = this.#S(() => {
              try {
                return z(() => this.#r(t))
              } catch (e) {
                try {
                  ;(this.error(e), (n = !0))
                } catch (e) {
                  L(e, this.#i.parent)
                }
                return null
              }
            })),
            this.#a === null
              ? ((this.#c = null), n && this.#x(D))
              : this.#u === 0 &&
                (this.#e.before(e),
                (this.#c = null),
                mn(this.#o, () => {
                  this.#o = null
                }),
                this.#x(D)))
        }
      }))
  }
  #b() {
    try {
      if (
        ((this.is_pending = this.has_pending_snippet()),
        (this.#u = 0),
        (this.#l = 0),
        (this.#a = z(() => {
          this.#r(this.#e)
        })),
        this.#u > 0)
      ) {
        var e = (this.#c = document.createDocumentFragment())
        vn(this.#a, e)
        let t = this.#n.pending
        this.#o = z(() => t(this.#e))
      } else this.#x(D)
    } catch (e) {
      this.error(e)
    }
  }
  #x(e) {
    ;((this.is_pending = !1), e.transfer_reactions(this.#f))
  }
  defer_effect(e) {
    Ye(e, this.#f)
  }
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered())
  }
  has_pending_snippet() {
    return !!this.#n.pending
  }
  #S(e) {
    var t = G,
      n = H,
      r = C
    ;(K(this.#i), W(this.#i), Be(this.#i.ctx))
    try {
      return (bt.ensure(), e())
    } finally {
      ;(K(t), W(n), Be(r))
    }
  }
  #C(e, t) {
    this.has_pending_snippet()
      ? ((this.#u += e),
        this.#u === 0 &&
          (this.#x(t),
          this.#o &&
            mn(this.#o, () => {
              this.#o = null
            }),
          (this.#c &&= (this.#e.before(this.#c), null))))
      : this.parent && this.parent.#C(e, t)
  }
  update_pending_count(e, t) {
    ;(this.#C(e, t),
      (this.#l += e),
      !this.#p ||
        this.#d ||
        ((this.#d = !0),
        T(() => {
          ;((this.#d = !1), this.#p && jt(this.#p, this.#l))
        })))
  }
  get_effect_pending() {
    return (this.#m(), Q(this.#p))
  }
  error(t) {
    if (t === e || (!this.#n.onerror && !this.#n.failed)) throw t
    D?.is_fork
      ? (this.#a && D.skip_effect(this.#a),
        this.#o && D.skip_effect(this.#o),
        this.#s && D.skip_effect(this.#s),
        D.oncommit(() => {
          this.#v() || this.#w(t)
        }))
      : this.#w(t)
  }
  #w(e) {
    ;((this.#a &&= (B(this.#a), null)),
      (this.#o &&= (B(this.#o), null)),
      (this.#s &&= (B(this.#s), null)),
      y && (S(this.#t), Se(), S(Ce())))
    let t = this.#n.failed,
      n = (e) => {
        if (this.#v()) return
        let { reset: n, invoke_onerror: r } = this.#_(e)
        ;(r(),
          t &&
            !this.#v() &&
            (this.#s = this.#S(() => {
              try {
                return z(() => {
                  var r = G
                  ;((r.b = this),
                    (r.f |= 128),
                    t(
                      this.#e,
                      () => e,
                      () => n
                    ))
                })
              } catch (e) {
                return (L(e, this.#i.parent), null)
              }
            })))
      }
    T(() => {
      if (!this.#v()) {
        var t
        try {
          t = this.transform_error(e)
        } catch (e) {
          L(e, this.#i && this.#i.parent)
          return
        }
        typeof t == `object` && t && typeof t.then == `function`
          ? t.then(n, (e) => L(e, this.#i && this.#i.parent))
          : n(t)
      }
    })
  }
}
function ir(e, t) {
  var n = t == null ? `` : typeof t == `object` ? `${t}` : t
  n !== (e[he] ??= e.nodeValue) && ((e[he] = n), (e.nodeValue = `${n}`))
}
function ar(e, t) {
  return cr(e, t)
}
function or(t, n) {
  ;(Bt(), (n.intro = n.intro ?? !1))
  let r = n.target,
    i = y,
    a = x
  try {
    for (var o = F(r); o && (o.nodeType !== 8 || o.data !== `[`);) o = I(o)
    if (!o) throw e
    ;(b(!0), S(o))
    let i = cr(t, { ...n, anchor: o })
    return (b(!1), i)
  } catch (i) {
    if (
      i instanceof Error &&
      i.message
        .split(
          `
`
        )
        .some((e) => e.startsWith(`https://svelte.dev/e/`))
    )
      throw i
    return (
      i !== e && console.warn(`Failed to hydrate: `, i),
      n.recover === !1 && Pe(),
      Bt(),
      Gt(r),
      b(!1),
      ar(t, n)
    )
  } finally {
    ;(b(i), S(a))
  }
}
var sr = new Map()
function cr(
  t,
  { target: n, anchor: r, props: i = {}, events: o, context: s, intro: c = !0, transformError: l }
) {
  Bt()
  var u = void 0,
    d = nn(() => {
      var c = r ?? n.appendChild(P())
      nr(
        c,
        { pending: () => {} },
        (n) => {
          Ve({})
          var r = C
          if (
            (s && (r.c = s),
            o && (i.$$events = o),
            y && $(n, null),
            (u = t(n, i) || Ue()),
            y && ((G.nodes.end = x), x === null || x.nodeType !== 8 || x.data !== `]`))
          )
            throw (ve(), e)
          He()
        },
        l
      )
      var d = new Set(),
        f = (e) => {
          for (var t = 0; t < e.length; t++) {
            var r = e[t]
            if (!d.has(r)) {
              d.add(r)
              var i = $n(r)
              for (let e of [n, document]) {
                var a = sr.get(e)
                a === void 0 && ((a = new Map()), sr.set(e, a))
                var o = a.get(r)
                o === void 0
                  ? (e.addEventListener(r, Wn, { passive: i }), a.set(r, 1))
                  : a.set(r, o + 1)
              }
            }
          }
        }
      return (
        f(a(Bn)),
        Vn.add(f),
        () => {
          for (var e of d)
            for (let r of [n, document]) {
              var t = sr.get(r),
                i = t.get(e)
              --i == 0
                ? (r.removeEventListener(e, Wn), t.delete(e), t.size === 0 && sr.delete(r))
                : t.set(e, i)
            }
          ;(Vn.delete(f), c !== r && c.parentNode?.removeChild(c))
        }
      )
    })
  return (lr.set(u, d), u)
}
var lr = new WeakMap(),
  ur = class {
    anchor
    #e = new Map()
    #t = new Map()
    #n = new Map()
    #r = new Set()
    #i = !0
    constructor(e, t = !0) {
      ;((this.anchor = e), (this.#i = t))
    }
    #a = (e) => {
      if (this.#e.has(e)) {
        var t = this.#e.get(e),
          n = this.#t.get(t)
        if (n) (gn(n), this.#r.delete(t))
        else {
          var r = this.#n.get(t)
          r &&
            (gn(r.effect),
            this.#t.set(t, r.effect),
            this.#n.delete(t),
            r.fragment.lastChild.remove(),
            this.anchor.before(r.fragment),
            (n = r.effect))
        }
        for (let [t, n] of this.#e) {
          if ((this.#e.delete(t), t === e)) break
          let r = this.#n.get(n)
          r && (B(r.effect), this.#n.delete(n))
        }
        for (let [e, r] of this.#t) {
          if (e === t || this.#r.has(e)) continue
          let i = () => {
            if (Array.from(this.#e.values()).includes(e)) {
              var t = document.createDocumentFragment()
              ;(vn(r, t), t.append(P()), this.#n.set(e, { effect: r, fragment: t }))
            } else B(r)
            ;(this.#r.delete(e), this.#t.delete(e))
          }
          this.#i || !n ? (this.#r.add(e), mn(r, i, !1)) : i()
        }
      }
    }
    #o = (e) => {
      this.#e.delete(e)
      let t = Array.from(this.#e.values())
      for (let [e, n] of this.#n) t.includes(e) || (B(n.effect), this.#n.delete(e))
    }
    ensure(e, t) {
      var n = D,
        r = Kt()
      if (t && !this.#t.has(e) && !this.#n.has(e)) {
        if (r) {
          var i = document.createDocumentFragment(),
            a = P()
          ;(i.append(a), this.#n.set(e, { effect: z(() => t(a)), fragment: i }))
        } else
          this.#t.set(
            e,
            z(() => t(this.anchor))
          )
      }
      if ((this.#e.set(n, e), r)) {
        for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r)
        for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect)
        ;(n.oncommit(this.#a), n.ondiscard(this.#o))
      } else (y && (this.anchor = x), this.#a(n))
    }
  }
function dr(e, t, ...n) {
  var r = new ur(e)
  cn(() => {
    let e = t() ?? null
    r.ensure(e, e && ((t) => e(t, ...n)))
  }, re)
}
function fr(e) {
  ;(C === null && Oe(`onMount`),
    en(() => {
      let t = Rn(e)
      if (typeof t == `function`) return t
    }))
}
function pr(e, t, n = !1) {
  var r
  y && ((r = x), be())
  var i = new ur(e),
    a = n ? re : 0
  function o(e, t) {
    if (y) {
      var n = we(r)
      if (e !== parseInt(n.substring(1))) {
        var a = Ce()
        ;(S(a), (i.anchor = a), b(!1), i.ensure(e, t), b(!0))
        return
      }
    }
    i.ensure(e, t)
  }
  cn(() => {
    var e = !1
    ;(t((t, n = 0) => {
      ;((e = !0), o(n, t))
    }),
      e || o(-1, null))
  }, a)
}
function mr(e, t, n) {
  var r
  y && ((r = x), be())
  var i = new ur(e)
  cn(() => {
    var e = t() ?? null
    if (y && (we(r) === `[`) != (e !== null)) {
      var a = Ce()
      ;(S(a), (i.anchor = a), b(!1), i.ensure(e, e && ((t) => n(t, e))), b(!0))
    } else i.ensure(e, e && ((t) => n(t, e)))
  }, re)
}
function hr(e, t) {
  return e === t || e?.[le] === t
}
function gr(e = Ue(), t, n, r) {
  var i = C.r,
    a = G
  return (
    rn(() => {
      var o, s
      return (
        on(() => {
          ;((o = s),
            (s = r?.() || []),
            Rn(() => {
              hr(n(...s), e) || (t(e, ...s), o && hr(n(...o), e) && t(null, ...o))
            }))
        }),
        () => {
          let r = a
          for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent
          let o = () => {
              s && hr(n(...s), e) && t(null, ...s)
            },
            c = r.teardown
          r.teardown = () => {
            ;(o(), c?.())
          }
        }
      )
    }),
    e
  )
}
var _r = !1
function vr(e) {
  var t = _r
  try {
    return ((_r = !1), [e(), _r])
  } finally {
    _r = t
  }
}
function yr(e, t, n, r) {
  var i = !0,
    a = !!(n & 8),
    o = !!(n & 16),
    c = r,
    l = !0,
    u = void 0,
    d = () => (o && i ? ((u ??= tt(r)), Q(u)) : (l && ((l = !1), (c = o ? Rn(r) : r)), c))
  let f
  if (a) {
    var p = le in e || de in e
    f = s(e, t)?.set ?? (p && t in e ? (n) => (e[t] = n) : void 0)
  }
  var m,
    h = !1
  ;(a ? ([m, h] = vr(() => e[t])) : (m = e[t]),
    m === void 0 && r !== void 0 && ((m = d()), f && (i && Fe(t), f(m))))
  var g = i
    ? () => {
        var n = e[t]
        return n === void 0 ? d() : ((l = !0), n)
      }
    : () => {
        var n = e[t]
        return (n !== void 0 && (c = void 0), n === void 0 ? c : n)
      }
  if (i && !(n & 4)) return g
  if (f) {
    var _ = e.$$legacy
    return function (e, t) {
      return arguments.length > 0 ? ((!i || !t || _ || h) && f(t ? g() : e), e) : g()
    }
  }
  var v = !1,
    ee = (n & 1 ? tt : at)(() => ((v = !1), g()))
  a && Q(ee)
  var te = G
  return function (e, t) {
    if (arguments.length > 0) {
      let n = t ? Q(ee) : i && a ? Ft(e) : e
      return (M(ee, n), (v = !0), c !== void 0 && (c = n), e)
    }
    return (V && v) || te.f & 16384 ? ee.v : Q(ee)
  }
}
export {
  M as C,
  Ve as D,
  He as E,
  xe as O,
  Wt as S,
  it as T,
  Pn as _,
  fr as a,
  Ht as b,
  ar as c,
  Zn as d,
  Xn as f,
  Fn as g,
  Q as h,
  pr as i,
  f as k,
  ir as l,
  Yn as m,
  gr as n,
  dr as o,
  Jn as p,
  mr as r,
  or as s,
  yr as t,
  nr as u,
  sn as v,
  j as w,
  Ut as x,
  Vt as y
}
