import {
  A as remote_cookie_forbidden,
  B as remote_requested_context,
  D as remote_command_method,
  F as remote_query_live_no_value,
  H as remote_requested_invalid_query,
  I as remote_query_live_not_iterable,
  L as remote_query_prerender,
  N as remote_headers_forbidden,
  O as remote_command_readonly,
  P as remote_invalid_validator,
  R as remote_request_property,
  U as remote_requested_wrong_method,
  V as remote_requested_invalid_limit,
  W as server_api_unavailable,
  j as remote_cookie_path_relative,
  k as remote_command_render,
  z as remote_requested_async_validator
} from './chunks/server-errors.js'
import {
  $ as create_remote_key,
  Gt as app_dir,
  N as MUTATIVE_METHODS,
  R as handle_error_and_jsonify,
  Yt as prerendering,
  _t as normalize_issue,
  ct as parse,
  gt as group_formdata,
  ht as flatten_issues,
  lt as stringify,
  mt as deep_set,
  nt as stringify_remote_arg,
  pt as create_field_proxy,
  tt as parse_remote_arg,
  vt as parse_form_key,
  xt as noop,
  yt as split_path
} from './chunks/internal.js'
import { error } from '@sveltejs/kit'
import { HandledHttpError, ValidationError } from '@sveltejs/kit/internal'
import { get_request_store, with_request_store } from '@sveltejs/kit/internal/server'
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/app/server/remote/shared.js
/** @import { RequestEvent } from '@sveltejs/kit' */
/** @import { MaybePromise, RequestState, RemoteInternals, RequestStore, RemoteLiveQueryUserFunctionReturnType } from 'types' */
/**
 * @param {any} validate_or_fn
 * @param {((arg?: any) => any) | undefined} [maybe_fn]
 * @param {(() => import('types').BaseRemoteInternals | undefined) | undefined} [get_internals]
 * @returns {(arg?: any) => MaybePromise<any>}
 */
function create_validator(validate_or_fn, maybe_fn, get_internals) {
  if (!maybe_fn)
    return (arg) => {
      if (arg !== void 0) error(400, 'Bad Request')
    }
  if (validate_or_fn === 'unchecked') return (arg) => arg
  if ('~standard' in validate_or_fn)
    return async (arg) => {
      const result = await validate_or_fn['~standard'].validate(arg)
      if (result.issues) {
        const internals = get_internals?.()
        throw new ValidationError(
          result.issues,
          internals?.name
            ? {
                name: internals.name,
                file: internals.file
              }
            : void 0
        )
      }
      return result.value
    }
  remote_invalid_validator()
}
/**
 * In case of a single remote function call, just returns the result.
 *
 * In case of a full page reload, returns the response for a remote function call,
 * either from the cache or by invoking the function.
 * Also saves an uneval'ed version of the result for later HTML inlining for hydration.
 *
 * @template {MaybePromise<any>} T
 * @param {RemoteInternals} internals
 * @param {string} payload — the stringified raw argument (i.e. the cache key the client will use)
 * @param {RequestState} state
 * @param {() => Promise<T>} get_result
 * @returns {Promise<T>}
 */
async function get_response(internals, payload, state, get_result) {
  await 0
  const cache = get_cache(internals, state)
  if (!state.is_in_remote_query) get_implicit_lookup(internals, state)[payload] = get_result
  return (cache[payload] ??= get_result())
}
/**
 * @param {RequestEvent} event
 * @param {RequestState} state
 * @param {boolean} allow_cookies
 * @returns {RequestStore}
 */
function derive_remote_function_event(event, state, allow_cookies) {
  /** @type {RequestEvent} */
  const derived = {
    ...event,
    setHeaders: () => {
      remote_headers_forbidden()
    },
    cookies: {
      ...event.cookies,
      set: (name, value, opts) => {
        if (!allow_cookies) remote_cookie_forbidden({ operation: 'set' })
        if (opts?.path && !opts.path.startsWith('/'))
          remote_cookie_path_relative({ operation: 'set' })
        return event.cookies.set(name, value, opts)
      },
      delete: (name, opts) => {
        if (!allow_cookies) remote_cookie_forbidden({ operation: 'delete' })
        if (opts?.path && !opts.path.startsWith('/'))
          remote_cookie_path_relative({ operation: 'deleted' })
        return event.cookies.delete(name, opts)
      }
    }
  }
  if (state.is_in_remote_query)
    for (const property of ['url', 'params', 'route'])
      Object.defineProperty(derived, property, {
        enumerable: false,
        get() {
          return remote_request_property({ property })
        }
      })
  return {
    event: derived,
    state: {
      ...state,
      is_in_remote_function: true
    }
  }
}
/**
 * Like `with_event` but removes things from `event` you cannot see/call in remote functions, such as `setHeaders`.
 * @template T
 * @param {RequestEvent} event
 * @param {RequestState} state
 * @param {boolean} allow_cookies
 * @param {() => any} get_input
 * @param {(arg?: any) => T} fn
 */
async function run_remote_function(event, state, allow_cookies, get_input, fn) {
  const store = derive_remote_function_event(event, state, allow_cookies)
  const input = await with_request_store(store, get_input)
  return with_request_store(store, () => fn(input))
}
/**
 * Like `with_event` but removes things from `event` you cannot see/call in remote functions, such as `setHeaders`.
 * @template T
 * @param {RequestEvent} event
 * @param {RequestState} state
 * @param {boolean} allow_cookies
 * @param {() => any} get_input
 * @param {(arg?: any) => RemoteLiveQueryUserFunctionReturnType<T>} fn
 * @param {string} name
 */
async function* run_remote_generator(event, state, allow_cookies, get_input, fn, name) {
  const store = derive_remote_function_event(event, state, allow_cookies)
  const input = await with_request_store(store, get_input)
  const iterator = to_iterator(await with_request_store(store, () => fn(input)), name)
  let done = false
  try {
    while (true) {
      const result = await with_request_store(store, () => iterator.next())
      if (result.done) {
        done = true
        return result.value
      }
      yield result.value
    }
  } finally {
    if (!done && typeof iterator.return === 'function')
      await with_request_store(store, () => iterator.return?.(void 0))
  }
}
/**
 * @template T
 * @param {Awaited<RemoteLiveQueryUserFunctionReturnType<T>>} source
 * @param {string} name
 * @returns {Iterator<T> | AsyncIterator<T>}
 */
function to_iterator(source, name) {
  if ('next' in source && typeof source.next === 'function') return source
  if (Symbol.asyncIterator in source && typeof source[Symbol.asyncIterator] === 'function')
    return source[Symbol.asyncIterator]()
  if (Symbol.iterator in source && typeof source[Symbol.iterator] === 'function')
    return source[Symbol.iterator]()
  remote_query_live_not_iterable({ name })
}
/**
 * Note that `state` is deliberately not optional: resources that capture the request
 * state at creation must pass it explicitly, because reading it from the request store
 * at call time is only equivalent on runtimes with `AsyncLocalStorage` support.
 * Callers without a captured state (such as the module-level `form` instance getters)
 * should pass `get_request_store().state` themselves.
 * @param {RemoteInternals} internals
 * @param {RequestState} state
 */
