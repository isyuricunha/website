// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/messages/internal/server.js
/**
 * @typedef {{ cause?: unknown; stackless?: boolean }} ServerThrowOptions
 */
/**
 * Throws the full diagnostic. Unlike shared errors, server-only errors keep their full text in production
 * @param {string} code
 * @param {string} message
 * @param {ServerThrowOptions | undefined} options
 * @param {Function} caller The generated helper, which is omitted from the stack along with this function
 * @returns {never}
 */
function throw_error(code, message, options, caller) {
  const error = new Error(
    `${code}\n${message}\nhttps://svelte.dev/e/kit/${code}`,
    options?.cause === void 0 ? void 0 : { cause: options.cause }
  )
  error.name = 'SvelteKit error'
  if (options?.stackless) error.stack = ''
  else Error.captureStackTrace?.(error, caller)
  throw error
}
/**
 * Returns the error thrown by `fn`, for the few places that pass an error on (for example to
 * `handleError` or a later `console.error`) rather than throwing it. Its stack starts inside `fn`
 * @param {() => never} fn A function that calls a generated `server-errors` helper
 * @returns {Error}
 */
function capture_error(fn) {
  try {
    fn()
  } catch (error) {
    return error
  }
}
// ../../node_modules/.pnpm/@sveltejs+kit@3.2.0_@opentelemetry+api@1.9.1_@sveltejs+vite-plugin-svelte@7.3.1_svelte@_cd0c98afbb4490056c14a8af523c0eca/node_modules/@sveltejs/kit/src/messages/server-errors.js
/** @import { ServerThrowOptions } from './internal/server.js' */
/**
 * Data returned from action inside `%id%` is not serializable: %message%
 * @param {{ "id": string; "message": string; "path"?: string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function action_data_not_serializable(_values, options) {
  throw_error(
    'action_data_not_serializable',
    _values?.path !== void 0
      ? `Data returned from action inside \`${_values.id}\` is not serializable: ${_values.message} (\`${_values.path}\`)`
      : `Data returned from action inside \`${_values.id}\` is not serializable: ${_values.message}`,
    options,
    action_data_not_serializable
  )
}
/**
 * When using named actions, the default action cannot be used. See the docs for more info: https://svelte.dev/docs/kit/form-actions#Named-actions
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function action_default_with_named(_values, options) {
  throw_error(
    'action_default_with_named',
    `When using named actions, the default action cannot be used. See the docs for more info: https://svelte.dev/docs/kit/form-actions#Named-actions`,
    options,
    action_default_with_named
  )
}
/**
 * Cannot use reserved action name `default`
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function action_name_reserved(_values, options) {
  throw_error(
    'action_name_reserved',
    `Cannot use reserved action name \`default\``,
    options,
    action_name_reserved
  )
}
/**
 * Data returned from action inside `%id%` is not serializable. Form actions need to return plain objects or `fail()`. E.g. `return { success: true }` or `return fail(400, { message: "invalid" });`
 * @param {{ "id": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function action_response_not_serializable(_values, options) {
  throw_error(
    'action_response_not_serializable',
    `Data returned from action inside \`${_values.id}\` is not serializable. Form actions need to return plain objects or \`fail()\`. E.g. \`return { success: true }\` or \`return fail(400, { message: "invalid" });\``,
    options,
    action_response_not_serializable
  )
}
/**
 * Cannot `return error(...)` — use `error(...)` or `return fail(...)` instead
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function action_return_error(_values, options) {
  throw_error(
    'action_return_error',
    `Cannot \`return error(...)\` — use \`error(...)\` or \`return fail(...)\` instead`,
    options,
    action_return_error
  )
}
/**
 * Cannot `return redirect(...)` — use `redirect(...)` instead
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function action_return_redirect(_values, options) {
  throw_error(
    'action_return_redirect',
    `Cannot \`return redirect(...)\` — use \`redirect(...)\` instead`,
    options,
    action_return_redirect
  )
}
/**
 * Cannot `throw fail()`. Use `return fail()`
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function action_throw_fail(_values, options) {
  throw_error(
    'action_throw_fail',
    `Cannot \`throw fail()\`. Use \`return fail()\``,
    options,
    action_throw_fail
  )
}
/**
 * `%adapter%` does not specify `getClientAddress`. Please raise an issue
 * @param {{ "adapter": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function client_address_unsupported(_values, options) {
  throw_error(
    'client_address_unsupported',
    `\`${_values.adapter}\` does not specify \`getClientAddress\`. Please raise an issue`,
    options,
    client_address_unsupported
  )
}
/**
 * Cookie `%name%` is too large, and will be discarded by the browser
 * @param {{ "name": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function cookie_too_large(_values, options) {
  throw_error(
    'cookie_too_large',
    `Cookie \`${_values.name}\` is too large, and will be discarded by the browser`,
    options,
    cookie_too_large
  )
}
/**
 * Cannot serialize cookies until after the route is determined
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function cookies_serialize_before_route(_values, options) {
  throw_error(
    'cookies_serialize_before_route',
    `Cannot serialize cookies until after the route is determined`,
    options,
    cookies_serialize_before_route
  )
}
/**
 * Cannot use `cookies.set(...)` after the response has been generated
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function cookies_set_after_response(_values, options) {
  throw_error(
    'cookies_set_after_response',
    `Cannot use \`cookies.set(...)\` after the response has been generated`,
    options,
    cookies_set_after_response
  )
}
/**
 * `content-security-policy-report-only` must be specified with either the `report-to` or `report-uri` directives, or both
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function csp_report_only_missing_report(_values, options) {
  throw_error(
    'csp_report_only_missing_report',
    `\`content-security-policy-report-only\` must be specified with either the \`report-to\` or \`report-uri\` directives, or both`,
    options,
    csp_report_only_missing_report
  )
}
/**
 * Invalid response from route `%path%`: handler should return a `Response` object
 * @param {{ "path": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function endpoint_invalid_response(_values, options) {
  throw_error(
    'endpoint_invalid_response',
    `Invalid response from route \`${_values.path}\`: handler should return a \`Response\` object`,
    options,
    endpoint_invalid_response
  )
}
/**
 * Cannot return `fetch(...)` directly from a handler if the response has a `Content-Encoding: %encoding%` header. The body has already been decoded
 * @param {{ "encoding": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function fetch_response_decoded(_values, options) {
  throw_error(
    'fetch_response_decoded',
    `Cannot return \`fetch(...)\` directly from a handler if the response has a \`Content-Encoding: ${_values.encoding}\` header. The body has already been decoded`,
    options,
    fetch_response_decoded
  )
}
/**
 * The `handleError` hook failed
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function handle_error_hook_failed(_values, options) {
  throw_error(
    'handle_error_hook_failed',
    `The \`handleError\` hook failed`,
    options,
    handle_error_hook_failed
  )
}
/**
 * `%name%` header is already set
 * @param {{ "name": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function header_already_set(_values, options) {
  throw_error(
    'header_already_set',
    `\`${_values.name}\` header is already set`,
    options,
    header_already_set
  )
}
/**
 * CORS error: %reason% `Access-Control-Allow-Origin` header is present on the requested resource
 * @param {{ "reason": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function load_fetch_cors(_values, options) {
  throw_error(
    'load_fetch_cors',
    `CORS error: ${_values.reason} \`Access-Control-Allow-Origin\` header is present on the requested resource`,
    options,
    load_fetch_cors
  )
}
/**
 * Data returned from `load` while rendering `%id%` is not a plain object
 * @param {{ "id": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function load_not_plain_object(_values, options) {
  throw_error(
    'load_not_plain_object',
    `Data returned from \`load\` while rendering \`${_values.id}\` is not a plain object`,
    options,
    load_not_plain_object
  )
}
/**
 * Data returned from `load` while rendering `%id%` is not serializable: %message% (`%path%`). If you need to serialize/deserialize custom types, use transport hooks: https://svelte.dev/docs/kit/hooks#transport.
 * @param {{ "id": string; "message": string; "path": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function load_not_serializable(_values, options) {
  throw_error(
    'load_not_serializable',
    `Data returned from \`load\` while rendering \`${_values.id}\` is not serializable: ${_values.message} (\`${_values.path}\`). If you need to serialize/deserialize custom types, use transport hooks: https://svelte.dev/docs/kit/hooks#transport.`,
    options,
    load_not_serializable
  )
}
/**
 * Failed to serialize promise while rendering `%id%`
 * @param {{ "id": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function load_promise_not_serializable(_values, options) {
  throw_error(
    'load_promise_not_serializable',
    `Failed to serialize promise while rendering \`${_values.id}\``,
    options,
    load_promise_not_serializable
  )
}
/**
 * Failed to get response header `%name%` — it must be included by the `filterSerializedResponseHeaders` option: https://svelte.dev/docs/kit/hooks#handle (at `%id%`)
 * @param {{ "name": string; "id": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function load_response_header_not_serialized(_values, options) {
  throw_error(
    'load_response_header_not_serialized',
    `Failed to get response header \`${_values.name}\` — it must be included by the \`filterSerializedResponseHeaders\` option: https://svelte.dev/docs/kit/hooks#handle (at \`${_values.id}\`)`,
    options,
    load_response_header_not_serialized
  )
}
/**
 * Cannot prerender pages with actions
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function prerender_actions(_values, options) {
  throw_error(
    'prerender_actions',
    `Cannot prerender pages with actions`,
    options,
    prerender_actions
  )
}
/**
 * Cannot prerender a `+server` file with %methods% or fallback handlers (`%id%`)
 * @param {{ "methods": string; "id": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function prerender_endpoint_methods(_values, options) {
  throw_error(
    'prerender_endpoint_methods',
    `Cannot prerender a \`+server\` file with ${_values.methods} or fallback handlers (\`${_values.id}\`)`,
    options,
    prerender_endpoint_methods
  )
}
/**
 * `%id%` is not prerenderable
 * @param {{ "id": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function prerender_endpoint_not_prerenderable(_values, options) {
  throw_error(
    'prerender_endpoint_not_prerenderable',
    `\`${_values.id}\` is not prerenderable`,
    options,
    prerender_endpoint_not_prerenderable
  )
}
/**
 * Cannot use prerendering if `config.csp.mode === 'nonce'`
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function prerender_nonce(_values, options) {
  throw_error(
    'prerender_nonce',
    `Cannot use prerendering if \`config.csp.mode === 'nonce'\``,
    options,
    prerender_nonce
  )
}
/**
 * Cannot use prerendering if page template contains `%tag%`
 * @param {{ "tag": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function prerender_template_nonce(_values, options) {
  throw_error(
    'prerender_template_nonce',
    `Cannot use prerendering if page template contains \`${_values.tag}\``,
    options,
    prerender_template_nonce
  )
}
/**
 * Cannot call a command (`%name%`) from a `%method%` handler
 * @param {{ "name": string; "method": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_command_method(_values, options) {
  throw_error(
    'remote_command_method',
    `Cannot call a command (\`${_values.name}\`) from a \`${_values.method}\` handler`,
    options,
    remote_command_method
  )
}
/**
 * Cannot call a command (`%name%`) inside a query or prerender function
 * @param {{ "name": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_command_readonly(_values, options) {
  throw_error(
    'remote_command_readonly',
    `Cannot call a command (\`${_values.name}\`) inside a query or prerender function`,
    options,
    remote_command_readonly
  )
}
/**
 * Cannot call a command (`%name%`) during server-side rendering
 * @param {{ "name": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_command_render(_values, options) {
  throw_error(
    'remote_command_render',
    `Cannot call a command (\`${_values.name}\`) during server-side rendering`,
    options,
    remote_command_render
  )
}
/**
 * Cannot %operation% cookies in `query` or `prerender` functions
 * @param {{ "operation": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_cookie_forbidden(_values, options) {
  throw_error(
    'remote_cookie_forbidden',
    `Cannot ${_values.operation} cookies in \`query\` or \`prerender\` functions`,
    options,
    remote_cookie_forbidden
  )
}
/**
 * Cookies %operation% in remote functions must have an absolute path
 * @param {{ "operation": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_cookie_path_relative(_values, options) {
  throw_error(
    'remote_cookie_path_relative',
    `Cookies ${_values.operation} in remote functions must have an absolute path`,
    options,
    remote_cookie_path_relative
  )
}
/**
 * `fail(...)` is for form actions. A remote `form` handler should call `invalid(...)` instead. See https://svelte.dev/docs/kit/remote-functions#form-Programmatic-validation
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_form_fail(_values, options) {
  throw_error(
    'remote_form_fail',
    `\`fail(...)\` is for form actions. A remote \`form\` handler should call \`invalid(...)\` instead. See https://svelte.dev/docs/kit/remote-functions#form-Programmatic-validation`,
    options,
    remote_form_fail
  )
}
/**
 * `setHeaders` is not allowed in remote functions
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_headers_forbidden(_values, options) {
  throw_error(
    'remote_headers_forbidden',
    `\`setHeaders\` is not allowed in remote functions`,
    options,
    remote_headers_forbidden
  )
}
/**
 * Invalid validator passed to remote function. Expected `'unchecked'` or a Standard Schema (https://standardschema.dev)
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_invalid_validator(_values, options) {
  throw_error(
    'remote_invalid_validator',
    `Invalid validator passed to remote function. Expected \`'unchecked'\` or a Standard Schema (https://standardschema.dev)`,
    options,
    remote_invalid_validator
  )
}
/**
 * `query.live` `%name%` did not yield a value
 * @param {{ "name": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_query_live_no_value(_values, options) {
  throw_error(
    'remote_query_live_no_value',
    `\`query.live\` \`${_values.name}\` did not yield a value`,
    options,
    remote_query_live_no_value
  )
}
/**
 * `query.live` `%name%` must return an `Iterator`, `Iterable`, `AsyncIterator` or `AsyncIterable`
 * @param {{ "name": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_query_live_not_iterable(_values, options) {
  throw_error(
    'remote_query_live_not_iterable',
    `\`query.live\` \`${_values.name}\` must return an \`Iterator\`, \`Iterable\`, \`AsyncIterator\` or \`AsyncIterable\``,
    options,
    remote_query_live_not_iterable
  )
}
/**
 * Cannot call `%type%` `%name%` while prerendering, as prerendered pages need static data. Use `prerender` from `$app/server` instead
 * @param {{ "type": string; "name": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_query_prerender(_values, options) {
  throw_error(
    'remote_query_prerender',
    `Cannot call \`${_values.type}\` \`${_values.name}\` while prerendering, as prerendered pages need static data. Use \`prerender\` from \`$app/server\` instead`,
    options,
    remote_query_prerender
  )
}
/**
 * Cannot access `event.%property%` in a query. Pass the value as an argument to the query instead
 * @param {{ "property": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_request_property(_values, options) {
  throw_error(
    'remote_request_property',
    `Cannot access \`event.${_values.property}\` in a query. Pass the value as an argument to the query instead`,
    options,
    remote_request_property
  )
}
/**
 * `requested(%name%, %limit%)` cannot be used with synchronous iteration because the query validator is async. Use `for await ... of` instead
 * @param {{ "name": string; "limit": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_requested_async_validator(_values, options) {
  throw_error(
    'remote_requested_async_validator',
    `\`requested(${_values.name}, ${_values.limit})\` cannot be used with synchronous iteration because the query validator is async. Use \`for await ... of\` instead`,
    options,
    remote_requested_async_validator
  )
}
/**
 * `requested(...)` can only be called in the context of a command/form remote function
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_requested_context(_values, options) {
  throw_error(
    'remote_requested_context',
    `\`requested(...)\` can only be called in the context of a command/form remote function`,
    options,
    remote_requested_context
  )
}
/**
 * Limit must be a non-negative integer or `Infinity`
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_requested_invalid_limit(_values, options) {
  throw_error(
    'remote_requested_invalid_limit',
    `Limit must be a non-negative integer or \`Infinity\``,
    options,
    remote_requested_invalid_limit
  )
}
/**
 * `requested(...)` expects a query function created with `query(...)`, `query.batch(...)`, or `query.live(...)`
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_requested_invalid_query(_values, options) {
  throw_error(
    'remote_requested_invalid_query',
    `\`requested(...)\` expects a query function created with \`query(...)\`, \`query.batch(...)\`, or \`query.live(...)\``,
    options,
    remote_requested_invalid_query
  )
}
/**
 * `%method%()` is invalid for %type% queries. Use `%replacement%()` instead.
 * @param {{ "method": string; "type": string; "replacement": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function remote_requested_wrong_method(_values, options) {
  throw_error(
    'remote_requested_wrong_method',
    `\`${_values.method}()\` is invalid for ${_values.type} queries. Use \`${_values.replacement}()\` instead.`,
    options,
    remote_requested_wrong_method
  )
}
/**
 * Cannot call `%name%` on the server
 * @param {{ "name": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function server_api_unavailable(_values, options) {
  throw_error(
    'server_api_unavailable',
    `Cannot call \`${_values.name}\` on the server`,
    options,
    server_api_unavailable
  )
}
/**
 * Cannot use `setHeaders(...)` after the response has been generated
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function set_headers_after_response(_values, options) {
  throw_error(
    'set_headers_after_response',
    `Cannot use \`setHeaders(...)\` after the response has been generated`,
    options,
    set_headers_after_response
  )
}
/**
 * Use `event.cookies.set(name, value, options)` instead of `event.setHeaders` to set cookies
 * @param {void} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function set_headers_cookie(_values, options) {
  throw_error(
    'set_headers_cookie',
    `Use \`event.cookies.set(name, value, options)\` instead of \`event.setHeaders\` to set cookies`,
    options,
    set_headers_cookie
  )
}
/**
 * Cannot call `fetch` eagerly during server-side rendering with relative URL (`%url%`) — put your `fetch` calls inside `onMount` or a `load` function instead
 * @param {{ "url": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function ssr_fetch_relative_url(_values, options) {
  throw_error(
    'ssr_fetch_relative_url',
    `Cannot call \`fetch\` eagerly during server-side rendering with relative URL (\`${_values.url}\`) — put your \`fetch\` calls inside \`onMount\` or a \`load\` function instead`,
    options,
    ssr_fetch_relative_url
  )
}
/**
 * Can only read `%name%` on the server during rendering (not in e.g. `load` functions), as it is bound to the current request via component context. This prevents state from leaking between users.
 * @param {{ "name": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function state_read_outside_render(_values, options) {
  throw_error(
    'state_read_outside_render',
    `Can only read \`${_values.name}\` on the server during rendering (not in e.g. \`load\` functions), as it is bound to the current request via component context. This prevents state from leaking between users.`,
    options,
    state_read_outside_render
  )
}
/**
 * Cannot access `url.%property%` on a page with prerendering enabled
 * @param {{ "property": string }} _values
 * @param {ServerThrowOptions} [options]
 * @returns {never}
 */
