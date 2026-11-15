import {
  A as BODY_DEPENDENT_METHODS,
  At as resolve,
  Bt as base64_encode,
  C as has_prerendered_path,
  Ct as stringify,
  D as serialize_uses,
  Dt as make_trackable,
  E as redirect_response,
  Et as disable_search,
  F as REROUTED_URL_HEADER,
  Ft as add_resolution_suffix,
  Gt as app_dir,
  Ht as text_encoder,
  It as has_data_suffix,
  Kt as assets,
  L as default_handle_error,
  Lt as has_resolution_suffix,
  M as IN_WEBCONTAINER,
  Mt as invalid_export,
  Nt as invalid_export_location,
  O as throw_devalue_error,
  Ot as normalize_path,
  P as PAGE_METHODS,
  Pt as add_data_suffix,
  Q as TRAILING_SLASH_PARAM,
  R as handle_error_and_jsonify,
  Rt as strip_data_suffix,
  S as get_node_type,
  St as once,
  T as method_not_allowed,
  Tt as decode_pathname,
  Vt as stream_text,
  X as normalize_error,
  Y as get_status,
  Z as INVALIDATED_PARAM,
  _ as handle_action_request,
  a as set_hooks,
  at as encoders,
  b as uneval_action_response,
  bt as disallow_on_server,
  d as get_remote_action,
  dt as is_form_content_type,
  et as fetch_cache_url,
  f as get_remote_id,
  ft as negotiate,
  g as handle_action_json_request,
  h as action_json_redirect,
  i as read_implementation,
  j as ENDPOINT_METHODS,
  jt as find_route,
  k as with_version_header,
  kt as relative_pathname,
  m as handle_remote_form_post,
  n as hooks,
  ot as has_custom_transporters,
  p as handle_remote_call,
  r as manifest,
  st as init_transport,
  u as collect_remote_data,
  ut as uneval,
  v as is_action_json_request,
  w as is_prerendering,
  xt as noop,
  y as is_action_request,
  zt as strip_resolution_suffix
} from './internal.js'
import {
  C as prerender_endpoint_methods,
  E as prerender_template_nonce,
  G as set_headers_after_response,
  K as set_headers_cookie,
  S as prerender_actions,
  T as prerender_nonce,
  X as capture_error,
  _ as load_fetch_cors,
  b as load_promise_not_serializable,
  c as client_address_unsupported,
  d as cookies_set_after_response,
  f as csp_report_only_missing_report,
  g as header_already_set,
  p as endpoint_invalid_response,
  u as cookies_serialize_before_route,
  w as prerender_endpoint_not_prerenderable,
  x as load_response_header_not_serialized
} from './server-errors.js'
import { t as uneval$1 } from './uneval.js'
import { explicit_public_env, rendered_env, set_env } from '../env.js'
import { i as escape_html$1, n as render, t as derived } from './server.js'
import { isRedirect, text } from '@sveltejs/kit'
import { Redirect, SvelteKitError } from '@sveltejs/kit/internal'
import { merge_tracing, otel, record_span, with_request_store } from '@sveltejs/kit/internal/server'
// .svelte-kit/generated/build/shared/error-template.js
var error_template_default = ({ status, message }) =>
  '<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<title>' +
  message +
  "</title>\n\n		<style>\n			body {\n				--bg: white;\n				--fg: #222;\n				--divider: #ccc;\n				background: var(--bg);\n				color: var(--fg);\n				font-family:\n					system-ui,\n					-apple-system,\n					BlinkMacSystemFont,\n					'Segoe UI',\n					Roboto,\n					Oxygen,\n					Ubuntu,\n					Cantarell,\n					'Open Sans',\n					'Helvetica Neue',\n					sans-serif;\n				display: flex;\n				align-items: center;\n				justify-content: center;\n				height: 100vh;\n				margin: 0;\n			}\n\n			.error {\n				display: flex;\n				align-items: center;\n				max-width: 32rem;\n				margin: 0 1rem;\n			}\n\n			.status {\n				font-weight: 200;\n				font-size: 3rem;\n				line-height: 1;\n				position: relative;\n				top: -0.05rem;\n			}\n\n			.message {\n				border-left: 1px solid var(--divider);\n				padding: 0 0 0 1rem;\n				margin: 0 0 0 1rem;\n				min-height: 2.5rem;\n				display: flex;\n				align-items: center;\n			}\n\n			.message h1 {\n				font-weight: 400;\n				font-size: 1em;\n				margin: 0;\n			}\n\n			@media (prefers-color-scheme: dark) {\n				body {\n					--bg: #222;\n					--fg: #ddd;\n					--divider: #666;\n				}\n			}\n		</style>\n	</head>\n	<body>\n		<div class=\"error\">\n			<span class=\"status\">" +
  status +
  '</span>\n			<div class="message">\n				<h1>' +
  message +
  '</h1>\n			</div>\n		</div>\n	</body>\n</html>\n'