function get_cache(internals, state) {
  let cache = state.remote.data?.get(internals)
  if (cache === void 0) {
    cache = {}
    ;(state.remote.data ??= /* @__PURE__ */ new Map()).set(internals, cache)
  }
  return cache
}
/**
 * @param {RemoteInternals} internals
 * @param {RequestState} state
 */
function get_implicit_lookup(internals, state) {
  let cache = state.remote.implicit?.get(internals)
  if (cache === void 0) {
    cache = {}
    ;(state.remote.implicit ??= /* @__PURE__ */ new Map()).set(internals, cache)
  }
  return cache
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/app/server/remote/command.js
/** @import { RemoteCommand } from '$app/server' */
/** @import { MaybePromise, RemoteCommandInternals } from 'types' */
/** @import { StandardSchemaV1 } from '@standard-schema/spec' */
/**
 * Creates a remote command. When called from the browser, the function will be invoked on the server via a `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#command) for full documentation.
 *
 * @template Output
 * @overload
 * @param {() => MaybePromise<Output>} fn
 * @returns {RemoteCommand<void, Output>}
 * @since 2.27
 */
/**
 * Creates a remote command. When called from the browser, the function will be invoked on the server via a `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#command) for full documentation.
 *
 * @template Input
 * @template Output
 * @overload
 * @param {'unchecked'} validate
 * @param {(arg: Input) => MaybePromise<Output>} fn
 * @returns {RemoteCommand<Input, Output>}
 * @since 2.27
 */
/**
 * Creates a remote command. When called from the browser, the function will be invoked on the server via a `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#command) for full documentation.
 *
 * @template {StandardSchemaV1} Schema
 * @template Output
 * @overload
 * @param {Schema} validate
 * @param {(arg: StandardSchemaV1.InferOutput<Schema>) => MaybePromise<Output>} fn
 * @returns {RemoteCommand<StandardSchemaV1.InferInput<Schema>, Output>}
 * @since 2.27
 */
/**
 * @template Input
 * @template Output
 * @param {any} validate_or_fn
 * @param {(arg?: Input) => MaybePromise<Output>} [maybe_fn]
 * @returns {RemoteCommand<Input, Output>}
 * @since 2.27
 */
/*@__NO_SIDE_EFFECTS__*/
function command(validate_or_fn, maybe_fn) {
  /** @type {(arg?: Input) => MaybePromise<Output>} */
  const fn = maybe_fn ?? validate_or_fn
  /** @type {RemoteCommandInternals} */
  const __ = {
    type: 'command',
    id: '',
    name: ''
  }
  /** @type {(arg?: any) => MaybePromise<Input>} */
  const validate = create_validator(validate_or_fn, maybe_fn, () => __)
  /** @type {RemoteCommand<Input, Output> & { __: RemoteCommandInternals }} */
  const wrapper = (arg) => {
    const { event, state } = get_request_store()
    if (
      !MUTATIVE_METHODS.includes(event.request.method) ||
      state.is_in_remote_query ||
      state.is_in_remote_prerender
    ) {
      if (state.is_in_remote_query || state.is_in_remote_prerender)
        remote_command_readonly({ name: __.name })
      remote_command_method({
        name: __.name,
        method: event.request.method
      })
    }
    if (state.is_in_render) remote_command_render({ name: __.name })
    const promise = Promise.resolve(
      run_remote_function(event, state, true, () => validate(arg), fn)
    )
    promise.updates = () => {
      server_api_unavailable({ name: `${__.name}(...).updates(...)` })
    }
    return promise
  }
  Object.defineProperty(wrapper, '__', { value: __ })
  Object.defineProperty(wrapper, 'pending', { get: () => 0 })
  return wrapper
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/app/server/remote/form.js
/** @import { RemoteFormInput, RemoteForm, RemoteFormInvalidField } from '$app/server' */
/** @import { InternalRemoteFormIssue, MaybePromise, HasNonOptionalBoolean, RemoteFormInternals } from 'types' */
/** @import { StandardSchemaV1 } from '@standard-schema/spec' */
/**
 * Creates a form object that can be spread onto a `<form>` element.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#form) for full documentation.
 *
 * @template Output
 * @overload
 * @param {() => MaybePromise<Output>} fn
 * @returns {RemoteForm<void, Output>}
 * @since 2.27
 */
/**
 * Creates a form object that can be spread onto a `<form>` element.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#form) for full documentation.
 *
 * @template {RemoteFormInput} Input
 * @template Output
 * @overload
 * @param {'unchecked'} validate
 * @param {(data: Input, issue: RemoteFormInvalidField<Input>) => MaybePromise<Output>} fn
 * @returns {RemoteForm<Input, Output>}
 * @since 2.27
 */
/**
 * Creates a form object that can be spread onto a `<form>` element.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#form) for full documentation.
 *
 * @template {StandardSchemaV1<RemoteFormInput, Record<string, any>>} Schema
 * @template Output
 * @overload
 * @param {true extends HasNonOptionalBoolean<StandardSchemaV1.InferInput<Schema>> ? 'Error: All booleans in form schemas must be optional (e.g. `v.optional(v.boolean(), false)`) because checkbox inputs do not send a false value when unchecked.' : Schema} validate
 * @param {(data: StandardSchemaV1.InferOutput<Schema>, issue: RemoteFormInvalidField<StandardSchemaV1.InferInput<Schema>>) => MaybePromise<Output>} fn
 * @returns {RemoteForm<StandardSchemaV1.InferInput<Schema>, Output>}
 * @since 2.27
 */
/**
 * @template {RemoteFormInput} Input
 * @template Output
 * @param {any} validate_or_fn
 * @param {(data_or_issue: any, issue?: any) => MaybePromise<Output>} [maybe_fn]
 * @returns {RemoteForm<Input, Output>}
 * @since 2.27
 */
/*@__NO_SIDE_EFFECTS__*/
function form(validate_or_fn, maybe_fn) {
  /** @type {any} */
  const fn = maybe_fn ?? validate_or_fn
  /** @type {StandardSchemaV1 | null} */
  const schema = !maybe_fn || validate_or_fn === 'unchecked' ? null : validate_or_fn
  /**
   * @param {string | number | boolean} [key]
   */
  function create_instance(key) {
    const instance = {}
    instance.method = 'POST'
    Object.defineProperty(instance, 'enhance', {
      value: () => {
        return {
          action: instance.action,
          method: instance.method
        }
      }
    })
    /** @type {RemoteFormInternals} */
    const __ = {
      type: 'form',
      name: '',
      id: '',
      fn: async (data, meta, form_data) => {
        const output = {}
        output.submission = true
        const { event, state } = get_request_store()
        const validated = await schema?.['~standard'].validate(data)
        if (meta.validate_only)
          return validated?.issues?.map((issue) => normalize_issue(issue, true)) ?? []
        if (validated?.issues !== void 0) handle_issues(output, validated.issues, form_data, __.id)
        else {
          if (validated !== void 0) data = validated.value
          const issue = create_issues()
          try {
            output.result = await run_remote_function(
              event,
              state,
              true,
              () => data,
              (data) => (!maybe_fn ? fn() : fn(data, issue))
            )
          } catch (error) {
            if (error instanceof ValidationError)
              handle_issues(output, error.issues, form_data, __.id)
            else throw error
          }
        }
        if (!event.isRemoteRequest) {
          const cache = get_cache(__, state)
          cache[''] ??= output
          get_implicit_lookup(__, state)[__.key ? `${__.id}/${__.key}` : __.id] = () => cache['']
        }
        return output
      }
    }
    Object.defineProperty(instance, '__', { value: __ })
    Object.defineProperty(instance, 'action', {
      get: () => {
        const { event, state } = get_request_store()
        const search = new URLSearchParams(state.prerendering ? '' : event.url.search)
        search.delete('/remote')
        const query = search.toString()
        const action_id = __.key ? `${__.id}/${encodeURIComponent(__.key)}` : __.id
        return `?${query ? `${query}&` : ''}/remote=${action_id}`
      },
      enumerable: true
    })
    Object.defineProperty(instance, 'fields', {
      get() {
        return create_field_proxy({
          form_id: __.id,
          get: () => get_cache(__, get_request_store().state)?.['']?.input ?? {},
          set: (path, value) => {
            const cache = get_cache(__, get_request_store().state)
            const entry = cache['']
            if (entry?.submission) return
            if (path.length === 0) {
              ;(cache[''] ??= {}).input = value
              return
            }
            const input = entry?.input ?? {}
            deep_set(input, path.map(String), value)
            ;(cache[''] ??= {}).input = input
          },
          get_issues: () =>
            flatten_issues(get_cache(__, get_request_store().state)?.['']?.issues ?? []),
          get_touched: () => ({}),
          get_dirty: () => ({})
        })
      }
    })
    Object.defineProperty(instance, 'result', {
      get() {
        try {
          return get_cache(__, get_request_store().state)?.['']?.result
        } catch {
          return
        }
      }
    })
    Object.defineProperty(instance, 'pending', { get: () => 0 })
    Object.defineProperty(instance, 'submitted', { get: () => false })
    Object.defineProperty(instance, 'preflight', { value: () => instance })
    Object.defineProperty(instance, 'validate', {
      value: () => {
        server_api_unavailable({ name: 'form.validate()' })
      }
    })
    Object.defineProperty(instance, 'submit', {
      value: () => {
        server_api_unavailable({ name: 'form.submit()' })
      }
    })
    Object.defineProperty(instance, 'element', { get: () => null })
    if (key == void 0)
      Object.defineProperty(instance, 'for', {
        /** @type {RemoteForm<any, any>['for']} */
        value: (key) => {
          const { state } = get_request_store()
          const cache_key = __.id + '|' + JSON.stringify(key)
          /** @type {RemoteForm<Input, Output> & { __: RemoteFormInternals }} */
          let instance = (state.remote.forms ??= /* @__PURE__ */ new Map()).get(cache_key)
          if (!instance) {
            instance = create_instance(key)
            instance.__.id = __.id
            instance.__.key = JSON.stringify(key)
            instance.__.name = __.name
            state.remote.forms.set(cache_key, instance)
          }
          return instance
        }
      })
    return instance
  }
  return create_instance()
}
/**
 * @param {{ issues?: InternalRemoteFormIssue[], input?: Record<string, any>, result: any }} output
 * @param {readonly StandardSchemaV1.Issue[]} issues
 * @param {FormData | null} form_data - null if the form is progressively enhanced
 * @param {string} form_id - hash/name of the form
 */
function handle_issues(output, issues, form_data, form_id) {
  output.issues = issues.map((issue) => normalize_issue(issue, true))
  if (form_data) {
    output.input = {}
    for (const [field_name, entries] of group_formdata(form_data)) {
      const field = parse_form_key(form_id, field_name)
      const path = split_path(field.name)
      if (path.some((part) => part.startsWith('_'))) continue
      const values = entries.filter((value) => typeof value === 'string')
      deep_set(output.input, path, field.is_array ? values : values[0])
    }
  }
}
/**
 * Creates an invalid function that can be used to imperatively mark form fields as invalid
 * @returns {RemoteFormInvalidField<any>}
 */
function create_issues() {
  return new Proxy(
    /** @param {string} message */
    (message) => {
      return create_issue(message)
    },
    {
      get(target, prop) {
        if (typeof prop === 'symbol') return target[prop]
        return create_issue_proxy(prop, [])
      }
    }
  )
  /**
   * @param {string} message
   * @param {(string | number)[]} path
   * @returns {StandardSchemaV1.Issue}
   */
  function create_issue(message, path = []) {
    return {
      message,
      path
    }
  }
  /**
   * Creates a proxy that builds up a path and returns a function to create an issue
   * @param {string | number} key
   * @param {(string | number)[]} path
   */
  function create_issue_proxy(key, path) {
    const new_path = [...path, key]
    /**
     * @param {string} message
     * @returns {StandardSchemaV1.Issue}
     */
    const issue_func = (message) => create_issue(message, new_path)
    return new Proxy(issue_func, {
      get(target, prop) {
        if (typeof prop === 'symbol') return target[prop]
        if (/^\d+$/.test(prop)) return create_issue_proxy(parseInt(prop, 10), new_path)
        return create_issue_proxy(prop, new_path)
      }
    })
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/app/server/remote/prerender.js
/** @import { RemoteResource, RemotePrerenderFunction } from '$app/server' */
/** @import { RemoteFunctionResponse, RemotePrerenderInputsGenerator, RemotePrerenderInternals, MaybePromise } from 'types' */
/** @import { StandardSchemaV1 } from '@standard-schema/spec' */
/**
 * Creates a remote prerender function. When called from the browser, the function will be invoked on the server via a `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#prerender) for full documentation.
 *
 * @template Output
 * @overload
 * @param {() => MaybePromise<Output>} fn
 * @param {{ inputs?: RemotePrerenderInputsGenerator<void>, dynamic?: boolean }} [options]
 * @returns {RemotePrerenderFunction<void, Output>}
 * @since 2.27
 */
/**
 * Creates a remote prerender function. When called from the browser, the function will be invoked on the server via a `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#prerender) for full documentation.
 *
 * @template Input
 * @template Output
 * @overload
 * @param {'unchecked'} validate
 * @param {(arg: Input) => MaybePromise<Output>} fn
 * @param {{ inputs?: RemotePrerenderInputsGenerator<Input>, dynamic?: boolean }} [options]
 * @returns {RemotePrerenderFunction<Input, Output>}
 * @since 2.27
 */
/**
 * Creates a remote prerender function. When called from the browser, the function will be invoked on the server via a `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#prerender) for full documentation.
 *
 * @template {StandardSchemaV1} Schema
 * @template Output
 * @overload
 * @param {Schema} schema
 * @param {(arg: StandardSchemaV1.InferOutput<Schema>) => MaybePromise<Output>} fn
 * @param {{ inputs?: RemotePrerenderInputsGenerator<StandardSchemaV1.InferInput<Schema>>, dynamic?: boolean }} [options]
 * @returns {RemotePrerenderFunction<StandardSchemaV1.InferInput<Schema>, Output>}
 * @since 2.27
 */
/**
 * @template Input
 * @template Output
 * @param {any} validate_or_fn
 * @param {any} [fn_or_options]
 * @param {{ inputs?: RemotePrerenderInputsGenerator<Input>, dynamic?: boolean }} [maybe_options]
 * @returns {RemotePrerenderFunction<Input, Output>}
 * @since 2.27
 */
/*@__NO_SIDE_EFFECTS__*/
function prerender(validate_or_fn, fn_or_options, maybe_options) {
  const maybe_fn = typeof fn_or_options === 'function' ? fn_or_options : void 0
  /** @type {typeof maybe_options} */
  const options = maybe_options ?? (maybe_fn ? void 0 : fn_or_options)
  /** @type {(arg?: Input) => MaybePromise<Output>} */
  const fn = maybe_fn ?? validate_or_fn
  /** @type {RemotePrerenderInternals} */
  const __ = {
    type: 'prerender',
    id: '',
    name: '',
    has_arg: !!maybe_fn,
    inputs: options?.inputs,
    dynamic: options?.dynamic
  }
  /** @type {(arg?: any) => MaybePromise<Input>} */
  const validate = create_validator(validate_or_fn, maybe_fn, () => __)
  /** @type {RemotePrerenderFunction<Input, Output> & { __: RemotePrerenderInternals }} */
  const wrapper = (arg) => {
    const { event, state } = get_request_store()
    const payload = stringify_remote_arg(arg)
    /** @type {Promise<Output> & Partial<RemoteResource<Output>>} */
    const promise = get_response(__, payload, state, async () => {
      const id = __.id
      const url = `/${app_dir}/remote/${id}${payload ? `/${payload}` : ''}`
      if (!state.prerendering && !event.isRemoteRequest) {
        /** @type {RemoteFunctionResponse | undefined} */
        let prerendered
        try {
          const response = await fetch(new URL(url, event.request.url).href, { redirect: 'manual' })
          if (response.ok) prerendered = await response.json()
        } catch {}
        if (prerendered) {
          if (prerendered.type === 'error') throw new HandledHttpError(prerendered.error)
          return parse(prerendered.data)._
        }
      }
      if (state.prerendering?.remote_responses.has(url))
        return state.prerendering.remote_responses.get(url)
      const promise = run_remote_function(
        event,
        {
          ...state,
          is_in_remote_prerender: true
        },
        false,
        () => validate(arg),
        fn
      )
      if (state.prerendering) state.prerendering.remote_responses.set(url, promise)
      const result = await promise
      if (state.prerendering) {
        const body = {
          type: 'result',
          data: stringify({ _: result })
        }
        state.prerendering.dependencies.set(url, {
          body: JSON.stringify(body),
          response: Response.json(body)
        })
      }
      return result
    })
    promise.catch(noop)
    return promise
  }
  Object.defineProperty(wrapper, '__', { value: __ })
  return wrapper
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/utils/shared-iterator.js
/**
 * A pull-style async iterator that fans out a single stream of values to
 * multiple `for await (...)` consumers. Each subscriber gets its own
 * `AsyncGenerator` whose `.next()` resolves whenever a value is pushed via
 * `push(value)`. Multiple consumers see the same values without each one
 * driving an independent underlying source.
 *
 * Backpressure is **latest-wins**: if values arrive faster than a particular
 * consumer drains its iterator, only the most-recently-pushed value is kept
 * pending for that subscriber. Earlier undrained values are dropped. This is
 * appropriate for live data streams (reactive state replication), not for
 * event logs where every value must be delivered.
 *
 * Lifecycle hooks are exposed via the constructor:
 *
 *   - `start()` is called when the subscriber count transitions
 *     from 0 to 1 (e.g. to start a pump pulling from a real source).
 *   - `stop()` is called when the subscriber count transitions
 *     from non-zero back to 0 (e.g. to tear down that pump).
 *
 * Either hook may be omitted.
 *
 * The owner is responsible for calling `push(value)` to broadcast values,
 * `done()` to signal natural completion to all subscribers, and `fail(error)`
 * to broadcast a terminal error. After `done()` or `fail()`, the iterator
 * rejects further `subscribe()` calls with the terminal state appropriately.
 *
 * @template T
 */
var SharedIterator = class {
  /**
   * @typedef {object} Subscriber
   * @property {{ value: any } | null} pending
   * @property {{ error: unknown } | null} pending_error
   * @property {boolean} finished
   * @property {((result: IteratorResult<any, void>) => void) | null} waiting_resolve
   * @property {((reason: unknown) => void) | null} waiting_reject
   */
  /** @type {Set<Subscriber>} */
  #subscribers = /* @__PURE__ */ new Set()
  /** @type {((instance: SharedIterator<T>) => (() => void)) | undefined} */
  #start = void 0
  /** @type {(() => void) | undefined} */
  #stop = void 0
  /** Once `done()` or `fail()` has been broadcast, no new values are accepted. */
  #closed = false
  /** @type {unknown} */
  #terminal_error = void 0
  /** Whether `done()` or `fail()` has been broadcast. */
  get closed() {
    return this.#closed
  }
  /**
   * @param {(instance: SharedIterator<T>) => (() => void)} [start]
   */
  constructor(start) {
    this.#start = start
  }
  /** @param {T} value */
  push(value) {
    if (this.#closed) return
    for (const subscriber of this.#subscribers)
      if (subscriber.waiting_resolve) {
        const resolve = subscriber.waiting_resolve
        subscriber.waiting_resolve = null
        subscriber.waiting_reject = null
        resolve({
          value,
          done: false
        })
      } else subscriber.pending = { value }
  }
  /**
   * Signal natural completion to all current subscribers, and to any future
   * subscriber (which will receive an immediately-done iterator).
   */
  done() {
    if (this.#closed) return
    this.#closed = true
    for (const subscriber of this.#subscribers) {
      subscriber.finished = true
      if (subscriber.waiting_resolve) {
        const resolve = subscriber.waiting_resolve
        subscriber.waiting_resolve = null
        subscriber.waiting_reject = null
        resolve({
          value: void 0,
          done: true
        })
      }
    }
    this.#subscribers.clear()
  }
  /**
   * Broadcast a terminal error. All current subscribers will reject their
   * next `.next()` call with `error`. Future subscribers will also reject
   * their first `.next()`.
   *
   * @param {unknown} error
   */
  fail(error) {
    if (this.#closed) return
    this.#closed = true
    this.#terminal_error = error
    for (const subscriber of this.#subscribers) {
      subscriber.finished = true
      if (subscriber.waiting_reject) {
        const reject = subscriber.waiting_reject
        subscriber.waiting_resolve = null
        subscriber.waiting_reject = null
        reject(error)
      } else subscriber.pending_error = { error }
    }
    this.#subscribers.clear()
  }
  /**
   * Subscribe to the shared stream. Returns an `AsyncGenerator<T>` that
   * yields every value pushed after this call (and, if `initial_value` is
   * provided, that value as the first yield).
   *
   * @param {{ initial_value?: { value: T } }} [options]
   *   `initial_value` lets the caller seed the iterator with a synchronously-
   *   available current value before any new pushes arrive (e.g. the
   *   "last-seen value" of a reactive resource). Pass it wrapped in an
   *   object so `undefined` can be distinguished from "no initial value".
   * @returns {AsyncGenerator<T, void, void>}
   */
  subscribe(options) {
    /** @type {Subscriber} */
    const subscriber = {
      pending: options?.initial_value ? { value: options.initial_value.value } : null,
      pending_error:
        this.#closed && this.#terminal_error !== void 0 ? { error: this.#terminal_error } : null,
      finished: this.#closed && this.#terminal_error === void 0,
      waiting_resolve: null,
      waiting_reject: null
    }
    if (!subscriber.finished && subscriber.pending_error === null) this.#subscribers.add(subscriber)
    if (!this.#closed) this.#stop ??= this.#start?.(this)
    const unsubscribe = () => {
      subscriber.finished = true
      if (this.#subscribers.delete(subscriber) && this.#subscribers.size === 0) this.#stop?.()
    }
    /** @type {AsyncGenerator<T, void, void>} */
    const iterator = {
      next() {
        if (subscriber.pending_error) {
          const { error } = subscriber.pending_error
          subscriber.pending_error = null
          unsubscribe()
          return Promise.reject(error)
        }
        if (subscriber.pending) {
          const { value } = subscriber.pending
          subscriber.pending = null
          return Promise.resolve({
            value,
            done: false
          })
        }
        if (subscriber.finished)
          return Promise.resolve({
            value: void 0,
            done: true
          })
        return new Promise((resolve, reject) => {
          subscriber.waiting_resolve = resolve
          subscriber.waiting_reject = reject
        })
      },
      return(value) {
        unsubscribe()
        if (subscriber.waiting_resolve) {
          const resolve = subscriber.waiting_resolve
          subscriber.waiting_resolve = null
          subscriber.waiting_reject = null
          resolve({
            value: void 0,
            done: true
          })
        }
        return Promise.resolve({
          value,
          done: true
        })
      },
      throw(error) {
        unsubscribe()
        if (subscriber.waiting_reject) {
          const reject = subscriber.waiting_reject
          subscriber.waiting_resolve = null
          subscriber.waiting_reject = null
          reject(error)
        }
        return Promise.reject(error)
      },
      [Symbol.asyncIterator]() {
        return iterator
      },
      async [Symbol.asyncDispose]() {}
    }
    return iterator
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/app/server/remote/query.js
/** @import { RemoteLiveQuery, RemoteLiveQueryFunction, RemoteQuery, RemoteQueryFunction } from '$app/server' */
/** @import { RequestEvent } from '@sveltejs/kit' */
/** @import { RemoteInternals, MaybePromise, RequestState, RemoteQueryLiveInternals, RemoteQueryBatchInternals, RemoteQueryInternals, RemoteLiveQueryUserFunctionReturnType } from 'types' */
/** @import { StandardSchemaV1 } from '@standard-schema/spec' */
/**
 * Creates a remote query. When called from the browser, the function will be invoked on the server via a `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#query) for full documentation.
 *
 * @template Output
 * @overload
 * @param {() => MaybePromise<Output>} fn
 * @returns {RemoteQueryFunction<void, Output>}
 * @since 2.27
 */
/**
 * Creates a remote query. When called from the browser, the function will be invoked on the server via a `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#query) for full documentation.
 *
 * @template Input
 * @template Output
 * @overload
 * @param {'unchecked'} validate
 * @param {(arg: Input) => MaybePromise<Output>} fn
 * @returns {RemoteQueryFunction<Input, Output>}
 * @since 2.27
 */
/**
 * Creates a remote query. When called from the browser, the function will be invoked on the server via a `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#query) for full documentation.
 *
 * @template {StandardSchemaV1} Schema
 * @template Output
 * @overload
 * @param {Schema} schema
 * @param {(arg: StandardSchemaV1.InferOutput<Schema>) => MaybePromise<Output>} fn
 * @returns {RemoteQueryFunction<StandardSchemaV1.InferInput<Schema>, Output, StandardSchemaV1.InferOutput<Schema>>}
 * @since 2.27
 */
/**
 * @template Input
 * @template Output
 * @param {any} validate_or_fn
 * @param {(args?: Input) => MaybePromise<Output>} [maybe_fn]
 * @returns {RemoteQueryFunction<Input, Output>}
 * @since 2.27
 */
/*@__NO_SIDE_EFFECTS__*/
function query(validate_or_fn, maybe_fn) {
  /** @type {(arg?: Input) => Output} */
  const fn = maybe_fn ?? validate_or_fn
  /** @type {(arg?: any) => MaybePromise<Input>} */
  const validate = create_validator(validate_or_fn, maybe_fn, () => __)
  /** @type {RemoteQueryInternals} */
  const __ = {
    type: 'query',
    id: '',
    name: '',
    validate,
    bind(payload, validated_arg) {
      const { event, state } = get_request_store()
      return create_query_resource(__, payload, event, state, () =>
        run_remote_function(
          event,
          {
            ...state,
            is_in_remote_query: true
          },
          false,
          () => validated_arg,
          fn
        )
      )
    }
  }
  /** @type {RemoteQueryFunction<Input, Output> & { __: RemoteQueryInternals }} */
  const wrapper = (arg) => {
    if (prerendering)
      remote_query_prerender({
        type: 'query',
        name: __.name
      })
    const { event, state } = get_request_store()
    const payload = stringify_remote_arg(arg)
    return create_query_resource(__, payload, event, state, () =>
      run_remote_function(
        event,
        {
          ...state,
          is_in_remote_query: true
        },
        false,
        () => validate(arg),
        fn
      )
    )
  }
  Object.defineProperty(wrapper, '__', { value: __ })
  return wrapper
}
/**
 * Creates a live remote query. When called from the browser, the function will be invoked on the server via a streaming `fetch` call.
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#query.live) for full documentation.
 *
 * @template Output
 * @overload
 * @param {(arg: void) => RemoteLiveQueryUserFunctionReturnType<Output>} fn
 * @returns {RemoteLiveQueryFunction<void, Output>}
 */
/**
 * @template Input
 * @template Output
 * @overload
 * @param {'unchecked'} validate
 * @param {(arg: Input) => RemoteLiveQueryUserFunctionReturnType<Output>} fn
 * @returns {RemoteLiveQueryFunction<Input, Output>}
 */
/**
 * @template {StandardSchemaV1} Schema
 * @template Output
 * @overload
 * @param {Schema} schema
 * @param {(arg: StandardSchemaV1.InferOutput<Schema>) => RemoteLiveQueryUserFunctionReturnType<Output>} fn
 * @returns {RemoteLiveQueryFunction<StandardSchemaV1.InferInput<Schema>, Output, StandardSchemaV1.InferOutput<Schema>>}
 */
/**
 * @template Input
 * @template Output
 * @param {any} validate_or_fn
 * @param {(args: Input) => RemoteLiveQueryUserFunctionReturnType<Output>} [maybe_fn]
 * @returns {RemoteLiveQueryFunction<Input, Output>}
 */
/*@__NO_SIDE_EFFECTS__*/
function live(validate_or_fn, maybe_fn) {
  /** @type {(arg: Input) => RemoteLiveQueryUserFunctionReturnType<Output>} */
  const fn = maybe_fn ?? validate_or_fn
  /** @type {(arg?: any) => MaybePromise<Input>} */
  const validate = create_validator(validate_or_fn, maybe_fn, () => __)
  /**
   * @param {any} event
   * @param {any} state
   * @param {any} get_input
   */
  const run = (event, state, get_input) =>
    run_remote_generator(
      event,
      {
        ...state,
        is_in_remote_query: true
      },
      false,
      get_input,
      fn,
      __.name
    )
  /** @type {RemoteQueryLiveInternals} */
  const __ = {
    type: 'query_live',
    id: '',
    name: '',
    run: (event, state, arg) => run(event, state, () => validate(arg)),
    validate,
    bind(payload, validated_arg) {
      const { event, state } = get_request_store()
      return create_live_query_resource(__, payload, event, state, () =>
        run(event, state, () => validated_arg)
      )
    }
  }
  /** @type {RemoteLiveQueryFunction<Input, Output> & { __: RemoteQueryLiveInternals }} */
  const wrapper = (arg) => {
    if (prerendering)
      remote_query_prerender({
        type: 'query.live',
        name: __.name
      })
    const { event, state } = get_request_store()
    const payload = stringify_remote_arg(arg)
    return create_live_query_resource(__, payload, event, state, () =>
      run(event, state, () => validate(arg))
    )
  }
  Object.defineProperty(wrapper, '__', { value: __ })
  return wrapper
}
/**
 * Creates a batch query function that collects multiple calls and executes them in a single request
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#query.batch) for full documentation.
 *
 * @template Input
 * @template Output
 * @overload
 * @param {'unchecked'} validate
 * @param {(args: Input[]) => MaybePromise<(arg: Input, idx: number) => Output>} fn
 * @returns {RemoteQueryFunction<Input, Output>}
 * @since 2.35
 */
/**
 * Creates a batch query function that collects multiple calls and executes them in a single request
 *
 * See [Remote functions](https://svelte.dev/docs/kit/remote-functions#query.batch) for full documentation.
 *
 * @template {StandardSchemaV1} Schema
 * @template Output
 * @overload
 * @param {Schema} schema
 * @param {(args: StandardSchemaV1.InferOutput<Schema>[]) => MaybePromise<(arg: StandardSchemaV1.InferOutput<Schema>, idx: number) => Output>} fn
 * @returns {RemoteQueryFunction<StandardSchemaV1.InferInput<Schema>, Output, StandardSchemaV1.InferOutput<Schema>>}
 * @since 2.35
 */
/**
 * @template Input
 * @template Output
 * @param {any} validate_or_fn
 * @param {(args?: Input[]) => MaybePromise<(arg: Input, idx: number) => Output>} [maybe_fn]
 * @returns {RemoteQueryFunction<Input, Output>}
 * @since 2.35
 */
/*@__NO_SIDE_EFFECTS__*/
function batch(validate_or_fn, maybe_fn) {
  /** @type {(args?: Input[]) => MaybePromise<(arg: Input, idx: number) => Output>} */
  const fn = maybe_fn ?? validate_or_fn
  /** @type {(arg?: any) => MaybePromise<Input>} */
  const validate = create_validator(validate_or_fn, maybe_fn, () => __)
  /**
   * Enqueues a single call into the current batch (creating one if necessary)
   * and returns a promise that resolves with the result for this entry.
   *
   * @param {string} payload — the stringified raw argument (cache key)
   * @param {() => MaybePromise<any>} get_validated — produces the validated argument for this entry
   * @returns {Promise<any>}
   */
  const enqueue = (payload, get_validated) => {
    const { event, state } = get_request_store()
    return new Promise((resolve, reject) => {
      const batches = (state.remote.batches ??= /* @__PURE__ */ new Map())
      let batched = batches.get(__)
      if (!batched) {
        batched = /* @__PURE__ */ new Map()
        batches.set(__, batched)
      }
      const entry = batched.get(payload)
      if (entry) {
        entry.resolvers.push({
          resolve,
          reject
        })
        return
      }
      batched.set(payload, {
        get_validated,
        resolvers: [
          {
            resolve,
            reject
          }
        ]
      })
      if (batched.size > 1) return
      setTimeout(async () => {
        batches.delete(__)
        const entries = Array.from(batched.values())
        try {
          return await run_remote_function(
            event,
            {
              ...state,
              is_in_remote_query: true
            },
            false,
            async () => Promise.all(entries.map((entry) => entry.get_validated())),
            async (input) => {
              const get_result = await fn(input)
              for (let i = 0; i < entries.length; i++)
                try {
                  const result = get_result(input[i], i)
                  for (const resolver of entries[i].resolvers) resolver.resolve(result)
                } catch (error) {
                  for (const resolver of entries[i].resolvers) resolver.reject(error)
                }
            }
          )
        } catch (error) {
          for (const entry of batched.values())
            for (const resolver of entry.resolvers) resolver.reject(error)
        }
      }, 0)
    })
  }
  /** @type {RemoteQueryBatchInternals} */
  const __ = {
    type: 'query_batch',
    id: '',
    name: '',
    validate,
    run: async (args) => {
      const { event, state } = get_request_store()
      return run_remote_function(
        event,
        {
          ...state,
          is_in_remote_query: true
        },
        false,
        async () => Promise.all(args.map(validate)),
        async (input) => {
          const get_result = await fn(input)
          return Promise.all(
            input.map(async (arg, i) => {
              try {
                return {
                  type: 'result',
                  data: get_result(arg, i)
                }
              } catch (error) {
                return {
                  type: 'error',
                  error: await handle_error_and_jsonify(event, state, error)
                }
              }
            })
          )
        }
      )
    },
    bind(payload, validated_arg) {
      const { event, state } = get_request_store()
      return create_query_resource(__, payload, event, state, () =>
        enqueue(payload, () => validated_arg)
      )
    }
  }
  /** @type {RemoteQueryFunction<Input, Output> & { __: RemoteQueryBatchInternals }} */
  const wrapper = (arg) => {
    if (prerendering)
      remote_query_prerender({
        type: 'query.batch',
        name: __.name
      })
    const { event, state } = get_request_store()
    const payload = stringify_remote_arg(arg)
    return create_query_resource(__, payload, event, state, () =>
      enqueue(payload, () => validate(arg))
    )
  }
  Object.defineProperty(wrapper, '__', { value: __ })
  return wrapper
}
/**
 * Include this value in the returned payload...
 * @param {RequestEvent} event
 * @param {RequestState} state
 * @param {RemoteInternals} internals
 * @param {string} payload
 * @param {() => Promise<any>} fn
 */
function refresh(event, state, internals, payload, fn) {
  if (!internals.id) return
  if (!event.isRemoteRequest && state.is_in_remote_form_or_command) return
  const key = create_remote_key(internals.id, payload)
  ;(state.remote.explicit ??= /* @__PURE__ */ new Map()).set(key, {
    internals,
    fn
  })
}
/**
 * @param {RemoteInternals} __
 * @param {string} payload — the stringified raw argument (i.e. the cache key the client will use)
 * @param {RequestEvent} event
 * @param {RequestState} state
 * @param {() => Promise<any>} fn
 * @returns {RemoteQuery<any>}
 */
function create_query_resource(__, payload, event, state, fn) {
  /** @type {Promise<any> | null} */
  let promise = null
  const get_promise = () => {
    return (promise ??= get_response(__, payload, state, fn))
  }
  const populate_hydratable = () => {
    if (__.id && state.is_in_render) get_promise().catch(noop)
  }
  return {
    /** @type {Promise<any>['catch']} */
    catch(onrejected) {
      return get_promise().catch(onrejected)
    },
    get current() {
      populate_hydratable()
    },
    get error() {
      populate_hydratable()
    },
    /** @type {Promise<any>['finally']} */
    finally(onfinally) {
      return get_promise().finally(onfinally)
    },
    get loading() {
      populate_hydratable()
      return true
    },
    get ready() {
      populate_hydratable()
      return false
    },
    refresh() {
      promise = null
      delete get_cache(__, state)[payload]
      refresh(event, state, __, payload, get_promise)
      return Promise.resolve()
    },
    /** @param {any} value */
    set(value) {
      const p = (promise = Promise.resolve(value))
      get_cache(__, state)[payload] = p
      refresh(event, state, __, payload, () => p)
    },
    /** @type {Promise<any>['then']} */
    then(onfulfilled, onrejected) {
      return get_promise().then(onfulfilled, onrejected)
    },
    withOverride() {
      server_api_unavailable({ name: `${__.name}.withOverride()` })
    },
    get [Symbol.toStringTag]() {
      return 'QueryResource'
    }
  }
}
/**
 * @param {RemoteQueryLiveInternals} __
 * @param {string} payload — the stringified raw argument (i.e. the cache key the client will use)
 * @param {RequestEvent} event
 * @param {RequestState} state
 * @param {() => AsyncGenerator<any, void, void>} get_generator
 * @returns {RemoteLiveQuery<any>}
 */
function create_live_query_resource(__, payload, event, state, get_generator) {
  /** @type {Promise<any> | null} */
  let promise = null
  const get_first_value = async () => {
    for await (const value of get_generator()) return value
    remote_query_live_no_value({ name: __.name })
  }
  const get_promise = () => {
    return (promise ??= get_response(__, payload, state, get_first_value))
  }
  const populate_hydratable = () => {
    if (__.id && state.is_in_render) get_promise().catch(noop)
  }
  return {
    /** @type {Promise<any>['catch']} */
    catch(onrejected) {
      return get_promise().catch(onrejected)
    },
    get current() {
      populate_hydratable()
    },
    get error() {
      populate_hydratable()
    },
    /** @type {Promise<any>['finally']} */
    finally(onfinally) {
      return get_promise().finally(onfinally)
    },
    get done() {
      populate_hydratable()
      return false
    },
    get loading() {
      populate_hydratable()
      return true
    },
    get ready() {
      populate_hydratable()
      return false
    },
    get connected() {
      populate_hydratable()
      return false
    },
    reconnect() {
      promise = null
      delete get_cache(__, state)[payload]
      refresh(event, state, __, payload, get_promise)
      return Promise.resolve()
    },
    /** @type {Promise<any>['then']} */
    then(onfulfilled, onrejected) {
      return get_promise().then(onfulfilled, onrejected)
    },
    [Symbol.asyncIterator]() {
      const key = create_remote_key(__.id, payload)
      const cache = (state.remote.live_iterators ??= /* @__PURE__ */ new Map())
      let cached = cache.get(key)
      if (!cached) {
        cached = create_shared_live_iterator(event.request.signal, get_generator)
        cache.set(key, cached)
      }
      return cached.subscribe()
    },
    get [Symbol.toStringTag]() {
      return 'LiveQueryResource'
    }
  }
}
/**
 * Wraps a lazily-created live-query generator so that multiple `for await`
 * consumers within the same request share one underlying iteration. The first
 * subscriber starts the generator; values are broadcast to all subscribers
 * via a `SharedIterator`. When the last subscriber unsubscribes, the generator
 * is closed via `generator.return(undefined)`.
 *
 * If `signal` aborts (typically because the client has disconnected), the
 * pump is torn down and any in-flight `next()` calls on consumer iterators
 * resolve with `{ done: true }`, so suspended `for await` loops unwind
 * cleanly rather than leaking.
 *
 * @param {AbortSignal} signal
 * @param {() => AsyncGenerator<any, void, void>} get_generator
 */
function create_shared_live_iterator(signal, get_generator) {
  return new SharedIterator((instance) => {
    if (signal.aborted) {
      instance.done()
      return noop
    }
    const generator = get_generator()
    let aborted = false
    const close = () => {
      aborted = true
      generator.return().catch(noop)
    }
    signal.addEventListener('abort', () => (close(), instance.done()), { once: true })
    ;(async () => {
      try {
        while (true) {
          const result = await generator.next()
          if (result.done) {
            instance.done()
            return
          }
          instance.push(result.value)
        }
      } catch (error) {
        if (!aborted) instance.fail(error)
      } finally {
        close()
      }
    })()
    return close
  })
}
Object.defineProperty(query, 'batch', {
  value: batch,
  enumerable: true
})
Object.defineProperty(query, 'live', {
  value: live,
  enumerable: true
})
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/runtime/app/server/remote/requested.js
/** @import { RemoteLiveQuery, RemoteLiveQueryFunction, RemoteQuery, RemoteQueryFunction, RequestedResult, RemoteQueryRequestedResult, RemoteLiveQueryRequestedResult } from '$app/server' */
/** @import { MaybePromise, RemoteAnyQueryInternals } from 'types' */
/**
 * Inside a remote `command` or `form` callback, returns an iterable
 * of `{ arg, query }` entries for the query instances the client asked to refresh, up to
 * the supplied `limit`. Each `query` is a `RemoteQuery` bound to the original
 * client-side cache key, so `refresh()` / `set()` propagate correctly even when
 * the query's schema transforms the input. `arg` is the *validated* argument,
 * i.e. the value after the schema has run (so `InferOutput<Schema>` for queries
 * declared with a Standard Schema).
 *
 * Arguments that fail validation or exceed `limit` are recorded as failures in
 * the response to the client.
 * See [Client-requested refreshes](https://svelte.dev/docs/kit/remote-functions#Single-flight-mutations-Client-requested-refreshes)
 * for usage in a remote `command` or `form`.
 *
 * @example
 * ```ts
 * import { requested } from '$app/server';
 *
 * for (const { arg, query } of requested(getPost, 5)) {
 * 	// `arg` is the validated argument; `query` is bound to the client's
 * 	// cache key. It's safe to throw away this promise -- SvelteKit will
 * 	// await it and forward any errors to the client.
 * 	void query.refresh();
 * }
 * ```
 *
 * As a shorthand for the above, you can also call `refreshAll` on the result:
 *
 * @example
 * ```ts
 * import { requested } from '$app/server';
 *
 * await requested(getPost, 5).refreshAll();
 * ```
 *
 * Works with `query.batch` as well — refreshes for individual entries are
 * collected into a single batched call.
 *
 * For live queries, the same applies, but with `reconnect` and `reconnectAll`.
 *
 * @template Input
 * @template Output
 * @template [Validated=Input]
 * @overload
 * @param {RemoteQueryFunction<Input, Output, Validated>} query
 * @param {number} limit
 * @returns {RemoteQueryRequestedResult<Validated, Output>}
 */
/**
 * Inside a remote `command` or `form` callback, returns an iterable
 * of `{ arg, query }` entries for the live query instances the client asked to reconnect, up to
 * the supplied `limit`. Each `query` is a `RemoteLiveQuery` bound to the original
 * client-side cache key, so `reconnect()` propagates correctly even when
 * the query's schema transforms the input. `arg` is the *validated* argument.
 *
 * Arguments that fail validation or exceed `limit` are recorded as failures in
 * the response to the client.
 * See [Client-requested refreshes](https://svelte.dev/docs/kit/remote-functions#Single-flight-mutations-Client-requested-refreshes)
 * for usage in a remote `command` or `form`.
 *
 * @example
 * ```ts
 * import { requested } from '$app/server';
 *
 * for (const { query } of requested(getPost, 5)) {
 * 	void query.reconnect();
 * }
 * ```
 *
 * As a shorthand, you can also call `reconnectAll` on the result:
 *
 * @example
 * ```ts
 * import { requested } from '$app/server';
 *
 * await requested(getPost, 5).reconnectAll();
 * ```
 *
 * @template Input
 * @template Output
 * @template [Validated=Input]
 * @overload
 * @param {RemoteLiveQueryFunction<Input, Output, Validated>} query
 * @param {number} limit
 * @returns {RemoteLiveQueryRequestedResult<Validated, Output>}
 */
/**
 * @template Input
 * @template Output
 * @template [Validated=Input]
 * @param {RemoteQueryFunction<Input, Output, Validated> | RemoteLiveQueryFunction<Input, Output, Validated>} query
 * @param {number} limit
 * @returns {RequestedResult<Validated, Output>}
 */
function requested(query, limit) {
  const { event, state } = get_request_store()
  const internals = query.__
  if (
    internals?.type !== 'query' &&
    internals?.type !== 'query_batch' &&
    internals?.type !== 'query_live'
  )
    remote_requested_invalid_query()
  const __ = internals
  const requested = state.remote.requested
  const payloads = requested?.get(__.id) ?? /* @__PURE__ */ new Set()
  const ignored = (state.remote.ignored ??= /* @__PURE__ */ new Set())
  /** @param {string} payload */
  const consume = (payload) => {
    payloads.delete(payload)
    if (payloads.size === 0) requested?.delete(__.id)
  }
  /** @param {string} payload */
  const create_ignore = (payload) => () => {
    ignored.add(create_remote_key(__.id, payload))
  }
  if (!state.is_in_remote_form_or_command) remote_requested_context()
  const [selected, skipped] = split_limit([...payloads], limit)
  /**
   * Registers the failure exactly like `.set()` registers a value: the error record
   * is serialized to the client (putting the query there into a failed state), and
   * subsequent server-side calls of the query with the same argument reject with it.
   * @param {string} payload
   * @param {unknown} error
   */
  const record_failure = (payload, error) => {
    const promise = Promise.reject(error)
    promise.catch(noop)
    get_cache(__, state)[payload] = promise
    refresh(event, state, __, payload, () => promise)
  }
  for (const payload of skipped) consume(payload)
  const result = {
    *[Symbol.iterator]() {
      for (const payload of selected) {
        consume(payload)
        try {
          const parsed = parse_remote_arg(payload)
          const validated = __.validate(parsed)
          if (is_thenable(validated))
            remote_requested_async_validator({
              name: __.name,
              limit: String(limit)
            })
          yield {
            arg: validated,
            query: __.bind(payload, validated),
            ignore: create_ignore(payload)
          }
        } catch (error) {
          record_failure(payload, error)
          continue
        }
      }
    },
    async *[Symbol.asyncIterator]() {
      yield* race_all(selected, async (payload) => {
        consume(payload)
        try {
          const parsed = parse_remote_arg(payload)
          const validated = await __.validate(parsed)
          return {
            arg: validated,
            query: __.bind(payload, validated),
            ignore: create_ignore(payload)
          }
        } catch (error) {
          record_failure(payload, error)
          throw new Error(`Skipping ${__.name}(${payload})`, { cause: error })
        }
      })
    },
    async refreshAll() {
      if (__.type === 'query_live')
        remote_requested_wrong_method({
          method: 'refreshAll',
          type: 'live',
          replacement: 'reconnectAll'
        })
      for await (const { query } of result) query.refresh()
    },
    async reconnectAll() {
      if (__.type !== 'query_live')
        remote_requested_wrong_method({
          method: 'reconnectAll',
          type: 'regular',
          replacement: 'refreshAll'
        })
      for await (const { query } of result) query.reconnect()
    },
    async ignoreAll() {
      for await (const { ignore } of result) ignore()
    }
  }
  return result
}
/**
 * @template T
 * @param {Array<T>} array
 * @param {number} limit
 * @returns {[Array<T>, Array<T>]}
 */
function split_limit(array, limit) {
  if (limit === Infinity) return [array, []]
  if (!Number.isInteger(limit) || limit < 0) remote_requested_invalid_limit()
  return [array.slice(0, limit), array.slice(limit)]
}
/**
 * @param {any} value
 * @returns {value is PromiseLike<any>}
 */
function is_thenable(value) {
  return !!value && (typeof value === 'object' || typeof value === 'function') && 'then' in value
}
/**
 * Runs all callbacks immediately and yields resolved values in completion order.
 * If the promise rejects, it is skipped.
 *
 * @template T
 * @template R
 * @param {Array<T>} array
 * @param {(value: T) => MaybePromise<R>} fn
 * @returns {AsyncIterable<R>}
 */
async function* race_all(array, fn) {
  /** @type {Set<Promise<{ promise: Promise<any>, value: Awaited<R> }>>} */
  const pending = /* @__PURE__ */ new Set()
  for (const value of array) {
    /** @type {Promise<{ promise: Promise<any>, value: Awaited<R> }>} */
    const promise = Promise.resolve(fn(value)).then((result) => ({
      promise,
      value: result
    }))
    promise.catch(() => pending.delete(promise))
    pending.add(promise)
  }
  while (pending.size > 0)
    try {
      const { promise, value } = await Promise.race(pending)
      pending.delete(promise)
      yield value
    } catch {}
}
export { command, form, prerender, query, requested }

//# sourceMappingURL=remote-entry.js.map