function url_search_unavailable_prerender(_values, options) {
  throw_error(
    'url_search_unavailable_prerender',
    `Cannot access \`url.${_values.property}\` on a page with prerendering enabled`,
    options,
    url_search_unavailable_prerender
  )
}
export {
  remote_cookie_forbidden as A,
  remote_requested_context as B,
  prerender_endpoint_methods as C,
  remote_command_method as D,
  prerender_template_nonce as E,
  remote_query_live_no_value as F,
  set_headers_after_response as G,
  remote_requested_invalid_query as H,
  remote_query_live_not_iterable as I,
  state_read_outside_render as J,
  set_headers_cookie as K,
  remote_query_prerender as L,
  remote_form_fail as M,
  remote_headers_forbidden as N,
  remote_command_readonly as O,
  remote_invalid_validator as P,
  remote_request_property as R,
  prerender_actions as S,
  prerender_nonce as T,
  remote_requested_wrong_method as U,
  remote_requested_invalid_limit as V,
  server_api_unavailable as W,
  capture_error as X,
  url_search_unavailable_prerender as Y,
  load_fetch_cors as _,
  action_return_error as a,
  load_promise_not_serializable as b,
  client_address_unsupported as c,
  cookies_set_after_response as d,
  csp_report_only_missing_report as f,
  header_already_set as g,
  handle_error_hook_failed as h,
  action_response_not_serializable as i,
  remote_cookie_path_relative as j,
  remote_command_render as k,
  cookie_too_large as l,
  fetch_response_decoded as m,
  action_default_with_named as n,
  action_return_redirect as o,
  endpoint_invalid_response as p,
  ssr_fetch_relative_url as q,
  action_name_reserved as r,
  action_throw_fail as s,
  action_data_not_serializable as t,
  cookies_serialize_before_route as u,
  load_not_plain_object as v,
  prerender_endpoint_not_prerenderable as w,
  load_response_header_not_serialized as x,
  load_not_serializable as y,
  remote_requested_async_validator as z
}

//# sourceMappingURL=server-errors.js.map