// .svelte-kit/generated/build/server.js
var options = {
  app_template_contains_nonce: false,
  csp: {
    mode: 'auto',
    directives: {
      'upgrade-insecure-requests': false,
      'block-all-mixed-content': false
    },
    reportOnly: {
      'upgrade-insecure-requests': false,
      'block-all-mixed-content': false
    }
  },
  csrf_trusted_origins: [],
  service_worker_options: void 0,
  templates: {
    app: ({ head, body, assets, nonce, env }) =>
      '<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' +
      head +
      '\n	</head>\n	<body data-sveltekit-preload-data="hover">\n		<div style="display: contents">' +
      body +
      '</div>\n	</body>\n</html>\n',
    error: error_template_default
  }
}
async function get_hooks() {
  let handle
  let handleFetch
  let handleError
  let init
  let reroute
  let transport
  return {
    handle,
    handleFetch,
    handleError,
    init,
    reroute,
    transport
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/endpoint.js
/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {import('types').RequestState} state
 * @param {import('types').SSREndpoint} mod
 * @returns {Promise<Response>}
 */
async function render_endpoint(event, state, mod) {
  const method = event.request.method
  let handler = mod[method] || mod.fallback
  if (method === 'HEAD' && !mod.HEAD && mod.GET) handler = mod.GET
  if (!handler) return method_not_allowed(mod, method)
  const prerender = mod.prerender ?? state.prerender_default
  if (prerender && (mod.fallback || BODY_DEPENDENT_METHODS.some((method) => mod[method])))
    prerender_endpoint_methods({
      methods: BODY_DEPENDENT_METHODS.join(', '),
      id: event.route.id
    })
  if (state.prerendering && !state.prerendering.inside_reroute && !prerender) {
    if (state.depth > 0) prerender_endpoint_not_prerenderable({ id: event.route.id })
    else return new Response(void 0, { status: 204 })
  }
  try {
    const response = await record_span({
      name: 'sveltekit.endpoint',
      attributes: {
        'http.route': event.route.id || 'unknown',
        'http.method': method
      },
      fn: async (current) => {
        const traced_event = merge_tracing(event, current)
        return with_request_store(
          {
            event: traced_event,
            state
          },
          () => handler(traced_event)
        )
      }
    })
    if (!(response instanceof Response)) endpoint_invalid_response({ path: event.url.pathname })
    if (state.prerendering && (!state.prerendering.inside_reroute || prerender)) {
      const cloned = new Response(response.clone().body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      })
      cloned.headers.set('x-sveltekit-prerender', String(prerender))
      if (state.prerendering.inside_reroute && prerender) {
        cloned.headers.set('x-sveltekit-routeid', encodeURI(event.route.id))
        state.prerendering.dependencies.set(event.url.pathname, {
          response: cloned,
          body: null
        })
      } else return cloned
    }
    return response
  } catch (e) {
    if (e instanceof Redirect)
      return new Response(void 0, {
        status: e.status,
        headers: { location: e.location }
      })
    throw e
  }
}
/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
function is_endpoint_request(event) {
  const { method, headers } = event.request
  if (ENDPOINT_METHODS.includes(method) && !PAGE_METHODS.includes(method)) return true
  if (method === 'POST' && headers.get('x-sveltekit-action') === 'true') return false
  const accept = event.request.headers.get('accept') ?? '*/*'
  return negotiate(accept, ['*', 'text/html']) !== 'text/html'
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/utils/array.js
/**
 * Removes nullish values from an array.
 *
 * @template T
 * @param {Array<T>} arr
 */
function compact(arr) {
  return arr.filter(
    /** @returns {val is NonNullable<T>} */
    (val) => val != null
  )
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/pathname.js
var ROUTES_PREFIX = '/routes'
/**
 * The pathname of the route-ID-keyed resolution module for a given route ID,
 * e.g. `/_app/routes/blog/[slug]/__route.js` (before prefixing with `base`).
 * @param {string} route_id
 * @returns {string}
 */
function route_id_resolution_pathname(route_id) {
  return add_resolution_suffix(`/${app_dir}${ROUTES_PREFIX}${route_id === '/' ? '' : route_id}`)
}
/**
 * Whether a pathname (with the `/__route.js` suffix already stripped, and `base` NOT yet stripped)
 * is a route-ID resolution request rather than a pathname resolution request.
 * @param {string} pathname
 * @returns {boolean}
 */
function is_route_id_resolution_path(pathname) {
  const prefix = `/${app_dir}${ROUTES_PREFIX}`
  return pathname === prefix || pathname.startsWith(prefix + '/')
}
/**
 * Extract the route ID from a decoded, base-stripped, suffix-stripped pathname,
 * e.g. `/_app/routes/blog/[slug]` -> `/blog/[slug]`, `/_app/routes` -> `/`.
 * @param {string} pathname
 * @returns {string}
 */
function extract_route_id(pathname) {
  return pathname.slice(`/_app${ROUTES_PREFIX}`.length) || '/'
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/error-chain.js
/** @import { Component } from 'svelte'; */
/**
 * Resolves the `+error.svelte` component that guards each node of `branch`, aligned to the
 * branch with its empty slots removed. A node is guarded by the closest error page declared
 * at or above it, except the root layout, which wraps the root error component rather than
 * being wrapped by it.
 * @template T
 * @param {Array<unknown>} branch
 * @param {Array<T | undefined | null>} errors the error page declared at each depth, if any
 * @param {(error: T) => Promise<Component | undefined> | undefined} load
 * @returns {Promise<Array<Component | undefined>>}
 */
function build_error_chain(branch, errors, load) {
  /** @type {Array<Promise<Component | undefined> | undefined>} */
  const chain = [void 0]
  let last_idx = -1
  for (let i = 1; i < branch.length; i += 1) {
    if (!branch[i]) continue
    let j = i - 1
    while (j > last_idx + 1 && errors[j] == null) j -= 1
    last_idx = j
    const error = errors[j]
    chain.push(error == null ? void 0 : load(error)?.catch(() => void 0))
  }
  return Promise.all(chain)
}
/**
 * Walks up from the node at index `i` through the `+error.svelte` pages declared strictly
 * above it, nearest first. Yields each candidate with the branch depth it attaches at,
 * rewound past empty branch slots, so callers can skip candidates that fail to load.
 * @template T
 * @param {number} i
 * @param {Array<unknown>} branch
 * @param {Array<T | undefined | null>} errors the error page declared at each depth, if any
 * @returns {Generator<{ error: T; idx: number }>}
 */
function* nearest_error_pages(i, branch, errors) {
  while (i--) {
    const error = errors[i]
    if (error != null) {
      let j = i
      while (!branch[j]) j -= 1
      yield {
        error,
        idx: j + 1
      }
    }
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/utils/streaming.js
/**
 * Create an async iterator and a function to push values into it
 * @template T
 * @returns {{
 *   iterate: (transform?: (input: T) => T) => AsyncIterable<T>;
 *   add: (promise: Promise<T>) => void;
 * }}
 */
function create_async_iterator() {
  let resolved = -1
  /** @type {PromiseWithResolvers<T>[]} */
  const deferred = []
  return {
    async *iterate(transform = (x) => x) {
      for (let i = 0; i < deferred.length; i += 1) yield transform(await deferred[i].promise)
    },
    add: (promise) => {
      const next = Promise.withResolvers()
      next.promise.catch(noop)
      deferred.push(next)
      promise.then(
        (value) => {
          deferred[++resolved].resolve(value)
        },
        (error) => {
          deferred[++resolved].reject(error)
        }
      )
    }
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/page/data_serializer.js
/**
 * If the serialized data contains promises, `chunks` will be an
 * async iterable containing their resolutions
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {import('types').RequestState} state
 * @returns {import('./types.js').ServerDataSerializer}
 */
function server_data_serializer(event, state) {
  let promise_id = 1
  let max_nodes = -1
  const iterator = create_async_iterator()
  const global = '__sveltekit_4n03bp'
  /** @param {number} index */
  function get_replacer(index) {
    /** @param {any} thing */
    return function replacer(thing) {
      if (typeof thing?.then === 'function') {
        const id = promise_id++
        const promise = thing
          .then(
            /** @param {any} data */
            (data) => ({ data })
          )
          .catch(
            /** @param {any} error */
            async (error) => ({ error: await handle_error_and_jsonify(event, state, error) })
          )
          .then(
            /**
             * @param {{data: any; error: any}} result
             */
            async ({ data, error }) => {
              let str
              try {
                str = uneval$1(error ? [, error] : [data], replacer)
              } catch (serialization_error) {
                error = await handle_error_and_jsonify(
                  event,
                  state,
                  capture_error(() =>
                    load_promise_not_serializable(
                      { id: event.route.id },
                      { cause: serialization_error }
                    )
                  )
                )
                str = uneval$1([, error], replacer)
              }
              return {
                index,
                str: `${global}.resolve(${id}, ${str.includes('app.decode') ? `(app) => ${str}` : `() => ${str}`})`
              }
            }
          )
        iterator.add(promise)
        return `${global}.defer(${id})`
      } else
        for (const key in encoders) {
          const encoded = encoders[key](thing)
          if (encoded) return `app.decode('${key}', ${uneval$1(encoded, replacer)})`
        }
    }
  }
  const strings = []
  return {
    set_max_nodes(i) {
      max_nodes = i
    },
    add_node(i, node) {
      try {
        if (!node) {
          strings[i] = 'null'
          return
        }
        /** @type {any} */
        const payload = {
          type: 'data',
          data: node.data,
          uses: serialize_uses(node)
        }
        if (node.slash) payload.slash = node.slash
        strings[i] = uneval$1(payload, get_replacer(i))
      } catch (error) {
        error.path = error.path.slice(1)
        throw_devalue_error(event, error)
      }
    },
    get_data(csp) {
      const open = `<script${csp.script_needs_nonce ? ` nonce="${csp.nonce}"` : ''}>`
      const close = `<\/script>\n`
      return {
        data: `[${compact(max_nodes > -1 ? strings.slice(0, max_nodes) : strings).join(',')}]`,
        chunks:
          promise_id > 1
            ? iterator.iterate(({ index, str }) => {
                if (max_nodes > -1 && index >= max_nodes) return ''
                return open + str + close
              })
            : null
      }
    }
  }
}
/**
 * If the serialized data contains promises, `chunks` will be an
 * async iterable containing their resolutions
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {import('types').RequestState} state
 * @returns {import('./types.js').ServerDataSerializerJson}
 */
function server_data_serializer_json(event, state) {
  let promise_id = 1
  const iterator = create_async_iterator()
  const reducers = {
    ...encoders,
    /** @param {any} thing */
    Promise: (thing) => {
      if (typeof thing?.then !== 'function') return
      const id = promise_id++
      /** @type {'data' | 'error'} */
      let key = 'data'
      const promise = thing
        .catch(
          /** @param {any} error */
          async (error) => {
            key = 'error'
            return handle_error_and_jsonify(event, state, error)
          }
        )
        .then(
          /** @param {any} value */
          async (value) => {
            let str
            try {
              str = stringify(value, reducers)
            } catch (serialization_error) {
              const error = await handle_error_and_jsonify(
                event,
                state,
                capture_error(() =>
                  load_promise_not_serializable(
                    { id: event.route.id },
                    { cause: serialization_error }
                  )
                )
              )
              key = 'error'
              str = stringify(error, reducers)
            }
            return `{"type":"chunk","id":${id},"${key}":${str}}\n`
          }
        )
      iterator.add(promise)
      return id
    }
  }
  const strings = []
  return {
    add_node(i, node) {
      try {
        if (!node) {
          strings[i] = 'null'
          return
        }
        if (node.type === 'error' || node.type === 'skip') {
          strings[i] = JSON.stringify(node)
          return
        }
        strings[i] =
          `{"type":"data","data":${stringify(node.data, reducers)},"uses":${JSON.stringify(serialize_uses(node))}${node.slash ? `,"slash":${JSON.stringify(node.slash)}` : ''}}`
      } catch (error) {
        error.path = 'data' + error.path
        throw_devalue_error(event, error)
      }
    },
    get_data() {
      return {
        data: `{"type":"data","nodes":[${strings.join(',')}]}\n`,
        chunks: promise_id > 1 ? iterator.iterate() : null
      }
    }
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/constants.js
var NULL_BODY_STATUS = [101, 103, 204, 205, 304]
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/page/load_data.js
/**
 * Calls the user's server `load` function.
 * @param {{
 *   event: import('@sveltejs/kit').RequestEvent;
 *   state: import('types').RequestState;
 *   node: import('types').SSRNode | undefined;
 *   parent: () => Promise<Record<string, any>>;
 * }} opts
 * @returns {Promise<import('types').ServerDataNode | null>}
 */
async function load_server_data({ event, state, node, parent }) {
  if (!node?.server) return null
  let is_tracking = true
  const uses = {
    dependencies: /* @__PURE__ */ new Set(),
    params: /* @__PURE__ */ new Set(),
    parent: false,
    route: false,
    url: false,
    search_params: /* @__PURE__ */ new Set()
  }
  const load = node.server.load
  const slash = node.server.trailingSlash
  if (!load)
    return {
      type: 'data',
      data: null,
      uses,
      slash
    }
  const url = make_trackable(
    event.url,
    () => {
      if (is_tracking) uses.url = true
    },
    (param) => {
      if (is_tracking) uses.search_params.add(param)
    }
  )
  if (is_prerendering(state)) disable_search(url)
  return {
    type: 'data',
    data:
      (await record_span({
        name: 'sveltekit.load',
        attributes: {
          'sveltekit.load.node_id': node.server_id || 'unknown',
          'sveltekit.load.node_type': get_node_type(node.server_id),
          'sveltekit.load.environment': 'server',
          'http.route': event.route.id || 'unknown'
        },
        fn: async (current) => {
          const traced_event = merge_tracing(event, current)
          return await with_request_store(
            {
              event: traced_event,
              state
            },
            () =>
              load.call(null, {
                ...traced_event,
                fetch: (info, init) => {
                  new URL(info instanceof Request ? info.url : info, event.url)
                  return event.fetch(info, init)
                },
                /** @param {string[]} deps */
                depends: (...deps) => {
                  for (const dep of deps) {
                    const { href } = new URL(dep, event.url)
                    uses.dependencies.add(href)
                  }
                },
                params: new Proxy(event.params, {
                  get: (target, key) => {
                    if (is_tracking) uses.params.add(key)
                    return target[key]
                  }
                }),
                parent: async () => {
                  if (is_tracking) uses.parent = true
                  return parent()
                },
                route: new Proxy(event.route, {
                  get: (target, key) => {
                    if (is_tracking) uses.route = true
                    return target[key]
                  }
                }),
                url,
                untrack(fn) {
                  is_tracking = false
                  try {
                    return fn()
                  } finally {
                    is_tracking = true
                  }
                }
              })
          )
        }
      })) ?? null,
    uses,
    slash
  }
}
/**
 * Calls the user's `load` function.
 * @param {{
 *   event: import('@sveltejs/kit').RequestEvent;
 *   state: import('types').RequestState;
 *   fetched: import('./types.js').Fetched[];
 *   node: import('types').SSRNode | undefined;
 *   parent: () => Promise<Record<string, any>>;
 *   resolve_opts: import('types').RequiredResolveOptions;
 *   server_data_promise: Promise<import('types').ServerDataNode | null>;
 *   csr: boolean;
 * }} opts
 * @returns {Promise<Record<string, any | Promise<any>> | null>}
 */
async function load_data({
  event,
  state,
  fetched,
  node,
  parent,
  server_data_promise,
  resolve_opts,
  csr
}) {
  const server_data_node = await server_data_promise
  const load = node?.universal?.load
  if (!load) return server_data_node?.data ?? null
  return (
    (await record_span({
      name: 'sveltekit.load',
      attributes: {
        'sveltekit.load.node_id': node.universal_id || 'unknown',
        'sveltekit.load.node_type': get_node_type(node.universal_id),
        'sveltekit.load.environment': 'server',
        'http.route': event.route.id || 'unknown'
      },
      fn: async (current) => {
        const traced_event = merge_tracing(event, current)
        return await with_request_store(
          {
            event: traced_event,
            state
          },
          () =>
            load.call(null, {
              url: event.url,
              params: event.params,
              data: server_data_node?.data ?? null,
              route: event.route,
              fetch: create_universal_fetch(event, state.prerendering, fetched, csr, resolve_opts),
              setHeaders: event.setHeaders,
              depends: noop,
              parent,
              untrack: (fn) => fn(),
              tracing: traced_event.tracing
            })
        )
      }
    })) ?? null
  )
}
/**
 * @param {Pick<import('@sveltejs/kit').RequestEvent, 'fetch' | 'url' | 'request' | 'route'>} event
 * @param {import('types').PrerenderOptions | undefined} prerendering
 * @param {import('./types.js').Fetched[]} fetched
 * @param {boolean} csr
 * @param {Pick<Required<import('@sveltejs/kit/hooks').ResolveOptions>, 'filterSerializedResponseHeaders'>} resolve_opts
 * @returns {typeof fetch}
 */
function create_universal_fetch(event, prerendering, fetched, csr, resolve_opts) {
  /**
   * @param {URL | RequestInfo} input
   * @param {RequestInit} [init]
   */
  const universal_fetch = async (input, init) => {
    const cloned_body = input instanceof Request && input.body ? input.clone().body : null
    const cloned_headers =
      input instanceof Request && [...input.headers].length
        ? new Headers(input.headers)
        : init?.headers
    let response = await event.fetch(input, init)
    const url = new URL(input instanceof Request ? input.url : input, event.url)
    const same_origin = url.origin === event.url.origin
    /** @type {import('types').PrerenderDependency} */
    let dependency
    if (same_origin) {
      if (prerendering) {
        dependency = {
          response,
          body: null
        }
        prerendering.dependencies.set(url.pathname, dependency)
      }
    } else if (url.protocol === 'https:' || url.protocol === 'http:') {
      if ((input instanceof Request ? input.mode : (init?.mode ?? 'cors')) === 'no-cors')
        response = new Response('', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        })
      else {
        const acao = response.headers.get('access-control-allow-origin')
        if (!acao || (acao !== event.url.origin && acao !== '*'))
          load_fetch_cors({ reason: acao ? 'Incorrect' : 'No' })
      }
    }
    /** @type {ReadableStream<Uint8Array>} */
    let teed_body
    const proxy = new Proxy(response, {
      get(response, key, receiver) {
        /**
         * @param {string | undefined} body
         * @param {boolean} is_b64
         */
        async function push_fetched(body, is_b64) {
          const status_number = Number(response.status)
          if (isNaN(status_number))
            throw new Error(
              `response.status is not a number. value: "${response.status}" type: ${typeof response.status}`
            )
          const request_body =
            input instanceof Request && cloned_body
              ? await new Response(cloned_body).text()
              : init?.body
          if (request_body && typeof request_body !== 'string' && !ArrayBuffer.isView(request_body))
            return
          fetched.push({
            url: fetch_cache_url(url, event.url),
            method: event.request.method,
            request_body,
            request_headers: cloned_headers,
            response_body: body,
            response,
            is_b64
          })
        }
        if (key === 'body') {
          if (response.body === null) return null
          if (teed_body) return teed_body
          const [a, b] = response.body.tee()
          ;(async () => {
            const result = new Uint8Array(await new Response(a).arrayBuffer())
            if (dependency) dependency.body = new Uint8Array(result)
            push_fetched(base64_encode(result), true)
          })().catch(noop)
          return (teed_body = b)
        }
        if (key === 'arrayBuffer')
          return async () => {
            const buffer = await response.arrayBuffer()
            const bytes = new Uint8Array(buffer)
            if (dependency) dependency.body = bytes
            if (buffer instanceof ArrayBuffer) await push_fetched(base64_encode(bytes), true)
            return buffer
          }
        async function text() {
          const body = await response.text()
          if (body === '' && NULL_BODY_STATUS.includes(response.status)) {
            await push_fetched(void 0, false)
            return
          }
          if (!body || typeof body === 'string') await push_fetched(body, false)
          if (dependency) dependency.body = body
          return body
        }
        if (key === 'text') return text
        if (key === 'json')
          return async () => {
            const body = await text()
            return body ? JSON.parse(body) : void 0
          }
        const value = Reflect.get(response, key, response)
        if (value instanceof Function)
          return Object.defineProperties(
            /**
             * @this {any}
             */
            function () {
              return Reflect.apply(value, this === receiver ? response : this, arguments)
            },
            {
              name: { value: value.name },
              length: { value: value.length }
            }
          )
        return value
      }
    })
    if (csr) {
      const get = response.headers.get
      response.headers.get = (key) => {
        const lower = key.toLowerCase()
        const value = get.call(response.headers, lower)
        if (value && !lower.startsWith('x-sveltekit-')) {
          if (!resolve_opts.filterSerializedResponseHeaders(lower, value))
            load_response_header_not_serialized({
              name: lower,
              id: event.route.id
            })
        }
        return value
      }
      const get_set_cookie = response.headers.getSetCookie
      response.headers.getSetCookie = () => {
        const values = get_set_cookie.call(response.headers)
        for (const value of values)
          if (!resolve_opts.filterSerializedResponseHeaders('set-cookie', value))
            load_response_header_not_serialized({
              name: 'set-cookie',
              id: event.route.id
            })
        return values
      }
    }
    return proxy
  }
  return (input, init) => {
    const response = universal_fetch(input, init)
    response.catch(noop)
    return response
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/utils/hash.js
/**
 * Hash using djb2
 * @param {import('types').StrictBody[]} values
 */
function hash(...values) {
  let hash = 5381
  for (const value of values)
    if (typeof value === 'string') {
      let i = value.length
      while (i) hash = (hash * 33) ^ value.charCodeAt(--i)
    } else if (ArrayBuffer.isView(value)) {
      const buffer = new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
      let i = buffer.length
      while (i) hash = (hash * 33) ^ buffer[--i]
    } else throw new TypeError('value must be a string or TypedArray')
  return (hash >>> 0).toString(36)
}
/**
 * Hash of the headers and body a `fetch` was called with. The server-side serializer and the
 * client-side cache lookup must produce identical values for cached responses to be found.
 * @param {HeadersInit | undefined} headers
 * @param {import('types').StrictBody | null | undefined} body
 */
function hash_request(headers, body) {
  /** @type {import('types').StrictBody[]} */
  const values = []
  if (headers) values.push([...new Headers(headers)].join(','))
  if (body) values.push(body)
  return hash(...values)
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/utils/misc.js
var s = JSON.stringify
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/utils/escape.js
/**
 * When inside a double-quoted attribute value, only `&` and `"` hold special meaning.
 * @see https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(double-quoted)-state
 * @type {Record<string, string>}
 */
var escape_html_attr_dict = {
  '&': '&amp;',
  '"': '&quot;'
}
/**
 * @type {Record<string, string>}
 */
var escape_html_dict = {
  '&': '&amp;',
  '<': '&lt;'
}
/** @param {Record<string, string>} dict */
var escape_regex = (dict) => new RegExp(`[${Object.keys(dict).join('')}]|\\p{Surrogate}`, 'gu')
var escape_html_attr_regex = escape_regex(escape_html_attr_dict)
var escape_html_regex = escape_regex(escape_html_dict)
/**
 * Escapes unpaired surrogates (which are allowed in js strings but invalid in HTML) and
 * escapes characters that are special.
 *
 * @param {string} str
 * @param {boolean} [is_attr]
 * @returns {string} escaped string
 * @example const html = `<tag data-value="${escape_html('value', true)}">...</tag>`;
 */
function escape_html(str, is_attr) {
  const dict = is_attr ? escape_html_attr_dict : escape_html_dict
  return str.replace(
    is_attr ? escape_html_attr_regex : escape_html_regex,
    (match) => dict[match] ?? `&#${match.charCodeAt(0)};`
  )
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/page/serialize_data.js
/**
 * Inside a script element, only `<\/script` and `<!--` hold special meaning to the HTML parser.
 *
 * The first closes the script element, so everything after is treated as raw HTML.
 * The second disables further parsing until `-->`, so the script element might be unexpectedly
 * kept open up until an unrelated HTML comment in the page.
 *
 * U+2028 LINE SEPARATOR and U+2029 PARAGRAPH SEPARATOR are escaped for the sake of pre-2018
 * browsers.
 *
 * @see tests for unsafe parsing examples.
 * @see https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
 * @see https://html.spec.whatwg.org/multipage/syntax.html#cdata-rcdata-restrictions
 * @see https://html.spec.whatwg.org/multipage/parsing.html#script-data-state
 * @see https://html.spec.whatwg.org/multipage/parsing.html#script-data-double-escaped-state
 * @see https://github.com/tc39/proposal-json-superset
 * @type {Record<string, string>}
 */
var replacements = {
  '<': '\\u003C',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
}
var pattern = new RegExp(`[${Object.keys(replacements).join('')}]`, 'g')
/**
 * Generates a raw HTML string containing a safe script element carrying data and associated attributes.
 *
 * It escapes all the special characters needed to guarantee the element is unbroken, but care must
 * be taken to ensure it is inserted in the document at an acceptable position for a script element,
 * and that the resulting string isn't further modified.
 *
 * @param {import('./types.js').Fetched} fetched
 * @param {(name: string, value: string) => boolean} filter
 * @param {boolean} [prerendering]
 * @returns {string} The raw HTML of a script element carrying the JSON payload.
 * @example const html = serialize_data('/data.json', null, { foo: 'bar' });
 */
function serialize_data(fetched, filter, prerendering = false) {
  /** @type {Record<string, string>} */
  const headers = {}
  let cache_control = null
  let age = null
  let varyAny = false
  for (const [key, value] of fetched.response.headers) {
    if (filter(key, value)) headers[key] = value
    if (key === 'cache-control') cache_control = value
    else if (key === 'age') age = value
    else if (key === 'vary' && value.trim() === '*') varyAny = true
  }
  const payload = {
    status: fetched.response.status,
    statusText: fetched.response.statusText,
    headers,
    body: fetched.response_body
  }
  const safe_payload = JSON.stringify(payload).replace(pattern, (match) => replacements[match])
  const attrs = [
    'type="application/json"',
    'data-sveltekit-fetched',
    `data-url="${escape_html(fetched.url, true)}"`
  ]
  if (fetched.is_b64) attrs.push('data-b64')
  if (fetched.request_headers || fetched.request_body)
    attrs.push(`data-hash="${hash_request(fetched.request_headers, fetched.request_body)}"`)
  if (!prerendering && fetched.method === 'GET' && cache_control && !varyAny) {
    const match = /s-maxage=(\d+)/g.exec(cache_control) ?? /max-age=(\d+)/g.exec(cache_control)
    if (match) {
      const ttl = +match[1] - +(age ?? '0')
      attrs.push(`data-ttl="${ttl}"`)
    }
  }
  return `<script ${attrs.join(' ')}>${safe_payload}<\/script>`
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/page/csp.js
var array = /* @__PURE__ */ new Uint8Array(16)
function generate_nonce() {
  crypto.getRandomValues(array)
  return base64_encode(array)
}
/** @param {string} content */
async function sha256(content) {
  const digest = await crypto.subtle.digest('SHA-256', text_encoder.encode(content))
  return base64_encode(new Uint8Array(digest))
}
/** @typedef {`nonce-${string}` | `sha256-${string}`} CspSource */
var quoted = /* @__PURE__ */ new Set([
  'self',
  'unsafe-eval',
  'unsafe-hashes',
  'unsafe-inline',
  'none',
  'strict-dynamic',
  'report-sample',
  'report-sha256',
  'report-sha384',
  'report-sha512',
  'wasm-unsafe-eval',
  'script'
])
var crypto_pattern = /^(nonce|sha\d\d\d)-/
var BaseProvider = class {
  /** @type {boolean} */
  #use_hashes
  /** @type {boolean} */
  script_needs_csp
  /** @type {boolean} */
  #script_src_needs_csp
  /** @type {boolean} */
  #script_src_elem_needs_csp
  /** @type {boolean} */
  style_needs_csp
  /** @type {boolean} */
  #style_src_needs_csp
  /** @type {boolean} */
  #style_src_attr_needs_csp
  /** @type {boolean} */
  #style_src_elem_needs_csp
  /** @type {import('types').CspDirectives} */
  #directives
  /** @type {Set<import('types').Csp.Source>} */
  #script_src = /* @__PURE__ */ new Set()
  /** @type {Set<import('types').Csp.Source>} */
  #script_src_elem = /* @__PURE__ */ new Set()
  /** @type {Set<import('types').Csp.Source>} */
  #style_src = /* @__PURE__ */ new Set()
  /** @type {Set<import('types').Csp.Source>} */
  #style_src_attr = /* @__PURE__ */ new Set()
  /** @type {Set<import('types').Csp.Source>} */
  #style_src_elem = /* @__PURE__ */ new Set()
  /** @type {boolean} */
  script_needs_nonce
  /** @type {boolean} */
  style_needs_nonce
  /** @type {boolean} */
  script_needs_hash
  /**
   * @param {boolean} use_hashes
   * @param {import('types').CspDirectives} directives
   */
  constructor(use_hashes, directives) {
    this.#use_hashes = use_hashes
    this.#directives = directives
    const d = this.#directives
    const effective_script_src = d['script-src'] || d['default-src']
    const script_src_elem = d['script-src-elem']
    const effective_style_src = d['style-src'] || d['default-src']
    const style_src_attr = d['style-src-attr']
    const style_src_elem = d['style-src-elem']
    /** @param {(import('types').Csp.Source | import('types').Csp.ActionSource)[] | undefined} directive */
    const style_needs_csp = (directive) =>
      !!directive && !directive.some((value) => value === 'unsafe-inline')
    /** @param {(import('types').Csp.Source | import('types').Csp.ActionSource)[] | undefined} directive */
    const script_needs_csp = (directive) =>
      !!directive &&
      (!directive.some((value) => value === 'unsafe-inline') ||
        directive.some((value) => value === 'strict-dynamic'))
    this.#script_src_needs_csp = script_needs_csp(effective_script_src)
    this.#script_src_elem_needs_csp = script_needs_csp(script_src_elem)
    this.#style_src_needs_csp = style_needs_csp(effective_style_src)
    this.#style_src_attr_needs_csp = style_needs_csp(style_src_attr)
    this.#style_src_elem_needs_csp = style_needs_csp(style_src_elem)
    this.script_needs_csp = this.#script_src_needs_csp || this.#script_src_elem_needs_csp
    this.style_needs_csp =
      this.#style_src_needs_csp || this.#style_src_attr_needs_csp || this.#style_src_elem_needs_csp
    this.script_needs_nonce = this.script_needs_csp && !this.#use_hashes
    this.style_needs_nonce = this.style_needs_csp && !this.#use_hashes
    this.script_needs_hash = this.script_needs_csp && this.#use_hashes
  }
  /** @param {CspSource} source */
  add_script(source) {
    if (this.#script_src_needs_csp) this.#script_src.add(source)
    if (this.#script_src_elem_needs_csp) this.#script_src_elem.add(source)
  }
  /** @param {CspSource} source */
  add_style(source) {
    if (!this.style_needs_csp) return
    if (this.#style_src_needs_csp) this.#style_src.add(source)
    if (this.#style_src_attr_needs_csp) this.#style_src_attr.add(source)
    if (this.#style_src_elem_needs_csp) {
      const sha256_empty_comment_hash = 'sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc='
      const d = this.#directives
      if (
        d['style-src-elem'] &&
        !d['style-src-elem'].includes(sha256_empty_comment_hash) &&
        !this.#style_src_elem.has(sha256_empty_comment_hash)
      )
        this.#style_src_elem.add(sha256_empty_comment_hash)
      if (source !== sha256_empty_comment_hash) this.#style_src_elem.add(source)
    }
  }
  /**
   * @param {boolean} [is_meta]
   */
  get_header(is_meta = false) {
    const header = []
    const directives = { ...this.#directives }
    /**
     * @template {'style-src' | 'style-src-attr' | 'style-src-elem' | 'script-src' | 'script-src-elem'} K
     * @param {K} key
     * @param {Set<import('types').Csp.Source>} sources
     * @param {import('types').CspDirectives[K]} [base]
     */
    const merge_sources = (key, sources, base) => {
      if (sources.size > 0) directives[key] = [...(base || []), ...sources]
    }
    merge_sources(
      'style-src',
      this.#style_src,
      directives['style-src'] || directives['default-src']
    )
    merge_sources('style-src-attr', this.#style_src_attr, directives['style-src-attr'])
    merge_sources('style-src-elem', this.#style_src_elem, directives['style-src-elem'])
    merge_sources(
      'script-src',
      this.#script_src,
      directives['script-src'] || directives['default-src']
    )
    merge_sources('script-src-elem', this.#script_src_elem, directives['script-src-elem'])
    for (const key in directives) {
      if (is_meta && (key === 'frame-ancestors' || key === 'report-uri' || key === 'sandbox'))
        continue
      const value = directives[key]
      if (!value) continue
      const directive = [key]
      if (Array.isArray(value))
        for (const source of value)
          directive.push(quoted.has(source) || crypto_pattern.test(source) ? `'${source}'` : source)
      header.push(directive.join(' '))
    }
    return header.join('; ')
  }
}
var CspProvider = class extends BaseProvider {
  get_meta() {
    const content = this.get_header(true)
    if (!content) return
    return `<meta http-equiv="content-security-policy" content="${escape_html(content, true)}">`
  }
}
var CspReportOnlyProvider = class extends BaseProvider {
  /**
   * @param {boolean} use_hashes
   * @param {import('types').CspDirectives} directives
   */
  constructor(use_hashes, directives) {
    super(use_hashes, directives)
    if (
      Object.values(directives).some((v) => !!v) &&
      !directives['report-to']?.length &&
      !directives['report-uri']?.length
    )
      csp_report_only_missing_report()
  }
}
var Csp = class {
  /** @readonly */
  nonce = generate_nonce()
  /** @type {CspProvider} */
  csp_provider
  /** @type {CspReportOnlyProvider} */
  report_only_provider
  /** @type {boolean} */
  #use_hashes
  /**
   * @param {import('./types.js').CspConfig} config
   * @param {import('./types.js').CspOpts} opts
   */
  constructor({ mode, directives, reportOnly }, { prerender }) {
    this.#use_hashes = mode === 'hash' || (mode === 'auto' && prerender)
    this.csp_provider = new CspProvider(this.#use_hashes, directives)
    this.report_only_provider = new CspReportOnlyProvider(this.#use_hashes, reportOnly)
  }
  /**
   * @param {string} content
   * @returns {Promise<CspSource>}
   */
  async #get_source(content) {
    return this.#use_hashes ? `sha256-${await sha256(content)}` : `nonce-${this.nonce}`
  }
  get script_needs_hash() {
    return this.csp_provider.script_needs_hash || this.report_only_provider.script_needs_hash
  }
  get script_needs_nonce() {
    return this.csp_provider.script_needs_nonce || this.report_only_provider.script_needs_nonce
  }
  get style_needs_nonce() {
    return this.csp_provider.style_needs_nonce || this.report_only_provider.style_needs_nonce
  }
  /** @param {string} content */
  async add_script(content) {
    if (!this.csp_provider.script_needs_csp && !this.report_only_provider.script_needs_csp) return
    const source = await this.#get_source(content)
    if (this.csp_provider.script_needs_csp) this.csp_provider.add_script(source)
    if (this.report_only_provider.script_needs_csp) this.report_only_provider.add_script(source)
  }
  /** @param {`sha256-${string}`[]} hashes */
  add_script_hashes(hashes) {
    for (const hash of hashes) {
      this.csp_provider.add_script(hash)
      this.report_only_provider.add_script(hash)
    }
  }
  /** @param {string} content */
  async add_style(content) {
    if (!this.csp_provider.style_needs_csp && !this.report_only_provider.style_needs_csp) return
    const source = await this.#get_source(content)
    this.csp_provider.add_style(source)
    this.report_only_provider.add_style(source)
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/page/server_routing.js
/** @import { ParamValue } from '@sveltejs/kit/params' */
/** @import { SSRManifest } from 'types' */
/**
 * @param {import('types').SSRClientRoute} route
 * @param {URL} url
 * @param {NonNullable<SSRManifest['client']>} client
 * @returns {string}
 */
function generate_route_object(route, url, client) {
  const { errors, layouts, leaf } = route
  const paths = resolve_paths(url.pathname)
  const nodes = [...errors, ...layouts.map((l) => l?.[1]), leaf[1]]
    .filter((n) => typeof n === 'number')
    .map((n) => `'${n}': () => ${create_client_import(client.nodes?.[n], paths)}`)
    .join(',\n		')
  return [
    `{\n\tid: ${s(route.id)}`,
    `errors: ${s(route.errors)}`,
    `layouts: ${s(route.layouts)}`,
    `leaf: ${s(route.leaf)}`,
    `nodes: {\n\t\t${nodes}\n\t}\n}`
  ].join(',\n	')
}
/**
 * The `base` and `assets` prefixes for client paths in a document at `pathname`. With
 * `paths.relative`, they're relative to that document so the app also works when served
 * from IPFS, the internet archive, or behind a proxy.
 * @param {string} pathname
 */
function resolve_paths(pathname) {
  const relative_base =
    pathname
      .slice(0)
      .split('/')
      .slice(2)
      .map(() => '..')
      .join('/') || '.'
  return {
    base: relative_base,
    assets:
      !assets || (assets[0] === '/' && assets !== '/_svelte_kit_assets') ? relative_base : assets
  }
}
/**
 * @param {string} path a root-absolute dev path (e.g. `/@fs/...`) or a prod path relative to `assets`
 * @param {ReturnType<typeof resolve_paths>} paths
 */
function client_path(path, { base, assets }) {
  return path[0] === '/' ? base + path : `${assets}/${path}`
}
/**
 * @param {string | undefined} import_path
 * @param {ReturnType<typeof resolve_paths>} paths
 */
function create_client_import(import_path, paths) {
  return import_path ? `import('${client_path(import_path, paths)}')` : 'Promise.resolve({})'
}
/**
 * @param {string} resolved_path
 * @param {URL} url
 * @returns {Promise<Response>}
 */
async function resolve_route(resolved_path, url) {
  if (!manifest.client?.routes)
    return text('Server-side route resolution disabled', { status: 400 })
  try {
    const matchers = await manifest.matchers()
    const result = find_route(resolved_path, manifest.client.routes, matchers)
    return create_server_routing_response(
      result?.route ?? null,
      result?.params ?? {},
      url,
      manifest.client
    ).response
  } catch {
    return text('Error resolving route', { status: 500 })
  }
}
/**
 * Resolve a route-ID resolution request (`/_app/routes/<id>/__route.js`) to a
 * JS module containing the route's node loaders. Params are always `{}` since
 * this endpoint exists to support `preloadCode(routeId)`, which doesn't need them.
 *
 * The module has one of three shapes, which the client uses to tell three cases apart:
 *
 * - `export const route = {...}` — a page route, with loaders to import
 * - `export const endpoint_only = true` — a real route with no `+page`, so there is
 *   nothing to preload, but the client can cache that fact and stop asking
 * - an empty module — no such route
 *
 * @param {string} route_id
 * @param {URL} url
 * @returns {Response}
 */
function resolve_route_by_id(route_id, url) {
  if (!manifest.client?.routes)
    return text('Server-side route resolution disabled', { status: 400 })
  try {
    const route = manifest.client.routes.find((r) => r.id === route_id)
    if (route) return create_server_routing_response(route, null, url, manifest.client).response
    if (manifest.routes.some((r) => r.id === route_id && !r.page))
      return text('export const endpoint_only = true;', { headers: js_headers() })
    return create_server_routing_response(null, null, url, manifest.client).response
  } catch {
    return text('Error resolving route', { status: 500 })
  }
}
function js_headers() {
  return new Headers({ 'content-type': 'application/javascript; charset=utf-8' })
}
/**
 * @param {import('types').SSRClientRoute | null} route
 * @param {Partial<Record<string, ParamValue>> | null} params
 * @param {URL} url
 * @param {NonNullable<SSRManifest['client']>} client
 * @returns {{response: Response, body: string}}
 */
function create_server_routing_response(route, params, url, client) {
  const headers = js_headers()
  let body = ''
  if (route) {
    const csr_route = generate_route_object(route, url, client)
    body = `${create_css_import(route, url, client)}export const route = ${csr_route};`
    if (params !== null) body += `\nexport const params = ${uneval$1(params)}`
  }
  return {
    response: text(body, { headers }),
    body
  }
}
/**
 * This function generates the client-side import for the CSS files that are
 * associated with the current route. Vite takes care of that when using
 * client-side route resolution, but for server-side resolution it does
 * not know about the CSS files automatically.
 *
 * @param {import('types').SSRClientRoute} route
 * @param {URL} url
 * @param {NonNullable<SSRManifest['client']>} client
 * @returns {string}
 */
function create_css_import(route, url, client) {
  const { errors, layouts, leaf } = route
  const paths = resolve_paths(url.pathname)
  let css = ''
  for (const node of [...errors, ...layouts.map((l) => l?.[1]), leaf[1]]) {
    if (typeof node !== 'number') continue
    const node_css = client.css?.[node]
    for (const css_path of node_css ?? []) css += `'${client_path(css_path, paths)}',`
  }
  if (!css) return ''
  return `${create_client_import(client.start, paths)}.then(x => x.load_css([${css}]));\n`
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/app/navigation/server.js
var afterNavigate = noop
disallow_on_server('disableScrollHandling', '()')
disallow_on_server('goto')
disallow_on_server('invalidate')
disallow_on_server('invalidateAll', '()')
disallow_on_server('refreshAll', '()')
disallow_on_server('preloadCode')
disallow_on_server('preloadData')
disallow_on_server('pushState')
disallow_on_server('replaceState')
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/components/root.svelte
function Root($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    const { page, components, onerror, tree, form, error } = $$props
    let mounted = false
    let navigated = false
    let title = ''
    afterNavigate(() => {
      if (mounted) {
        navigated = true
        title = document.title || 'untitled page'
      } else mounted = true
    })
    function node($$renderer, n, depth) {
      const Component = derived(() => n.component)
      const Error = derived(() => n.error)
      const data = derived(() => n.data)
      function failed($$renderer, error) {
        if (Error()) {
          $$renderer.push('<!--[-->')
          Error()($$renderer, { error })
          $$renderer.push('<!--]-->')
        } else {
          $$renderer.push('<!--[!-->')
          $$renderer.push('<!--]-->')
        }
      }
      $$renderer.boundary({ failed: Error() ? failed : void 0 }, ($$renderer) => {
        $$renderer.push(`<!--[-->`)
        if (n.child) {
          $$renderer.push('<!--[0-->')
          if (Component()) {
            $$renderer.push('<!--[-->')
            Component()($$renderer, {
              data: data(),
              form,
              params: page.params,
              children: ($$renderer) => {
                node($$renderer, n.child, depth + 1)
              },
              $$slots: { default: true }
            })
            $$renderer.push('<!--]-->')
          } else {
            $$renderer.push('<!--[!-->')
            $$renderer.push('<!--]-->')
          }
        } else {
          $$renderer.push('<!--[-1-->')
          if (Component()) {
            $$renderer.push('<!--[-->')
            Component()($$renderer, {
              data: data(),
              form,
              params: page.params,
              error
            })
            $$renderer.push('<!--]-->')
          } else {
            $$renderer.push('<!--[!-->')
            $$renderer.push('<!--]-->')
          }
        }
        $$renderer.push(`<!--]-->`)
        $$renderer.push(`<!--]-->`)
      })
    }
    node($$renderer, tree, 0)
    $$renderer.push(`<!----> `)
    if (mounted) {
      $$renderer.push(
        `<!--[0--><div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px">`
      )
      if (navigated) $$renderer.push(`<!--[0-->${escape_html$1(title)}`)
      else $$renderer.push('<!--[-1-->')
      $$renderer.push(`<!--]--></div>`)
    } else $$renderer.push('<!--[-1-->')
    $$renderer.push(`<!--]-->`)
  })
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/props.svelte.js
var Props = class {
  /** @type {Page} */
  page
  /**
   * An array of the `+layout.svelte` and `+page.svelte` component instances
   * that currently live on the page — used for capturing and restoring snapshots.
   * It's updated/manipulated through `bind:this` in `Root.svelte`.
   * @type {Array<Record<string, any>>}
   * @deprecated only used for `export const snapshot` — TODO 4.0 get rid
   */
  components = []
  /** @type {any} */
  form
  /** @type {App.Error | undefined} */
  error
  /** @type {RenderNode} */
  tree
  /** @type {(error: unknown, reset: () => void) => void} */
  onerror
  /**
   * @param {{
   *   page: Page;
   *   tree: RenderNode;
   *   form: any;
   *   error: App.Error | undefined;
   *   onerror?: (error: unknown, reset: () => void) => void;
   * }} props
   */
  constructor({ page, tree, form, error, onerror = noop }) {
    this.page = page
    this.tree = tree
    this.onerror = onerror
    this.form = form
    this.error = error
  }
}
var RenderNode = class {
  /** @type {Component} */
  component
  /** @type {Component | undefined} */
  error
  /** @type {Record<string, any>} */
  data = {}
  /** @type {RenderNode | undefined} */
  child
  /**
   *
   * @param {Component} component
   * @param {Component | undefined} error
   */
  constructor(component, error) {
    this.component = component
    this.error = error
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/page/render.js
/** @import { Component } from 'svelte'; */
/** @import { SyncRenderOutput } from 'svelte/server' */
/**
 * Creates the HTML response.
 * @param {{
 *   branch: Array<import('./types.js').Loaded>;
 *   fetched: Array<import('./types.js').Fetched>;
 *   page_config: { ssr: boolean; csr: boolean };
 *   status: number;
 *   error: App.Error | null;
 *   event: import('@sveltejs/kit').RequestEvent;
 *   state: import('types').RequestState;
 *   resolve_opts: import('types').RequiredResolveOptions;
 *   action_result?: import('types').ServerActionResult;
 *   data_serializer: import('./types.js').ServerDataSerializer;
 *   error_components?: Array<import('svelte').Component | undefined>
 * }} opts
 */
async function render_response({
  branch,
  fetched,
  page_config,
  status,
  error = null,
  event,
  state,
  resolve_opts,
  action_result,
  data_serializer,
  error_components
}) {
  if (is_prerendering(state)) {
    if (options.csp.mode === 'nonce') prerender_nonce()
    if (options.app_template_contains_nonce) prerender_template_nonce({ tag: '%sveltekit.nonce%' })
  }
  const client = manifest.client
  const modulepreloads = new Set(client?.imports)
  const stylesheets = new Set(client?.stylesheets)
  /** @type {Map<string, import('types').FontDependency>} */
  const fonts = new Map(client?.fonts.map((font) => [font.file, font]))
  /** @type {Map<string, string>} */
  const inline_styles = /* @__PURE__ */ new Map()
  /** @type {Omit<SyncRenderOutput, 'html'>} */
  let rendered
  const form_value =
    action_result?.type === 'success' || action_result?.type === 'failure'
      ? (action_result.data ?? null)
      : null
  /** @type {string} */
  let base = ''
  /** @type {string} */
  let assets$1 = assets
  /**
   * An expression that will evaluate in the client to determine the resolved base path.
   * We use a relative path when possible to support IPFS, the internet archive, etc.
   */
  let base_expression = s('')
  const csp = new Csp(options.csp, { prerender: is_prerendering(state) })
  if (!state.prerendering?.fallback) {
    ;({ base, assets: assets$1 } = resolve_paths(event.url.pathname))
    base_expression = `new URL(${s(base)}, location).pathname.slice(0, -1)`
  }
  if (page_config.ssr) {
    const props = new Props({
      page: {
        error,
        params: event.params,
        route: event.route,
        status,
        url: event.url,
        data: {},
        form: form_value,
        shallow: null,
        state: {}
      },
      tree: new RenderNode(await branch[0].node.component?.(), void 0),
      form: form_value,
      error: error ?? void 0
    })
    let current_node = props.tree
    let data = props.page.data
    for (let i = 0; i < branch.length; i += 1) {
      const node = branch[i]
      data = {
        ...data,
        ...node.data
      }
      current_node.data = data
      if (i < branch.length - 1)
        current_node = current_node.child = new RenderNode(
          await branch[i + 1].node.component?.(),
          error_components?.[i + 1]
        )
    }
    props.page.data = data
    const render_state = {
      ...state,
      is_in_render: true
    }
    const render_opts = {
      context: /* @__PURE__ */ new Map([['__request__', { page: props.page }]]),
      csp: csp.script_needs_nonce ? { nonce: csp.nonce } : { hash: csp.script_needs_hash },
      transformError: error_components
        ? (e) => {
            if (isRedirect(e)) throw e
            const handled = handle_error_and_jsonify(event, render_state, e)
            if (handled instanceof Promise)
              return handled.then((e) => {
                error = e
                props.page.error = error
                props.page.status = status = error.status
                return error
              })
            error = handled
            props.page.error = error
            props.page.status = status = error.status
            return error
          }
        : void 0
    }
    globalThis.fetch
    try {
      rendered = await with_request_store(
        {
          event,
          state: render_state
        },
        async () => {
          return render(Root, {
            ...render_opts,
            props
          })
        }
      )
      if (rendered.hashes) csp.add_script_hashes(rendered.hashes.script)
    } finally {
    }
  } else
    rendered = {
      head: '',
      body: '',
      hashes: { script: [] }
    }
  for (const { node } of branch) {
    for (const url of node.imports) modulepreloads.add(url)
    for (const url of node.stylesheets) stylesheets.add(url)
    for (const font of node.fonts) fonts.set(font.file, font)
    if (node.inline_styles && !client?.inline)
      Object.entries(await node.inline_styles()).forEach(([filename, css]) => {
        if (typeof css === 'string') {
          inline_styles.set(filename, css)
          return
        }
        inline_styles.set(filename, css(`${assets$1}/${app_dir}/immutable/assets`, assets$1))
      })
  }
  const head = new Head(rendered.head)
  let body = rendered.body
  /** @param {string} path */
  const prefixed = (path) =>
    client_path(path, {
      base,
      assets: assets$1
    })
  const style = client?.inline
    ? client.inline?.style
    : Array.from(inline_styles.values()).join('\n')
  if (style) {
    const attributes = []
    if (csp.style_needs_nonce) attributes.push(`nonce="${csp.nonce}"`)
    await csp.add_style(style)
    head.add_style(style, attributes)
  }
  /**
   * see the `output.linkHeaderPreload` option for details on why we have multiple options here
   * @param {string} path
   * @param {string[]} attributes
   */
  const add_preload = (path, attributes) => {
    head.add_link_tag(path, attributes)
  }
  for (const dep of stylesheets) {
    const path = prefixed(dep)
    const attributes = ['rel="stylesheet"']
    if (inline_styles.has(dep)) attributes.push('disabled', 'media="(max-width: 0)"')
    head.add_stylesheet(path, attributes)
  }
  for (const { file, filename } of fonts.values()) {
    const path = prefixed(file)
    if (
      resolve_opts.preload({
        type: 'font',
        path,
        filename
      })
    )
      add_preload(path, [
        'rel="preload"',
        'as="font"',
        `type="font/${file.slice(file.lastIndexOf('.') + 1)}"`,
        'crossorigin'
      ])
  }
  const global = '__sveltekit_4n03bp'
  const { data, chunks } = data_serializer.get_data(csp)
  if (page_config.ssr && page_config.csr)
    body += `\n\t\t\t${fetched.map((item) => serialize_data(item, resolve_opts.filterSerializedResponseHeaders, is_prerendering(state))).join('\n			')}`
  if (page_config.csr && client) {
    const route = client.routes?.find((r) => r.id === event.route.id) ?? null
    const load_env_eagerly = client.uses_env_dynamic_public && is_prerendering(state)
    if (load_env_eagerly) modulepreloads.add(`${app_dir}/env.js`)
    if (!client.inline)
      for (const dep of modulepreloads) {
        const path = prefixed(dep)
        if (
          resolve_opts.preload({
            type: 'js',
            path
          })
        )
          add_preload(path, ['rel="modulepreload"'])
      }
    if (client.routes && state.prerendering && !state.prerendering.fallback) {
      const pathname = add_resolution_suffix(event.url.pathname)
      state.prerendering.dependencies.set(
        pathname,
        create_server_routing_response(route, event.params, new URL(pathname, event.url), client)
      )
      if (route && !state.prerendering.resolved_route_ids.has(route.id)) {
        state.prerendering.resolved_route_ids.add(route.id)
        const id_pathname = '' + route_id_resolution_pathname(route.id)
        state.prerendering.dependencies.set(
          id_pathname,
          create_server_routing_response(route, null, new URL(id_pathname, event.url), client)
        )
      }
    }
    const blocks = []
    const properties = [`base: ${base_expression}`, `version: ${s('1794768647061')}`]
    if (assets) properties.push(`assets: ${s(assets)}`)
    if (client.uses_env_dynamic_public)
      properties.push(`env: ${load_env_eagerly ? 'null' : uneval$1(rendered_env)}`)
    if (chunks) {
      blocks.push('const deferred = new Map();')
      properties.push(`defer: (id) => new Promise((fulfil, reject) => {
							deferred.set(id, { fulfil, reject });
						})`)
      let app_declaration = ''
      if (has_custom_transporters) {
        if (client.inline) app_declaration = `const app = ${global}.app.app;`
        else if (client.app)
          app_declaration = `const kit = await import(${s(prefixed(client.start))});
							kit.init(${global});
							const app = await import(${s(prefixed(client.app))});`
        else app_declaration = `const { app } = await import(${s(prefixed(client.start))});`
      }
      const prelude = app_declaration
        ? `${app_declaration}
							const [data, error] = fn(app);`
        : `const [data, error] = fn();`
      properties.push(`resolve: async (id, fn) => {
							${prelude}

							const try_to_resolve = () => {
								if (!deferred.has(id)) {
									setTimeout(try_to_resolve, 0);
									return;
								}
								const { fulfil, reject } = deferred.get(id);
								deferred.delete(id);
								if (error) reject(error);
								else fulfil(data);
							}
							try_to_resolve();
						}`)
    }
    blocks.push(`${global} = {
						${properties.join(',\n						')}
					};`)
    const args = ['element']
    blocks.push('const element = document.currentScript.parentElement;')
    if (page_config.ssr) {
      const serialized = {
        form: 'null',
        error: 'null'
      }
      if (form_value) serialized.form = uneval_action_response(form_value, event.route.id)
      if (error) serialized.error = uneval$1(error)
      const hydrate = [
        `node_ids: [${branch.map(({ node }) => node.index).join(', ')}]`,
        `data: ${data}`,
        `form: ${serialized.form}`,
        `error: ${serialized.error}`
      ]
      if (status !== 200 && !error) hydrate.push(`status: ${status}`)
      if (client.routes) {
        if (route) {
          const stringified = generate_route_object(route, event.url, client).replaceAll('\n', '\n							')
          hydrate.push(`params: ${uneval$1(event.params)}`, `server_route: ${stringified}`)
        }
      }
      const indent = '	'.repeat(load_env_eagerly ? 7 : 6)
      args.push(`{\n${indent}\t${hydrate.join(`,\n${indent}\t`)}\n${indent}}`)
    }
    const remote_data = await collect_remote_data({}, event, state)
    const serialized_data =
      Object.keys(remote_data).length > 0
        ? `${global}.data = ${uneval(remote_data)};\n\n\t\t\t\t\t\t`
        : ''
    const boot = client.inline
      ? `${client.inline.script}

					${serialized_data}${global}.app.start(${args.join(', ')});`
      : client.app
        ? `import(${s(prefixed(client.start))}).then(async (kit) => {
						kit.init(${global});
						const app = await import(${s(prefixed(client.app))});
						${serialized_data}kit.start(app, ${args.join(', ')});
					});`
        : `import(${s(prefixed(client.start))}).then((app) => {
						${serialized_data}app.start(${args.join(', ')})
					});`
    if (load_env_eagerly)
      blocks.push(`import(${s(`${base}/${app_dir}/env.js`)}).then(({ env }) => {
						${global}.env = env;

						${boot.replace(/\n/g, '\n	')}
					});`)
    else blocks.push(boot)
    const init_app = `
				{
					${blocks.join('\n\n					')}
				}
			`
    await csp.add_script(init_app)
    body += `\n\t\t\t<script${csp.script_needs_nonce ? ` nonce="${csp.nonce}"` : ''}>${init_app}<\/script>\n\t\t`
  }
  const headers = new Headers({
    'x-sveltekit-page': 'true',
    'content-type': 'text/html'
  })
  if (is_prerendering(state)) {
    const csp_headers = csp.csp_provider.get_meta()
    if (csp_headers) head.add_http_equiv(csp_headers)
    if (state.prerendering?.cache)
      head.add_http_equiv(
        `<meta http-equiv="cache-control" content="${escape_html(state.prerendering.cache, true)}">`
      )
  } else {
    const csp_header = csp.csp_provider.get_header()
    if (csp_header) headers.set('content-security-policy', csp_header)
    const report_only_header = csp.report_only_provider.get_header()
    if (report_only_header) headers.set('content-security-policy-report-only', report_only_header)
  }
  const html = options.templates.app({
    head: head.build(),
    body,
    assets: assets$1,
    nonce: csp.nonce,
    env: explicit_public_env
  })
  const transformed =
    (await resolve_opts.transformPageChunk({
      html,
      done: true
    })) || ''
  if (!chunks) headers.set('etag', `"${hash(transformed)}"`)
  return chunks
    ? new Response(stream_text(transformed + '\n', chunks), {
        status,
        headers
      })
    : text(transformed, {
        status,
        headers
      })
}
var Head = class {
  #rendered
  /** @type {string[]} */
  #http_equiv = []
  /** @type {string[]} */
  #link_tags = []
  /** @type {string[]} */
  #style_tags = []
  /** @type {string[]} */
  #stylesheet_links = []
  /**
   * @param {string} rendered
   */
  constructor(rendered) {
    this.#rendered = rendered
  }
  build() {
    return [
      ...this.#http_equiv,
      ...this.#link_tags,
      this.#rendered,
      ...this.#style_tags,
      ...this.#stylesheet_links
    ].join('\n		')
  }
  /**
   * @param {string} style
   * @param {string[]} attributes
   */
  add_style(style, attributes) {
    this.#style_tags.push(
      `<style${attributes.length ? ' ' + attributes.join(' ') : ''}>${style}</style>`
    )
  }
  /**
   * @param {string} href
   * @param {string[]} attributes
   */
  add_stylesheet(href, attributes) {
    this.#stylesheet_links.push(`<link href="${href}" ${attributes.join(' ')}>`)
  }
  /**
   * @param {string} href
   * @param {string[]} attributes
   */
  add_link_tag(href, attributes) {
    this.#link_tags.push(`<link href="${href}" ${attributes.join(' ')}>`)
  }
  /** @param {string} tag */
  add_http_equiv(tag) {
    this.#http_equiv.push(tag)
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/utils/format.js
/**
 * Joins a list as `a`, `a or b` or `a, b or c`, for use in diagnostics
 * @param {string[]} items
 */
function join_or(items) {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} or ${items.at(-1)}` : items[0]
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/utils/exports.js
/**
 * @param {Set<string>} expected
 */
function validator(expected) {
  /**
   * @param {any} module
   * @param {string} [file]
   */
  function validate(module, file) {
    if (!module) return
    for (const key in module) {
      if (key[0] === '_' || expected.has(key)) continue
      const locations = valid_locations(key, file?.slice(file.lastIndexOf('.')))
      if (locations.length > 0)
        invalid_export_location({
          key,
          locations: join_or(locations),
          file: file || void 0
        })
      invalid_export({
        key,
        exports: [...expected.values()].join(', '),
        file: file || void 0
      })
    }
  }
  return validate
}
/**
 * Returns the route files in which `key` is a valid export
 * @param {string} key
 * @param {string} ext
 * @returns {string[]}
 */
function valid_locations(key, ext = '.js') {
  const locations = []
  if (valid_layout_exports.has(key)) locations.push(`+layout${ext}`)
  if (valid_page_exports.has(key)) locations.push(`+page${ext}`)
  if (valid_layout_server_exports.has(key)) locations.push(`+layout.server${ext}`)
  if (valid_page_server_exports.has(key)) locations.push(`+page.server${ext}`)
  if (valid_server_exports.has(key)) locations.push(`+server${ext}`)
  return locations
}
var valid_layout_exports = /* @__PURE__ */ new Set([
  'load',
  'prerender',
  'csr',
  'ssr',
  'trailingSlash',
  'config'
])
var valid_page_exports = /* @__PURE__ */ new Set([...valid_layout_exports, 'entries'])
var valid_layout_server_exports = /* @__PURE__ */ new Set([...valid_layout_exports])
var valid_page_server_exports = /* @__PURE__ */ new Set([
  ...valid_layout_server_exports,
  'actions',
  'entries'
])
var valid_server_exports = /* @__PURE__ */ new Set([
  'GET',
  'POST',
  'PATCH',
  'PUT',
  'DELETE',
  'OPTIONS',
  'HEAD',
  'QUERY',
  'fallback',
  'prerender',
  'trailingSlash',
  'config',
  'entries'
])
var validate_layout_exports = validator(valid_layout_exports)
var validate_page_exports = validator(valid_page_exports)
var validate_layout_server_exports = validator(valid_layout_server_exports)
var validate_page_server_exports = validator(valid_page_server_exports)
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/utils/page_nodes.js
/** @import { UniversalNode, ServerNode } from 'types' */
var PageNodes = class {
  /** All layout nodes and the page node, if any */
  data
  /**
   * @param {Array<import('types').SSRNode | undefined>} nodes
   */
  constructor(nodes) {
    this.data = nodes
  }
  layouts() {
    return this.data.slice(0, -1)
  }
  page() {
    return this.data.at(-1)
  }
  validate() {
    for (const layout of this.layouts())
      if (layout) {
        validate_layout_server_exports(layout.server, layout.server_id)
        validate_layout_exports(layout.universal, layout.universal_id)
      }
    const page = this.page()
    if (page) {
      validate_page_server_exports(page.server, page.server_id)
      validate_page_exports(page.universal, page.universal_id)
    }
  }
  /**
   * @template {'prerender' | 'ssr' | 'csr' | 'trailingSlash'} Option
   * @param {Option} option
   * @returns {(UniversalNode | ServerNode)[Option] | undefined}
   */
  #get_option(option) {
    /** @typedef {(UniversalNode | ServerNode)[Option]} Value */
    return this.data.reduce(
      (value, node) => {
        return node?.universal?.[option] ?? node?.server?.[option] ?? value
      },
      void 0
    )
  }
  csr() {
    return this.#get_option('csr') ?? true
  }
  ssr() {
    return this.#get_option('ssr') ?? true
  }
  prerender() {
    return this.#get_option('prerender') ?? false
  }
  trailing_slash() {
    return this.#get_option('trailingSlash') ?? 'never'
  }
  get_config() {
    /** @type {Record<string, any>} */
    let current = {}
    for (const node of this.data) {
      if (!node?.universal?.config && !node?.server?.config) continue
      current = {
        ...current,
        ...node?.server?.config,
        ...node?.universal?.config
      }
    }
    return Object.keys(current).length ? current : void 0
  }
  should_prerender_data() {
    return this.data.some((node) => node?.server?.load || node?.server?.trailingSlash !== void 0)
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/page/respond_with_error.js
/**
 * @typedef {import('./types.js').Loaded} Loaded
 */
/**
 * @param {{
 *   event: import('@sveltejs/kit').RequestEvent;
 *   state: import('types').RequestState;
 *   error: unknown;
 *   resolve_opts: import('types').RequiredResolveOptions;
 * }} opts
 */
async function respond_with_error({ event, state, error, resolve_opts }) {
  if (event.isDataRequest) return handle_fatal_error(event, state, error)
  if (event.request.headers.get('x-sveltekit-error')) {
    const transformed = await handle_error_and_jsonify(event, state, error)
    return static_error_page(transformed.status, transformed.message)
  }
  /** @type {import('./types.js').Fetched[]} */
  const fetched = []
  try {
    const branch = []
    const default_layout = await manifest.nodes[0]()
    const nodes = new PageNodes([default_layout])
    const ssr = nodes.ssr()
    const csr = nodes.csr()
    const data_serializer = server_data_serializer(event, state)
    const transformed = await handle_error_and_jsonify(event, state, error)
    if (ssr) {
      state.error = true
      const server_data_promise = load_server_data({
        event,
        state,
        node: default_layout,
        parent: async () => ({})
      })
      const server_data = await server_data_promise
      data_serializer.add_node(0, server_data)
      const data = await load_data({
        event,
        state,
        fetched,
        node: default_layout,
        parent: async () => ({}),
        resolve_opts,
        server_data_promise,
        csr
      })
      branch.push(
        {
          node: default_layout,
          server_data,
          data
        },
        {
          node: await manifest.nodes[1](),
          data: null,
          server_data: null
        }
      )
    }
    return await render_response({
      page_config: {
        ssr,
        csr
      },
      status: transformed.status,
      error: transformed,
      branch,
      error_components: [],
      fetched,
      event,
      state,
      resolve_opts,
      data_serializer
    })
  } catch (e) {
    if (e instanceof Redirect) return redirect_response(e.status, e.location)
    const transformed = await handle_error_and_jsonify(event, state, e)
    return static_error_page(transformed.status, transformed.message)
  }
}
/**
 * Return as a response that renders the error.html
 *
 * @param {number} status
 * @param {string} message
 */
function static_error_page(status, message) {
  let page = options.templates.error({
    status,
    message: escape_html(message)
  })
  return text(page, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
    status
  })
}
/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {import('types').RequestState} state
 * @param {unknown} error
 */
async function handle_fatal_error(event, state, error) {
  const body = await handle_error_and_jsonify(event, state, error)
  const status = body.status
  const type = negotiate(event.request.headers.get('accept') || 'text/html', [
    'application/json',
    'text/html'
  ])
  if (event.isDataRequest || type === 'application/json') return Response.json(body, { status })
  return static_error_page(status, body.message)
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/page/index.js
/** @import { RequestEvent } from '@sveltejs/kit' */
/** @import { PageNodeIndexes, RequestState, RequiredResolveOptions, ServerDataNode, SSRNode } from 'types' */
/**
 * The maximum request depth permitted before assuming we're stuck in an infinite loop
 */
var MAX_DEPTH = 10
/**
 * @param {RequestEvent} event
 * @param {RequestState} state
 * @param {PageNodeIndexes} page
 * @param {import('../../../utils/page_nodes.js').PageNodes} nodes
 * @param {RequiredResolveOptions} resolve_opts
 * @returns {Promise<Response>}
 */
async function render_page(event, state, page, nodes, resolve_opts) {
  if (state.depth > MAX_DEPTH) return text(`Not found: ${event.url.pathname}`, { status: 404 })
  if (is_action_json_request(event)) {
    const node = await manifest.nodes[page.leaf]()
    return handle_action_json_request(event, state, node?.server)
  }
  try {
    const leaf_node = nodes.page()
    let status = 200
    /** @type {import('types').ServerActionResult | undefined} */
    let action_result = void 0
    if (is_action_request(event)) {
      const remote_id = get_remote_action(event.url)
      if (remote_id) action_result = await handle_remote_form_post(event, state, remote_id)
      else action_result = await handle_action_request(event, state, leaf_node.server)
      if (action_result?.type === 'redirect')
        return redirect_response(action_result.status, action_result.location)
      if (action_result?.type === 'error') status = get_status(action_result.error)
      if (action_result?.type === 'failure') status = action_result.status
    }
    const should_prerender = nodes.prerender()
    if (should_prerender) {
      if (leaf_node.server?.actions) prerender_actions()
    } else if (state.prerendering) return new Response(void 0, { status: 204 })
    state.prerender_default = should_prerender
    const should_prerender_data = nodes.should_prerender_data()
    const data_pathname = add_data_suffix(event.url.pathname)
    /** @type {import('./types.js').Fetched[]} */
    const fetched = []
    const ssr = nodes.ssr()
    const csr = nodes.csr()
    if (ssr === false && !(is_prerendering(state) && should_prerender_data))
      return await render_response({
        branch: compact(nodes.data).map((node) => {
          return {
            node,
            data: null,
            server_data: null
          }
        }),
        fetched,
        page_config: {
          ssr: false,
          csr
        },
        status,
        error: null,
        event,
        state,
        resolve_opts,
        data_serializer: server_data_serializer(event, state)
      })
    /** @type {Array<import('./types.js').Loaded | null>} */
    const branch = []
    /** @type {Error | null} */
    let load_error = null
    const data_serializer = server_data_serializer(event, state)
    const data_serializer_json =
      is_prerendering(state) && should_prerender_data
        ? server_data_serializer_json(event, state)
        : null
    /** @type {Array<Promise<ServerDataNode | null>>} */
    const server_promises = nodes.data.map((node, i) => {
      if (load_error) throw load_error
      return Promise.resolve().then(async () => {
        try {
          if (node === leaf_node && action_result?.type === 'error') throw action_result.error
          const server_data = await load_server_data({
            event,
            state,
            node,
            parent: async () => {
              /** @type {Record<string, any>} */
              const data = {}
              for (let j = 0; j < i; j += 1) {
                const parent = await server_promises[j]
                if (parent) Object.assign(data, parent.data)
              }
              return data
            }
          })
          if (node) data_serializer.add_node(i, server_data)
          data_serializer_json?.add_node(i, server_data)
          return server_data
        } catch (e) {
          load_error = e
          throw load_error
        }
      })
    })
    /** @type {Array<Promise<Record<string, any> | null>>} */
    const load_promises = nodes.data.map((node, i) => {
      if (load_error) throw load_error
      return Promise.resolve().then(async () => {
        try {
          return await load_data({
            event,
            state,
            fetched,
            node,
            parent: async () => {
              const data = {}
              for (let j = 0; j < i; j += 1) Object.assign(data, await load_promises[j])
              return data
            },
            resolve_opts,
            server_data_promise: server_promises[i],
            csr
          })
        } catch (e) {
          load_error = e
          throw load_error
        }
      })
    })
    for (const p of server_promises) p.catch(noop)
    for (const p of load_promises) p.catch(noop)
    for (let i = 0; i < nodes.data.length; i += 1) {
      const node = nodes.data[i]
      if (node)
        try {
          const server_data = await server_promises[i]
          const data = await load_promises[i]
          branch.push({
            node,
            server_data,
            data
          })
        } catch (e) {
          const err = normalize_error(e)
          if (err instanceof Redirect) {
            if (state.prerendering && should_prerender_data) {
              const body = JSON.stringify({
                type: 'redirect',
                status: err.status,
                location: err.location
              })
              state.prerendering.dependencies.set(data_pathname, {
                response: text(body),
                body
              })
            }
            return redirect_response(err.status, err.location)
          }
          const error = await handle_error_and_jsonify(event, state, err)
          const status = error.status
          for (const { error: index, idx } of nearest_error_pages(i, branch, page.errors)) {
            const node = await manifest.nodes[index]()
            data_serializer.set_max_nodes(idx)
            const layouts = compact(branch.slice(0, idx))
            const nodes = new PageNodes(layouts.map((layout) => layout.node))
            const error_branch = layouts.concat({
              node,
              data: null,
              server_data: null
            })
            return await render_response({
              event,
              state,
              resolve_opts,
              page_config: {
                ssr: nodes.ssr(),
                csr: nodes.csr()
              },
              status,
              error,
              error_components: await load_error_components(ssr, error_branch, page),
              branch: error_branch,
              fetched,
              data_serializer
            })
          }
          return static_error_page(status, error.message)
        }
      else branch.push(null)
    }
    if (state.prerendering && data_serializer_json) {
      let { data, chunks } = data_serializer_json.get_data()
      if (chunks) for await (const chunk of chunks) data += chunk
      state.prerendering.dependencies.set(data_pathname, {
        response: text(data),
        body: data
      })
    }
    return await render_response({
      event,
      state,
      resolve_opts,
      page_config: {
        csr,
        ssr
      },
      status,
      error: null,
      branch: compact(branch),
      action_result,
      fetched,
      data_serializer: !ssr ? server_data_serializer(event, state) : data_serializer,
      error_components: await load_error_components(ssr, branch, page)
    })
  } catch (e) {
    if (e instanceof Redirect) return redirect_response(e.status, e.location)
    return await respond_with_error({
      event,
      state,
      error: e,
      resolve_opts
    })
  }
}
/**
 * @param {boolean} ssr
 * @param {Array<import('./types.js').Loaded | null>} branch
 * @param {PageNodeIndexes} page
 */
function load_error_components(ssr, branch, page) {
  if (!ssr) return void 0
  return build_error_chain(branch, page.errors, (idx) =>
    manifest.nodes[idx]?.().then((e) => e.component?.())
  )
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/csrf.js
var mutating_form_methods = /* @__PURE__ */ new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
/**
 * The origin SvelteKit treats as "self" when validating the `Origin` header on
 * cross-site requests.
 *
 * By default (`paths.origin` is `undefined`), SvelteKit derives the origin
 * from `request.url` (which is set by the adapter, and ultimately by the
 * platform). When `paths.origin` is configured — for example so that a preview
 * deployment whose URL isn't known at build time, or an app behind a reverse
 * proxy, can declare a canonical origin — that value takes precedence.
 *
 * @param {string | undefined} paths_origin the configured `kit.paths.origin`
 * @param {string} url_origin the origin derived from `request.url`
 * @returns {string}
 */
function get_self_origin(paths_origin, url_origin) {
  return paths_origin || url_origin
}
/**
 * Determines whether a non-remote request should be rejected as a cross-site
 * request forgery (CSRF). Used by `respond.js` to gate form `POST`/`PUT`/
 * `PATCH`/`DELETE` requests whose `Origin` header doesn't match the app's
 * self-origin (and isn't in `trusted_origins`).
 *
 * @param {{
 *   request: Request;
 *   request_origin: string | null;
 *   self_origin: string;
 *   trusted_origins: string[];
 * }} input
 * @returns {boolean}
 */
function is_csrf_forbidden({ request, request_origin, self_origin, trusted_origins }) {
  return (
    (!request.headers.get('content-type') || is_form_content_type(request)) &&
    mutating_form_methods.has(request.method) &&
    request_origin !== self_origin &&
    (!request_origin || !trusted_origins.includes(request_origin))
  )
}
/**
 * Determines whether a remote-function request should be rejected as cross-site.
 *
 * Unlike form submissions, remote functions accept any content type (e.g.
 * `application/json`), so the check is solely on the request method and origin:
 * a non-`GET` request is forbidden when its `Origin` header doesn't match the
 * app's self-origin. Unlike `is_csrf_forbidden`, entries in `trusted_origins`
 * are *not* honoured — remote function endpoints are an implementation detail,
 * not a public API, so cross-origin calls are forbidden regardless.
 *
 * @param {{
 *   request: Request;
 *   request_origin: string | null;
 *   self_origin: string;
 * }} input
 * @returns {boolean}
 */
function is_remote_forbidden({ request, request_origin, self_origin }) {
  return request.method !== 'GET' && request_origin !== self_origin
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/data/index.js
/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {import('types').RequestState} state
 * @param {{ page: Pick<import('types').PageNodeIndexes, 'layouts' | 'leaf'> | null }} route
 * @param {boolean[] | undefined} invalidated_data_nodes
 * @param {import('types').TrailingSlash} trailing_slash
 * @returns {Promise<Response>}
 */
async function render_data(event, state, route, invalidated_data_nodes, trailing_slash) {
  if (!route.page) return with_version_header(new Response(void 0, { status: 404 }))
  try {
    const node_ids = [...route.page.layouts, route.page.leaf]
    const invalidated = invalidated_data_nodes ?? node_ids.map(() => true)
    let aborted = false
    const url = new URL(event.url)
    url.pathname = normalize_path(url.pathname, trailing_slash)
    const new_event = {
      ...event,
      url
    }
    const functions = node_ids.map((n, i) => {
      return once(async () => {
        try {
          if (aborted) return { type: 'skip' }
          const node = n == void 0 ? n : await manifest.nodes[n]()
          return load_server_data({
            event: new_event,
            state,
            node,
            parent: async () => {
              /** @type {Record<string, any>} */
              const data = {}
              for (let j = 0; j < i; j += 1) {
                const parent = await functions[j]()
                if (parent) Object.assign(data, parent.data)
              }
              return data
            }
          })
        } catch (e) {
          aborted = true
          throw e
        }
      })
    })
    const promises = functions.map(async (fn, i) => {
      if (!invalidated[i]) return { type: 'skip' }
      return fn()
    })
    const data_serializer = server_data_serializer_json(event, state)
    await Promise.all(
      promises.map(async (p, i) => {
        const node = await p.catch(async (error) => {
          if (error instanceof Redirect) throw error
          return {
            type: 'error',
            error: await handle_error_and_jsonify(event, state, error)
          }
        })
        data_serializer.add_node(i, node)
      })
    )
    const { data, chunks } = data_serializer.get_data()
    if (!chunks) return json_response(data)
    return with_version_header(
      new Response(stream_text(data, chunks), {
        headers: {
          'content-type': 'text/sveltekit-data',
          'cache-control': 'private, no-store'
        }
      })
    )
  } catch (e) {
    const error = normalize_error(e)
    if (error instanceof Redirect) return redirect_json_response(error)
    else {
      const transformed = await handle_error_and_jsonify(event, state, error)
      return json_response(transformed, transformed.status)
    }
  }
}
/**
 * @param {Record<string, any> | string} json
 * @param {number} [status]
 */
function json_response(json, status = 200) {
  return with_version_header(
    text(typeof json === 'string' ? json : JSON.stringify(json), {
      status,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'private, no-store'
      }
    })
  )
}
/**
 * @param {Redirect} redirect
 */
function redirect_json_response(redirect) {
  return json_response({
    type: 'redirect',
    status: redirect.status,
    location: redirect.location
  })
}
// ../../node_modules/.pnpm/cookie@2.0.2/node_modules/cookie/dist/index.js
/**
 * RegExp to match cookie-name in RFC 6265 sec 4.1.1
 * This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
 * which has been replaced by the token definition in RFC 7230 appendix B.
 *
 * cookie-name       = token
 * token             = 1*tchar
 * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
 *                     "*" / "+" / "-" / "." / "^" / "_" /
 *                     "`" / "|" / "~" / DIGIT / ALPHA
 *
 * Note: Allowing more characters - https://github.com/jshttp/cookie/issues/191
 * Allow same range as cookie value, except `=`, which delimits end of name.
 */
var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/
/**
 * RegExp to match cookie-value in RFC 6265 sec 4.1.1
 *
 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
 *                     ; US-ASCII characters excluding CTLs,
 *                     ; whitespace DQUOTE, comma, semicolon,
 *                     ; and backslash
 *
 * Allowing more characters: https://github.com/jshttp/cookie/issues/191
 * Comma, backslash, and DQUOTE are not part of the parsing algorithm.
 */
var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/
/**
 * RegExp to match invalid cookie values to be encoded, including `%` for roundtrip safety.
 */
var cookieOctetInvalidRegExp = /[\u0000-\u0020\u007F-\uFFFF",;\\%]/
/**
 * RegExp to match domain-value in RFC 6265 sec 4.1.1
 *
 * domain-value      = <subdomain>
 *                     ; defined in [RFC1034], Section 3.5, as
 *                     ; enhanced by [RFC1123], Section 2.1
 * <subdomain>       = <label> | <subdomain> "." <label>
 * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
 *                     Labels must be 63 characters or less.
 *                     'let-dig' not 'letter' in the first char, per RFC1123
 * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
 * <let-dig-hyp>     = <let-dig> | "-"
 * <let-dig>         = <letter> | <digit>
 * <letter>          = any one of the 52 alphabetic characters A through Z in
 *                     upper case and a through z in lower case
 * <digit>           = any one of the ten digits 0 through 9
 *
 * Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
 *
 * > (Note that a leading %x2E ("."), if present, is ignored even though that
 * character is not permitted, but a trailing %x2E ("."), if present, will
 * cause the user agent to ignore the attribute.)
 */
var domainValueRegExp =
  /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i
/**
 * RegExp to match path-value in RFC 6265 sec 4.1.1
 *
 * path-value        = <any CHAR except CTLs or ";">
 * CHAR              = %x01-7F
 *                     ; defined in RFC 5234 appendix B.1
 */
var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/
/**
 * RegExp to match max-age-value in RFC 6265 sec 5.6.2
 */
var maxAgeRegExp = /^-?\d+$/
var NullObject = /* @__PURE__ */ (() => {
  const C = function () {}
  C.prototype = Object.create(null)
  return C
})()
/**
 * Parse a `Cookie` header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */
function parseCookie(str, options) {
  const obj = new NullObject()
  const len = str.length
  if (len < 2) return obj
  const dec = options?.decode ?? defaultDecode
  let index = 0
  do {
    const eqIdx = eqIndex(str, index, len)
    if (eqIdx === len) break
    const endIdx = endIndex(str, index, len)
    if (eqIdx > endIdx) {
      index = str.lastIndexOf(';', eqIdx - 1) + 1
      continue
    }
    const key = valueSlice(str, index, eqIdx)
    if (obj[key] === void 0) obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx))
    index = endIdx + 1
  } while (index < len)
  return obj
}
/**
 * Serialize data into a cookie header.
 *
 * Serialize a name value pair into a cookie string suitable for
 * http headers. An optional options object specifies cookie parameters.
 *
 * stringifySetCookie({ name: 'foo', value: 'bar', httpOnly: true })
 *   => "foo=bar; HttpOnly"
 */
function stringifySetCookie(cookie, options) {
  const enc = options?.encode ?? defaultEncode
  if (!cookieNameRegExp.test(cookie.name))
    throw new TypeError(`cookie name is invalid: ${cookie.name}`)
  const value = cookie.value == null ? '' : enc(cookie.value)
  if (enc !== defaultEncode && !cookieValueRegExp.test(value))
    throw new TypeError(`cookie value is invalid: ${cookie.value}`)
  let str = cookie.name + '=' + value
  if (cookie.maxAge !== void 0) {
    if (!Number.isSafeInteger(cookie.maxAge))
      throw new TypeError(`cookie maxAge is invalid: ${cookie.maxAge}`)
    str += '; Max-Age=' + cookie.maxAge
  }
  if (cookie.domain) {
    if (!domainValueRegExp.test(cookie.domain))
      throw new TypeError(`cookie domain is invalid: ${cookie.domain}`)
    str += '; Domain=' + cookie.domain
  }
  if (cookie.path) {
    if (!pathValueRegExp.test(cookie.path))
      throw new TypeError(`cookie path is invalid: ${cookie.path}`)
    str += '; Path=' + cookie.path
  }
  if (cookie.expires) {
    const year = cookie.expires.getUTCFullYear()
    if (!(year >= 1601 && year <= 9999))
      throw new TypeError(`cookie expires is invalid: ${cookie.expires}`)
    str += '; Expires=' + cookie.expires.toUTCString()
  }
  if (cookie.httpOnly) str += '; HttpOnly'
  if (cookie.secure) str += '; Secure'
  if (cookie.partitioned) str += '; Partitioned'
  if (cookie.priority)
    switch (typeof cookie.priority === 'string' ? cookie.priority.toLowerCase() : void 0) {
      case 'low':
        str += '; Priority=Low'
        break
      case 'medium':
        str += '; Priority=Medium'
        break
      case 'high':
        str += '; Priority=High'
        break
      default:
        throw new TypeError(`cookie priority is invalid: ${cookie.priority}`)
    }
  if (cookie.sameSite)
    switch (typeof cookie.sameSite === 'string' ? cookie.sameSite.toLowerCase() : cookie.sameSite) {
      case true:
      case 'strict':
        str += '; SameSite=Strict'
        break
      case 'lax':
        str += '; SameSite=Lax'
        break
      case 'none':
        str += '; SameSite=None'
        break
      default:
        throw new TypeError(`cookie sameSite is invalid: ${cookie.sameSite}`)
    }
  return str
}
/**
 * Deserialize a `Set-Cookie` header into an object.
 *
 * parseSetCookie('foo=bar; HttpOnly')
 *   => { name: 'foo', value: 'bar', httpOnly: true }
 */
function parseSetCookie(str, options) {
  const dec = options?.decode ?? defaultDecode
  const len = str.length
  const endIdx = endIndex(str, 0, len)
  let eqIdx = eqIndex(str, 0, len)
  const setCookie =
    eqIdx < endIdx
      ? {
          name: valueSlice(str, 0, eqIdx),
          value: dec(valueSlice(str, eqIdx + 1, endIdx))
        }
      : {
          name: '',
          value: dec(valueSlice(str, 0, endIdx))
        }
  let index = endIdx + 1
  while (index < len) {
    const endIdx = endIndex(str, index, len)
    if (eqIdx < index) eqIdx = eqIndex(str, index, len)
    const attr = eqIdx < endIdx ? valueSlice(str, index, eqIdx) : valueSlice(str, index, endIdx)
    const val = eqIdx < endIdx ? valueSlice(str, eqIdx + 1, endIdx) : void 0
    switch (attr.toLowerCase()) {
      case 'httponly':
        setCookie.httpOnly = true
        break
      case 'secure':
        setCookie.secure = true
        break
      case 'partitioned':
        setCookie.partitioned = true
        break
      case 'domain':
        setCookie.domain = val
        break
      case 'path':
        setCookie.path = val
        break
      case 'max-age':
        if (val && maxAgeRegExp.test(val)) setCookie.maxAge = Number(val)
        break
      case 'expires':
        if (!val) break
        const date = new Date(val)
        if (Number.isFinite(date.valueOf())) setCookie.expires = date
        break
      case 'priority':
        if (!val) break
        const priority = val.toLowerCase()
        if (priority === 'low' || priority === 'medium' || priority === 'high')
          setCookie.priority = priority
        break
      case 'samesite':
        if (!val) break
        const sameSite = val.toLowerCase()
        if (sameSite === 'lax' || sameSite === 'strict' || sameSite === 'none')
          setCookie.sameSite = sameSite
    }
    index = endIdx + 1
  }
  return setCookie
}
/**
 * Find the next `;` character, or return `len`.
 */
function endIndex(str, min, len) {
  const index = str.indexOf(';', min)
  return index === -1 ? len : index
}
/**
 * Find the next `=` character, or return `len`.
 */
function eqIndex(str, min, len) {
  const index = str.indexOf('=', min)
  return index === -1 ? len : index
}
/**
 * Slice out a value between startPod to max.
 */
function valueSlice(str, min, max) {
  if (min === max) return ''
  let start = min
  let end = max
  do {
    const code = str.charCodeAt(start)
    if (code !== 32 && code !== 9) break
  } while (++start < end)
  while (end > start) {
    const code = str.charCodeAt(end - 1)
    if (code !== 32 && code !== 9) break
    end--
  }
  return str.slice(start, end)
}
/**
 * URL-decode string value. Optimized to skip native call when no %.
 */
function defaultDecode(str) {
  if (str.indexOf('%') === -1) return str
  try {
    return decodeURIComponent(str)
  } catch (e) {
    return str
  }
}
/**
 * URL-encode string value. Optimized to skip native call for roundtrip-safe cookie-octet values.
 */
function defaultEncode(str) {
  return cookieOctetInvalidRegExp.test(str) ? encodeURIComponent(str) : str
}
/**
 * Generates a unique key for a cookie based on its domain, path, and name in
 * the format: `<domain>/<path>?<name>`.
 * If domain is undefined, it will be omitted.
 * For example: `/?name`, `example.com/foo?name`.
 *
 * @param {string | undefined} domain
 * @param {string} path
 * @param {string} name
 * @returns {string}
 */
function generate_cookie_key(domain, path, name) {
  return `${domain || ''}${path}?${encodeURIComponent(name)}`
}
/**
 * @param {Request} request
 * @param {URL} url
 */
function get_cookies(request, url) {
  const header = request.headers.get('cookie') ?? ''
  const initial_cookies = parseCookie(header, { decode: (value) => value })
  /** @type {ReturnType<typeof parseCookie> | undefined} */
  let default_cookies
  /**
   * The header never changes during the request, so the default-decode parse is cached
   * @param {import('cookie').ParseOptions} [opts]
   */
  function parse_header(opts) {
    return opts?.decode ? parseCookie(header, opts) : (default_cookies ??= parseCookie(header))
  }
  /** @param {import('./page/types.js').Cookie} cookie */
  function matches_url(cookie) {
    return (
      domain_matches(url.hostname, cookie.options.domain) &&
      path_matches(url.pathname, cookie.options.path)
    )
  }
  /** @type {string | undefined} */
  let normalized_url
  /** @type {Map<string, import('./page/types.js').Cookie>} */
  const new_cookies = /* @__PURE__ */ new Map()
  /** @type {Omit<import('cookie').SetCookie, 'name' | 'value'>} */
  const defaults = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: !(url.hostname === 'localhost' && url.protocol === 'http:')
  }
  /** @type {import('@sveltejs/kit').Cookies} */
  const cookies = {
    get(name, opts) {
      /** @type {import('./page/types.js').Cookie | undefined} */
      let best_match
      for (const c of new_cookies.values())
        if (
          c.name === name &&
          matches_url(c) &&
          (!best_match || c.options.path.length > best_match.options.path.length)
        )
          best_match = c
      if (best_match) return best_match.options.maxAge === 0 ? void 0 : best_match.value
      return parse_header(opts)[name]
    },
    getAll(opts) {
      const cookies = { ...parse_header(opts) }
      const lookup = /* @__PURE__ */ new Map()
      for (const c of new_cookies.values())
        if (matches_url(c)) {
          const existing = lookup.get(c.name)
          if (!existing || c.options.path.length > existing.options.path.length)
            lookup.set(c.name, c)
        }
      for (const c of lookup.values())
        if (c.options.maxAge === 0) delete cookies[c.name]
        else cookies[c.name] = c.value
      return Object.entries(cookies)
        .filter(([, value]) => value != null)
        .map(([name, value]) => ({
          name,
          value
        }))
    },
    set(name, value, options) {
      set_internal(name, value, {
        ...defaults,
        ...options
      })
    },
    delete(name, options) {
      cookies.set(name, '', {
        ...options,
        maxAge: 0
      })
    },
    parse: parseSetCookie,
    serialize(name, value, { encode, ...options } = {}) {
      let path = options.path ?? '/'
      if (!options.domain || options.domain === url.hostname) {
        if (!normalized_url) cookies_serialize_before_route()
        path = resolve(normalized_url, path)
      }
      return stringifySetCookie(
        {
          name,
          value,
          ...defaults,
          ...options,
          path
        },
        { encode }
      )
    }
  }
  /**
   * @param {URL} destination
   * @param {string | null} header
   */
  function get_cookie_header(destination, header) {
    /** @type {Record<string, string>} */
    const combined_cookies = { ...initial_cookies }
    for (const cookie of new_cookies.values()) {
      if (!domain_matches(destination.hostname, cookie.options.domain)) continue
      if (!path_matches(destination.pathname, cookie.options.path)) continue
      const encoder = cookie.options.encode || encodeURIComponent
      combined_cookies[cookie.name] = encoder(cookie.value)
    }
    if (header) {
      const parsed = parseCookie(header, { decode: (value) => value })
      for (const name in parsed) combined_cookies[name] = parsed[name]
    }
    return Object.entries(combined_cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ')
  }
  /** @type {Array<() => void>} */
  const internal_queue = []
  /**
   * @param {string} name
   * @param {string} value
   * @param {import('cookie').SerializeOptions} options
   */
  function set_internal(name, value, options) {
    if (!normalized_url) {
      internal_queue.push(() => set_internal(name, value, options))
      return
    }
    let path = options.path ?? '/'
    if (!options.domain || options.domain === url.hostname) path = resolve(normalized_url, path)
    const cookie_key = generate_cookie_key(options.domain, path, name)
    const cookie = {
      name,
      value,
      options: {
        ...options,
        path
      }
    }
    new_cookies.set(cookie_key, cookie)
  }
  /**
   * @param {import('types').TrailingSlash} trailing_slash
   */
  function set_trailing_slash(trailing_slash) {
    normalized_url = normalize_path(url.pathname, trailing_slash)
    internal_queue.forEach((fn) => fn())
  }
  return {
    cookies,
    new_cookies,
    get_cookie_header,
    set_internal,
    set_trailing_slash
  }
}
/**
 * @param {string} hostname
 * @param {string} [constraint]
 */
function domain_matches(hostname, constraint) {
  if (!constraint) return true
  const normalized = constraint[0] === '.' ? constraint.slice(1) : constraint
  if (hostname === normalized) return true
  return hostname.endsWith('.' + normalized)
}
/**
 * @param {string} path
 * @param {string} [constraint]
 */
function path_matches(path, constraint) {
  if (!constraint) return true
  const normalized = constraint.endsWith('/') ? constraint.slice(0, -1) : constraint
  if (path === normalized) return true
  return path.startsWith(normalized + '/')
}
/**
 * @param {Headers} headers
 * @param {MapIterator<import('./page/types.js').Cookie>} cookies
 */
function add_cookies_to_headers(headers, cookies) {
  for (const new_cookie of cookies) {
    const {
      name,
      value,
      options: { encode, ...options }
    } = new_cookie
    headers.append(
      'set-cookie',
      stringifySetCookie(
        {
          name,
          value,
          ...options
        },
        { encode }
      )
    )
    if (options.path.endsWith('.html')) {
      const path = add_data_suffix(options.path)
      headers.append(
        'set-cookie',
        stringifySetCookie(
          {
            name,
            value,
            ...options,
            path
          },
          { encode }
        )
      )
    }
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/state.js
/** @import { InternalRequestOptions, RequestState } from 'types' */
/** Per-request caches and context flags — never carried into a fork. */
function transient_fields() {
  return {
    remote: {
      data: null,
      explicit: null,
      implicit: null,
      forms: null,
      requested: null,
      ignored: null,
      batches: null,
      live_iterators: null
    },
    is_in_remote_function: false,
    is_in_remote_form_or_command: false,
    is_in_remote_query: false,
    is_in_remote_prerender: false,
    is_in_render: false
  }
}
/**
 * @param {InternalRequestOptions} options
 * @returns {RequestState}
 */
function create_request_state(options) {
  return {
    getClientAddress: options.getClientAddress,
    platform: options.platform,
    read: options.read,
    before_handle: options.before_handle,
    emulator: options.emulator,
    prerendering: options.prerendering,
    prerender_default: void 0,
    error: false,
    depth: 0,
    rerouted_url: null,
    ...transient_fields()
  }
}
/**
 * @param {RequestState} state
 * @returns {RequestState}
 */
function fork_state_for_subrequest(state) {
  return {
    ...state,
    ...transient_fields(),
    depth: state.depth + 1
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/fetch.js
/**
 * @param {{
 *   event: import('@sveltejs/kit').RequestEvent;
 *   state: import('types').RequestState;
 *   get_cookie_header: (url: URL, header: string | null) => string;
 *   set_internal: (name: string, value: string, opts: import('./page/types.js').Cookie['options']) => void;
 * }} opts
 * @returns {typeof fetch}
 */
function create_fetch({ event, state, get_cookie_header, set_internal }) {
  /**
   * @type {typeof fetch}
   */
  const server_fetch = async (info, init) => {
    const original_request = normalize_fetch_input(info, init, event.url)
    let mode = (info instanceof Request ? info.mode : init?.mode) ?? 'cors'
    let credentials =
      (info instanceof Request ? info.credentials : init?.credentials) ?? 'same-origin'
    return hooks.handleFetch({
      event,
      request: original_request,
      fetch: async (info, init) => {
        const request = normalize_fetch_input(info, init, event.url)
        const url = new URL(request.url)
        if (!request.headers.has('origin')) request.headers.set('origin', event.url.origin)
        if (info !== original_request) {
          mode = (info instanceof Request ? info.mode : init?.mode) ?? 'cors'
          credentials =
            (info instanceof Request ? info.credentials : init?.credentials) ?? 'same-origin'
        }
        if (
          (request.method === 'GET' || request.method === 'HEAD') &&
          ((mode === 'no-cors' && url.origin !== event.url.origin) ||
            url.origin === event.url.origin)
        )
          request.headers.delete('origin')
        const decoded = decodeURIComponent(url.pathname)
        if (url.origin !== event.url.origin || '') {
          if (`.${url.hostname}`.endsWith(`.${event.url.hostname}`) && credentials !== 'omit') {
            const cookie = get_cookie_header(url, request.headers.get('cookie'))
            if (cookie) request.headers.set('cookie', cookie)
          }
          return fetch(request)
        }
        const filename = (
          decoded.startsWith(assets) ? decoded.slice(assets.length) : decoded
        ).slice(1)
        const filename_html = `${filename}/index.html`
        const is_asset = manifest.assets.has(filename) || filename in manifest.server_assets
        const is_asset_html =
          manifest.assets.has(filename_html) || filename_html in manifest.server_assets
        if (is_asset || is_asset_html) {
          const file = is_asset ? filename : filename_html
          if (state.read) {
            const type = is_asset
              ? manifest.mime_types[filename.slice(filename.lastIndexOf('.'))]
              : 'text/html'
            return new Response(state.read(file), { headers: type ? { 'content-type': type } : {} })
          } else if (read_implementation && file in manifest.server_assets) {
            const length = manifest.server_assets[file]
            const type = manifest.mime_types[file.slice(file.lastIndexOf('.'))]
            return new Response(read_implementation(file), {
              headers: {
                'Content-Length': '' + length,
                'Content-Type': type
              }
            })
          }
          return await fetch(request, { redirect: 'manual' })
        }
        if (has_prerendered_path(decoded)) return await fetch(request, { redirect: 'manual' })
        if (credentials !== 'omit') {
          const cookie = get_cookie_header(url, request.headers.get('cookie'))
          if (cookie) request.headers.set('cookie', cookie)
          const authorization = event.request.headers.get('authorization')
          if (authorization && !request.headers.has('authorization'))
            request.headers.set('authorization', authorization)
        }
        if (!request.headers.has('accept')) request.headers.set('accept', '*/*')
        const accept_language = event.request.headers.get('accept-language')
        if (accept_language && !request.headers.has('accept-language'))
          request.headers.set('accept-language', accept_language)
        const response = await internal_fetch(request, state)
        for (const str of response.headers.getSetCookie()) {
          const { name, value, ...cookie_options } = parseSetCookie(str, { decode: (v) => v })
          set_internal(name, value, {
            path: cookie_options.path ?? (url.pathname.split('/').slice(0, -1).join('/') || '/'),
            encode: (value) => value,
            ...cookie_options
          })
        }
        return response
      }
    })
  }
  return (input, init) => {
    const response = server_fetch(input, init)
    response.catch(noop)
    return response
  }
}
/**
 * @param {RequestInfo | URL} info
 * @param {RequestInit | undefined} init
 * @param {URL} url
 */
function normalize_fetch_input(info, init, url) {
  if (info instanceof Request) return info
  return new Request(typeof info === 'string' ? new URL(info, url) : info, init)
}
/**
 * @param {Request} request
 * @param {import('types').RequestState} state
 * @returns {Promise<Response>}
 */
async function internal_fetch(request, state) {
  if (request.signal?.aborted) throw new DOMException('The operation was aborted.', 'AbortError')
  const subrequest_state = fork_state_for_subrequest(state)
  if (!request.signal) return await respond$1(request, subrequest_state)
  let remove_abort_listener = noop
  /** @type {Promise<never>} */
  const abort_promise = new Promise((_, reject) => {
    const on_abort = () => {
      reject(new DOMException('The operation was aborted.', 'AbortError'))
    }
    request.signal.addEventListener('abort', on_abort, { once: true })
    remove_abort_listener = () => request.signal.removeEventListener('abort', on_abort)
  })
  return Promise.race([respond$1(request, subrequest_state), abort_promise]).finally(
    remove_abort_listener
  )
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/env_module.js
/** @type {string} */
var payload
/** @type {string} */
var etag
/** @type {Headers} */
var headers
/**
 * @param {Request} request
 * @returns {Response}
 */
function get_public_env(request) {
  payload ??= uneval$1(rendered_env)
  etag ??= `W/${Date.now()}`
  headers ??= new Headers({
    'content-type': 'application/javascript; charset=utf-8',
    etag
  })
  if (request.headers.get('if-none-match') === etag)
    return new Response(void 0, {
      status: 304,
      headers
    })
  return new Response(`export const env=${payload}`, { headers })
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/respond.js
/** @import { SSRNode } from 'types' */
/** @type {import('types').RequiredResolveOptions['transformPageChunk']} */
var default_transform = ({ html }) => html
/** @type {import('types').RequiredResolveOptions['filterSerializedResponseHeaders']} */
var default_filter = () => false
/** @type {import('types').RequiredResolveOptions['preload']} */
var default_preload = ({ type }) => type === 'js' || type === 'css'
var non_html_fetch_destinations = /* @__PURE__ */ new Set([
  'audio',
  'audioworklet',
  'font',
  'image',
  'json',
  'manifest',
  'paintworklet',
  'report',
  'script',
  'serviceworker',
  'sharedworker',
  'style',
  'track',
  'video',
  'webidentity',
  'worker',
  'xslt'
])
var page_methods = /* @__PURE__ */ new Set(['GET', 'HEAD', 'POST'])
var allowed_page_methods = /* @__PURE__ */ new Set(['GET', 'HEAD', 'OPTIONS'])
var respond$1 = propagate_context(internal_respond)
/**
 * @param {Request} request
 * @param {import('types').RequestState} state
 * @returns {Promise<Response>}
 */
async function internal_respond(request, state) {
  /** URL but stripped from the potential `/__data.json` suffix and its search param  */
  const url = new URL(request.url)
  const is_route_resolution_request = has_resolution_suffix(url.pathname)
  const is_data_request = has_data_suffix(url.pathname)
  const remote_id = get_remote_id(url)
  {
    const request_origin = request.headers.get('origin')
    const self_origin = get_self_origin(void 0, url.origin)
    if (remote_id) {
      if (
        is_remote_forbidden({
          request,
          request_origin,
          self_origin
        })
      )
        return Response.json(
          { message: 'Cross-site remote requests are forbidden' },
          { status: 403 }
        )
    } else if (
      is_csrf_forbidden({
        request,
        request_origin,
        self_origin,
        trusted_origins: options.csrf_trusted_origins
      })
    ) {
      const message = `Cross-site ${request.method} form submissions are forbidden`
      const opts = { status: 403 }
      if (request.headers.get('accept') === 'application/json')
        return Response.json({ message }, opts)
      return text(message, opts)
    }
  }
  /** @type {boolean[] | undefined} */
  let invalidated_data_nodes
  let skip_route_resolution = false
  /** Whether this is a `/${app_dir}/routes/<route_id>/__route.js` request, used by `preloadCode` */
  let is_route_id_resolution_request = false
  if (is_route_resolution_request) {
    /**
     * If the request is for a route resolution, first modify the URL, then continue as normal
     * for path resolution, then return the route object as a JS file.
     */
    url.pathname = strip_resolution_suffix(url.pathname)
    is_route_id_resolution_request = is_route_id_resolution_path(url.pathname)
  } else if (is_data_request) {
    url.pathname =
      strip_data_suffix(url.pathname) +
        (url.searchParams.get('x-sveltekit-trailing-slash') === '1' ? '/' : '') || '/'
    url.searchParams.delete(TRAILING_SLASH_PARAM)
    invalidated_data_nodes = url.searchParams
      .get(INVALIDATED_PARAM)
      ?.split('')
      .map((node) => node === '1')
    url.searchParams.delete(INVALIDATED_PARAM)
  } else if (remote_id) {
    const pathname = request.headers.get('x-sveltekit-pathname')
    if (pathname === null) skip_route_resolution = true
    else {
      url.pathname = pathname
      url.search = request.headers.get('x-sveltekit-search') ?? ''
    }
  }
  for (const key of url.searchParams.keys())
    if (key.startsWith('x-sveltekit-'))
      return text(`Cannot use reserved query parameter "${key}"`, { status: 400 })
  /** @type {Record<string, string>} */
  const headers = {}
  const { cookies, new_cookies, get_cookie_header, set_internal, set_trailing_slash } = get_cookies(
    request,
    url
  )
  /** @type {import('@sveltejs/kit').RequestEvent} */
  const event = {
    cookies,
    fetch: null,
    getClientAddress:
      state.getClientAddress ||
      (() => {
        client_address_unsupported({ adapter: '@sveltejs/adapter-vercel' })
      }),
    locals: {},
    params: {},
    platform: state.emulator?.platform
      ? await state.emulator.platform({
          config: {},
          prerender: !!state.prerendering?.fallback
        })
      : state.platform,
    request,
    route: { id: null },
    setHeaders: (new_headers) => {
      for (const key in new_headers) {
        const lower = key.toLowerCase()
        const value = new_headers[key]
        if (lower === 'set-cookie') set_headers_cookie()
        else if (lower in headers) {
          if (lower === 'server-timing') headers[lower] += ', ' + value
          else header_already_set({ name: key })
        } else {
          headers[lower] = value
          if (state.prerendering && lower === 'cache-control') state.prerendering.cache = value
        }
      }
    },
    url,
    isDataRequest: is_data_request,
    isSubRequest: state.depth > 0,
    isRemoteRequest: !!remote_id
  }
  event.fetch = create_fetch({
    event,
    state,
    get_cookie_header,
    set_internal
  })
  /** @type {string | null} */
  let resolved_path = url.pathname
  if (!remote_id && !is_route_id_resolution_request) {
    const prerendering_reroute_state = state.prerendering?.inside_reroute
    try {
      if (state.prerendering) state.prerendering.inside_reroute = true
      resolved_path =
        (await hooks.reroute({
          url: new URL(url),
          fetch: event.fetch
        })) ?? url.pathname
      if (!manifest.routes.length && resolved_path !== url.pathname)
        state.rerouted_url = denormalise_url({
          request_url: request.url,
          resolved_path,
          is_data_request,
          is_route_resolution_request
        }).toString()
    } catch {
      return text('Internal Server Error', { status: 500 })
    } finally {
      if (state.prerendering) state.prerendering.inside_reroute = prerendering_reroute_state
    }
  }
  /** @type {import('types').RequiredResolveOptions} */
  let resolve_opts = {
    transformPageChunk: default_transform,
    filterSerializedResponseHeaders: default_filter,
    preload: default_preload
  }
  /** @type {import('types').TrailingSlash} */
  let trailing_slash = 'never'
  /** @type {PageNodes | undefined} */
  let page_nodes
  /** @type {string} */
  let decoded_pathname
  try {
    resolved_path = decode_pathname(resolved_path)
    decoded_pathname = decode_pathname(url.pathname)
  } catch {
    resolved_path = null
    return await handle()
  }
  if (
    resolved_path !== decoded_pathname &&
    !state.prerendering?.fallback &&
    has_prerendered_path(resolved_path)
  ) {
    const url = denormalise_url({
      request_url: request.url,
      resolved_path,
      is_data_request,
      is_route_resolution_request
    })
    try {
      const response = await fetch(new Request(url, request), { redirect: 'manual' })
      const headers = new Headers(response.headers)
      if (headers.has('content-encoding')) {
        headers.delete('content-encoding')
        headers.delete('content-length')
      }
      return new Response(response.body, {
        headers,
        status: response.status,
        statusText: response.statusText
      })
    } catch (error) {
      return await handle_fatal_error(event, state, error)
    }
  }
  /** @type {import('types').SSRRoute | null} */
  let route = null
  if (is_route_resolution_request) {
    if (is_route_id_resolution_request)
      return resolve_route_by_id(extract_route_id(resolved_path), new URL(request.url))
    return resolve_route(resolved_path, new URL(request.url))
  }
  if (resolved_path === `/_app/env.js`) return get_public_env(request)
  if (!remote_id && resolved_path.startsWith(`/_app`)) {
    const headers = new Headers()
    headers.set('cache-control', 'public, max-age=0, must-revalidate')
    return text('Not found', {
      status: 404,
      headers
    })
  }
  if (!state.prerendering?.fallback && !skip_route_resolution)
    try {
      const matchers = await manifest.matchers()
      const result = find_route(resolved_path, manifest.routes, matchers)
      if (result) {
        route = result.route
        event.route = { id: route.id }
        event.params = result.params
      }
    } catch (e) {
      return await handle_fatal_error(event, state, e)
    }
  try {
    page_nodes = route?.page ? new PageNodes(await load_page_nodes(route.page)) : void 0
    if (route && !remote_id) {
      if (url.pathname === '' || url.pathname === '/') trailing_slash = 'always'
      else if (page_nodes) trailing_slash = page_nodes.trailing_slash()
      else if (route.endpoint) trailing_slash = (await route.endpoint()).trailingSlash ?? 'never'
      if (!is_data_request) {
        const normalized = normalize_path(url.pathname, trailing_slash)
        if (normalized !== url.pathname && !state.prerendering?.fallback)
          return new Response(void 0, {
            status: 308,
            headers: {
              'x-sveltekit-normalize': '1',
              location:
                relative_pathname(url.pathname, normalized) + (url.search === '?' ? '' : url.search)
            }
          })
      }
      if (state.before_handle || state.emulator?.platform) {
        let config = {}
        /** @type {import('types').PrerenderOption} */
        let prerender = false
        if (route.endpoint) {
          const node = await route.endpoint()
          config = node.config ?? config
          prerender = node.prerender ?? prerender
        } else if (page_nodes) {
          config = page_nodes.get_config() ?? config
          prerender = state.prerender_default = page_nodes.prerender()
        }
        if (state.emulator?.platform)
          event.platform = await state.emulator.platform({
            config,
            prerender
          })
        if (state.before_handle) return await state.before_handle(event, config, prerender, handle)
      }
    }
    return await handle()
  } catch (e) {
    if (e instanceof Redirect)
      try {
        const response =
          is_data_request || remote_id
            ? redirect_json_response(e)
            : route?.page && is_action_json_request(event)
              ? action_json_redirect(e)
              : redirect_response(e.status, e.location)
        add_cookies_to_headers(response.headers, new_cookies.values())
        return response
      } catch (err) {
        return await handle_fatal_error(event, state, err)
      }
    return await handle_fatal_error(event, state, e)
  }
  async function handle() {
    set_trailing_slash(trailing_slash)
    if (state.prerendering && !state.prerendering.fallback && !state.prerendering.inside_reroute)
      disable_search(url)
    const response = await record_span({
      name: 'sveltekit.handle.root',
      attributes: {
        'http.route': event.route.id || 'unknown',
        'http.method': event.request.method,
        'http.url': event.url.href,
        'sveltekit.is_data_request': is_data_request,
        'sveltekit.is_sub_request': event.isSubRequest
      },
      fn: async (root_span) => {
        const traced_event = {
          ...event,
          tracing: {
            enabled: false,
            root: root_span,
            current: root_span
          }
        }
        return await with_request_store(
          {
            event: traced_event,
            state
          },
          () =>
            hooks.handle({
              event: traced_event,
              resolve: (event, opts) => {
                return record_span({
                  name: 'sveltekit.resolve',
                  attributes: { 'http.route': event.route.id || 'unknown' },
                  fn: (resolve_span) => {
                    return with_request_store(null, () =>
                      resolve(merge_tracing(event, resolve_span), page_nodes, opts).then(
                        (response) => {
                          for (const key in headers) {
                            const value = headers[key]
                            response.headers.set(key, value)
                          }
                          add_cookies_to_headers(response.headers, new_cookies.values())
                          if (state.prerendering && event.route.id !== null)
                            response.headers.set('x-sveltekit-routeid', encodeURI(event.route.id))
                          resolve_span.setAttributes({
                            'http.response.status_code': response.status,
                            'http.response.body.size':
                              response.headers.get('content-length') || 'unknown'
                          })
                          return response
                        }
                      )
                    )
                  }
                })
              }
            })
        )
      }
    })
    if (response.status === 200 && response.headers.has('etag')) {
      let if_none_match_value = request.headers.get('if-none-match')
      if (if_none_match_value?.startsWith('W/"'))
        if_none_match_value = if_none_match_value.substring(2)
      const etag = response.headers.get('etag')
      if (if_none_match_value === etag) {
        const headers = new Headers({ etag })
        for (const key of ['cache-control', 'content-location', 'date', 'expires', 'vary']) {
          const value = response.headers.get(key)
          if (value) headers.set(key, value)
        }
        for (const cookie of response.headers.getSetCookie()) headers.append('set-cookie', cookie)
        return new Response(void 0, {
          status: 304,
          headers
        })
      }
    }
    if (is_data_request && response.status >= 300 && response.status <= 308) {
      const location = response.headers.get('location')
      if (location) return redirect_json_response(new Redirect(response.status, location))
    }
    return response
  }
  /**
   * @param {import('@sveltejs/kit').RequestEvent} event
   * @param {PageNodes | undefined} page_nodes
   * @param {import('@sveltejs/kit/hooks').ResolveOptions} [opts]
   */
  async function resolve(event, page_nodes, opts) {
    try {
      if (opts)
        resolve_opts = {
          transformPageChunk: opts.transformPageChunk || default_transform,
          filterSerializedResponseHeaders: opts.filterSerializedResponseHeaders || default_filter,
          preload: opts.preload || default_preload
        }
      if (resolved_path === null)
        return await respond_with_error({
          event,
          state,
          error: new SvelteKitError(
            400,
            'Malformed URI',
            `Failed to decode URI: ${event.url.pathname}`
          ),
          resolve_opts
        })
      if (state.prerendering?.fallback)
        return await render_response({
          event,
          state,
          page_config: {
            ssr: false,
            csr: true
          },
          status: 200,
          error: null,
          branch: [
            {
              node: await manifest.nodes[0](),
              data: null,
              server_data: null
            }
          ],
          fetched: [],
          resolve_opts,
          data_serializer: server_data_serializer(event, state)
        })
      if (remote_id) return await handle_remote_call(event, state, remote_id)
      if (route) {
        const method = event.request.method
        /** @type {Response} */
        let response
        if (is_data_request)
          response = await render_data(event, state, route, invalidated_data_nodes, trailing_slash)
        else {
          let endpoint
          if (
            route.endpoint &&
            (!route.page || (!state.prerendering && is_endpoint_request(event)))
          ) {
            endpoint = await route.endpoint()
            if (route.page && (method === 'GET' || method === 'HEAD' || method === 'POST')) {
              if (
                !(method === 'POST'
                  ? !!(endpoint.POST || endpoint.fallback)
                  : !!(endpoint.GET || endpoint.fallback || (method === 'HEAD' && endpoint.HEAD)))
              )
                endpoint = void 0
            }
          }
          if (endpoint) response = await render_endpoint(event, state, endpoint)
          else if (route.page) {
            if (!page_nodes) throw new Error('page_nodes not found. This should never happen')
            else if (page_methods.has(method))
              response = await render_page(event, state, route.page, page_nodes, resolve_opts)
            else {
              const allowed_methods = new Set(allowed_page_methods)
              if ((await manifest.nodes[route.page.leaf]())?.server?.actions)
                allowed_methods.add('POST')
              if (method === 'OPTIONS')
                response = new Response(null, {
                  status: 204,
                  headers: { allow: [...allowed_methods].join(', ') }
                })
              else {
                const mod = Object.fromEntries([...allowed_methods].map((m) => [m, true]))
                response = method_not_allowed(mod, method)
              }
            }
          } else throw new Error('Route is neither page nor endpoint. This should never happen')
        }
        if (
          (request.method === 'GET' || request.method === 'HEAD') &&
          route.page &&
          route.endpoint
        ) {
          const vary = response.headers
            .get('vary')
            ?.split(',')
            ?.map((v) => v.trim().toLowerCase())
          if (!(vary?.includes('accept') || vary?.includes('*'))) {
            response = new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: new Headers(response.headers)
            })
            response.headers.append('Vary', 'Accept')
          }
        }
        return response
      }
      if (state.error && event.isSubRequest) {
        const headers = new Headers(request.headers)
        headers.set('x-sveltekit-error', 'true')
        return await fetch(request, {
          headers,
          redirect: 'manual'
        })
      }
      if (state.error) return text('Internal Server Error', { status: 500 })
      if (state.depth === 0) {
        if (
          !state.prerendering &&
          is_data_request &&
          invalidated_data_nodes?.length === 1 &&
          invalidated_data_nodes[0]
        )
          return await render_data(
            event,
            state,
            {
              page: {
                layouts: [],
                leaf: 0
              }
            },
            invalidated_data_nodes,
            'ignore'
          )
        if (non_html_fetch_destinations.has(event.request.headers.get('sec-fetch-dest') ?? ''))
          return text('Not Found', {
            status: 404,
            headers: { vary: 'Sec-Fetch-Dest' }
          })
        return await respond_with_error({
          event,
          state,
          error: new SvelteKitError(404, 'Not Found', `Not found: ${event.url.pathname}`),
          resolve_opts
        })
      }
      if (state.prerendering) return text('not found', { status: 404 })
      const response = await fetch(request, { redirect: 'manual' })
      return new Response(response.body, response)
    } catch (e) {
      return await handle_fatal_error(event, state, e)
    } finally {
      event.cookies.set = () => {
        cookies_set_after_response()
      }
      event.setHeaders = () => {
        set_headers_after_response()
      }
    }
  }
}
/**
 * @param {import('types').PageNodeIndexes} page
 */
function load_page_nodes(page) {
  return Promise.all([
    ...page.layouts.map((n) => (n == void 0 ? n : manifest.nodes[n]())),
    manifest.nodes[page.leaf]()
  ])
}
/**
 * It's likely that, in a distributed system, there are spans starting outside the SvelteKit server -- eg.
 * started on the frontend client, or in a service that calls the SvelteKit server. There are standardized
 * ways to represent this context in HTTP headers, so we can extract that context and run our tracing inside of it
 * so that when our traces are exported, they are associated with the correct parent context.
 * @param {typeof internal_respond} fn
 * @returns {typeof internal_respond}
 */
function propagate_context(fn) {
  return async (req, ...rest) => {
    if (otel === null) return fn(req, ...rest)
    const { propagation, context } = await otel
    const c = propagation.extract(context.active(), Object.fromEntries(req.headers))
    return context.with(c, async () => {
      return await fn(req, ...rest)
    })
  }
}
/**
 * @param {object} opts
 * @param {string} opts.request_url - The original request URL
 * @param {string} opts.resolved_path - The resolved pathname
 * @param {boolean} opts.is_data_request - Whether the request is a data request
 * @param {boolean} opts.is_route_resolution_request -
 * @returns {URL}
 */
function denormalise_url({
  request_url,
  resolved_path,
  is_data_request,
  is_route_resolution_request
}) {
  const url = new URL(request_url)
  url.pathname = is_data_request
    ? add_data_suffix(resolved_path)
    : is_route_resolution_request
      ? add_resolution_suffix(resolved_path)
      : resolved_path
  return url
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/server/instance.js
/** @type {Promise<any>} */
var init_promise
/**
 * Loads the user's hooks, once, however many times an adapter calls it
 */
async function init() {
  await (init_promise ??= (async () => {
    try {
      const module = await get_hooks()
      set_hooks({
        handle: module.handle || (({ event, resolve }) => resolve(event)),
        handleError: module.handleError || default_handle_error,
        handleFetch: module.handleFetch || (({ request, fetch }) => fetch(request)),
        reroute: module.reroute || noop
      })
      init_transport(module.transport ?? {})
      if (module.init) await module.init()
    } catch (e) {
      throw e
    }
  })())
}
/**
 * @param {Request} request
 * @param {import('types').InternalRequestOptions} options
 */
async function respond_to(request, options) {
  const request_state = create_request_state(options)
  const response = await respond$1(request, request_state)
  if (request_state.rerouted_url)
    response.headers.set(REROUTED_URL_HEADER, request_state.rerouted_url)
  if (request.method === 'HEAD' && response.body !== null) {
    response.body.cancel().catch(noop)
    return new Response(null, response)
  }
  return response
}
/**
 * AsyncLocalStorage does not work in webcontainers, so there `sync_store` is never reset
 * (see `src/exports/internal/server/event.js`) and requests are handled one at a time
 * @param {typeof respond_to} fn
 */
function serialise(fn) {
  /** @type {Promise<void> | null} */
  let current = null
  /** @type {typeof respond_to} */
  return async (...args) => {
    const { promise, resolve } = Promise.withResolvers()
    const previous = current
    current = promise
    await previous
    return fn(...args).finally(resolve)
  }
}
var respond = IN_WEBCONTAINER ? serialise(respond_to) : respond_to
export { init, respond, set_env }

//# sourceMappingURL=instance.js.map
