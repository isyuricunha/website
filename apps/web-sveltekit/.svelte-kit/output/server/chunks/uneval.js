// ../../node_modules/.pnpm/devalue@5.9.4/node_modules/devalue/src/constants.js
var MAX_ARRAY_LEN = 2 ** 32 - 1
var MAX_ARRAY_INDEX = MAX_ARRAY_LEN - 1
// ../../node_modules/.pnpm/devalue@5.9.4/node_modules/devalue/src/utils.js
/** @type {Record<string, string>} */
var escaped = {
  '<': '\\u003C',
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '	': '\\t',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
}
var DevalueError = class extends Error {
  /**
   * @param {string} message
   * @param {string[]} keys
   * @param {any} [value] - The value that failed to be serialized
   * @param {any} [root] - The root value being serialized
   */
  constructor(message, keys, value, root) {
    super(message)
    this.name = 'DevalueError'
    this.path = keys.join('')
    this.value = value
    this.root = root
  }
}
/** @param {any} thing */
function is_primitive(thing) {
  return thing === null || (typeof thing !== 'object' && typeof thing !== 'function')
}
var object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(Object.prototype)
  .sort()
  .join('\0')
/** @param {any} thing */
function is_plain_object(thing) {
  const proto = Object.getPrototypeOf(thing)
  return (
    proto === Object.prototype ||
    proto === null ||
    Object.getPrototypeOf(proto) === null ||
    Object.getOwnPropertyNames(proto).sort().join('\0') === object_proto_names
  )
}
/** @param {any} thing */
function get_type(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1)
}
/** @param {any} thing */
function is_buffer(thing) {
  return typeof Buffer !== 'undefined' && Buffer.isBuffer(thing)
}
/** @param {string} char */
function get_escaped_char(char) {
  switch (char) {
    case '"':
      return '\\"'
    case '<':
      return '\\u003C'
    case '\\':
      return '\\\\'
    case '\n':
      return '\\n'
    case '\r':
      return '\\r'
    case '	':
      return '\\t'
    case '\b':
      return '\\b'
    case '\f':
      return '\\f'
    case '\u2028':
      return '\\u2028'
    case '\u2029':
      return '\\u2029'
    default:
      return char < ' ' ? `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}` : ''
  }
}
/** @param {string} str */
function stringify_string(str) {
  let result = ''
  let last_pos = 0
  const len = str.length
  for (let i = 0; i < len; i += 1) {
    const char = str[i]
    const replacement = get_escaped_char(char)
    if (replacement) {
      result += str.slice(last_pos, i) + replacement
      last_pos = i + 1
    }
  }
  return `"${last_pos === 0 ? str : result + str.slice(last_pos)}"`
}
/** @param {Record<string | symbol, any>} object */
function enumerable_symbols(object) {
  return Object.getOwnPropertySymbols(object).filter(
    (symbol) => Object.getOwnPropertyDescriptor(object, symbol).enumerable
  )
}
var is_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/
/** @param {string} key */
function stringify_key(key) {
  return is_identifier.test(key) ? '.' + key : '[' + JSON.stringify(key) + ']'
}
/** @param {number} n */
function is_valid_array_index(n) {
  if (!Number.isInteger(n)) return false
  if (n < 0) return false
  if (n > MAX_ARRAY_INDEX) return false
  return true
}
/** @param {number} n */
function is_valid_array_len(n) {
  if (!Number.isInteger(n)) return false
  if (n < 0) return false
  if (n > MAX_ARRAY_LEN) return false
  return true
}
/** @param {string} s */
function is_valid_array_index_string(s) {
  if (s.length === 0) return false
  if (s.length > 1 && s.charCodeAt(0) === 48) return false
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c < 48 || c > 57) return false
  }
  return is_valid_array_index(+s)
}
/**
 * Returns the length of the leading run of valid array indices in `keys`.
 * @param {readonly string[]} keys
 */
function array_index_cut(keys) {
  for (var i = keys.length - 1; i >= 0; i--) if (is_valid_array_index_string(keys[i])) break
  return i + 1
}
/**
 * Finds the populated indices of an array.
 * @param {unknown[]} array
 */
function valid_array_indices(array) {
  const keys = Object.keys(array)
  keys.length = array_index_cut(keys)
  return keys
}
// ../../node_modules/.pnpm/devalue@5.9.4/node_modules/devalue/src/uneval.js
var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$'
var MIN_STRING_LENGTH = 128
var unsafe_chars = /[<\b\f\n\r\t\0\u2028\u2029]/g
var reserved =
  /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/
/**
 * Turn a value into the JavaScript that creates an equivalent value
 * @param {any} value
 * @param {(value: any, uneval: (value: any) => string) => string | void} [replacer]
 */
function uneval(value, replacer) {
  const counts = /* @__PURE__ */ new Map()
  /** @type {string[]} */
  const keys = []
  const custom = /* @__PURE__ */ new Map()
  /** @type {Map<string | bigint, string> | undefined} */
  let primitives
  /** @param {any} thing */
  function stringify_cached_primitive(thing) {
    if (
      (typeof thing === 'string' && thing.length >= MIN_STRING_LENGTH) ||
      typeof thing === 'bigint'
    ) {
      primitives ??= /* @__PURE__ */ new Map()
      let literal = primitives.get(thing)
      if (literal === void 0) {
        literal = stringify_primitive(thing)
        primitives.set(thing, literal)
      }
      return literal
    }
    return stringify_primitive(thing)
  }
  /** @param {any} thing */
  function walk(thing) {
    if (!is_primitive(thing)) {
      if (counts.has(thing)) {
        counts.set(thing, counts.get(thing) + 1)
        return
      }
      counts.set(thing, 1)
      if (replacer) {
        const str = replacer(thing, (value) => uneval(value, replacer))
        if (typeof str === 'string') {
          custom.set(thing, str)
          return
        }
      }
      if (typeof thing === 'function')
        throw new DevalueError(`Cannot stringify a function`, keys, thing, value)
      switch (get_type(thing)) {
        case 'BigInt':
        case 'String':
          walk(thing.valueOf())
          return
        case 'Number':
        case 'Boolean':
        case 'Date':
        case 'RegExp':
        case 'URL':
        case 'URLSearchParams':
          return
        case 'Array':
          for (const i of valid_array_indices(thing)) {
            keys.push(`[${i}]`)
            walk(thing[i])
            keys.pop()
          }
          break
        case 'Set':
          Array.from(thing).forEach(walk)
          break
        case 'Map':
          for (const [key, value] of thing) {
            keys.push(`.get(${is_primitive(key) ? stringify_cached_primitive(key) : '...'})`)
            walk(key)
            walk(value)
            keys.pop()
          }
          break
        case 'Int8Array':
        case 'Uint8Array':
        case 'Uint8ClampedArray':
        case 'Int16Array':
        case 'Uint16Array':
        case 'Float16Array':
        case 'Int32Array':
        case 'Uint32Array':
        case 'Float32Array':
        case 'Float64Array':
        case 'BigInt64Array':
        case 'BigUint64Array':
        case 'DataView':
          if (!is_buffer(thing)) walk(thing.buffer)
          return
        case 'ArrayBuffer':
          return
        case 'Temporal.Duration':
        case 'Temporal.Instant':
        case 'Temporal.PlainDate':
        case 'Temporal.PlainTime':
        case 'Temporal.PlainDateTime':
        case 'Temporal.PlainMonthDay':
        case 'Temporal.PlainYearMonth':
        case 'Temporal.ZonedDateTime':
          return
        default:
          if (!is_plain_object(thing))
            throw new DevalueError(`Cannot stringify arbitrary non-POJOs`, keys, thing, value)
          if (enumerable_symbols(thing).length > 0)
            throw new DevalueError(`Cannot stringify POJOs with symbolic keys`, keys, thing, value)
          for (const key of Object.keys(thing)) {
            if (key === '__proto__')
              throw new DevalueError(
                `Cannot stringify objects with __proto__ keys`,
                keys,
                thing,
                value
              )
            keys.push(stringify_key(key))
            walk(thing[key])
            keys.pop()
          }
      }
    } else if (typeof thing === 'symbol')
      throw new DevalueError(`Cannot stringify a Symbol primitive`, keys, thing, value)
    else if (
      (typeof thing === 'string' && thing.length >= MIN_STRING_LENGTH) ||
      typeof thing === 'bigint'
    )
      counts.set(thing, (counts.get(thing) || 0) + 1)
  }
  walk(value)
  const names = /* @__PURE__ */ new Map()
  /** @type {Array<[any, number]>} */
  const repeated = []
  counts.forEach((count, thing) => {
    if (count > 1) repeated.push([thing, count])
  })
  repeated
    .sort((a, b) => b[1] - a[1])
    .forEach(([thing, count]) => {
      const name = get_name(names.size)
      if (is_primitive(thing)) {
        const length = stringify_cached_primitive(thing).length
        if (length * count <= length + (count + 1) * name.length + 25) return
      }
      names.set(thing, name)
    })
  /**
   * @param {any} thing
   * @returns {string}
   */
  function stringify(thing) {
    if (names.has(thing)) return names.get(thing)
    if (is_primitive(thing)) return stringify_primitive(thing)
    if (custom.has(thing)) return custom.get(thing)
    const type = get_type(thing)
    switch (type) {
      case 'Number':
      case 'String':
      case 'Boolean':
      case 'BigInt':
        return `Object(${stringify(thing.valueOf())})`
      case 'RegExp':
        const { source, flags } = thing
        return flags
          ? `new RegExp(${stringify_string(source)},"${flags}")`
          : `new RegExp(${stringify_string(source)})`
      case 'Date':
        return `new Date(${thing.getTime()})`
      case 'URL':
        return `new URL(${stringify_string(thing.toString())})`
      case 'URLSearchParams':
        return `new URLSearchParams(${stringify_string(thing.toString())})`
      case 'Array': {
        let has_holes = false
        let result = '['
        for (let i = 0; i < thing.length; i += 1) {
          if (i > 0) result += ','
          if (Object.hasOwn(thing, i)) result += stringify(thing[i])
          else if (!has_holes) {
            const populated_keys = valid_array_indices(thing)
            const population = populated_keys.length
            const d = String(thing.length).length
            const array = stringify_sparse_array(thing.length)
            if (thing.length + 2 > array.length + 18 + population * (d + 2))
              return `Object.assign(${array},{${populated_keys.map((k) => `${k}:${stringify(thing[k])}`).join(',')}})`
            has_holes = true
          }
        }
        const tail = thing.length === 0 || Object.hasOwn(thing, thing.length - 1) ? '' : ','
        return result + tail + ']'
      }
      case 'Set':
      case 'Map':
        return `new ${type}([${Array.from(thing).map(stringify).join(',')}])`
      case 'Int8Array':
      case 'Uint8Array':
      case 'Uint8ClampedArray':
      case 'Int16Array':
      case 'Uint16Array':
      case 'Float16Array':
      case 'Int32Array':
      case 'Uint32Array':
      case 'Float32Array':
      case 'Float64Array':
      case 'BigInt64Array':
      case 'BigUint64Array': {
        if (is_buffer(thing)) thing = new Uint8Array(thing)
        let str = `new ${type}`
        if (!names.has(thing.buffer))
          str += `([${stringify_typed_array_elements(type, thing.buffer)}])`
        else str += `(${stringify(thing.buffer)})`
        if (thing.byteLength !== thing.buffer.byteLength) {
          const start = thing.byteOffset / thing.BYTES_PER_ELEMENT
          const end = start + thing.length
          str += `.subarray(${start},${end})`
        }
        return str
      }
      case 'DataView': {
        let str = `new DataView`
        if (!names.has(thing.buffer))
          str += `(new Uint8Array([${new Uint8Array(thing.buffer)}]).buffer`
        else str += `(${stringify(thing.buffer)}`
        if (thing.byteLength !== thing.buffer.byteLength)
          str += `,${thing.byteOffset},${thing.byteLength}`
        return str + ')'
      }
      case 'ArrayBuffer':
        return `new Uint8Array([${new Uint8Array(thing).toString()}]).buffer`
      case 'Temporal.Duration':
      case 'Temporal.Instant':
      case 'Temporal.PlainDate':
      case 'Temporal.PlainTime':
      case 'Temporal.PlainDateTime':
      case 'Temporal.PlainMonthDay':
      case 'Temporal.PlainYearMonth':
      case 'Temporal.ZonedDateTime':
        return `${type}.from(${stringify_string(thing.toString())})`
      default:
        const keys = Object.keys(thing)
        const obj = keys.map((key) => `${safe_key(key)}:${stringify(thing[key])}`).join(',')
        if (Object.getPrototypeOf(thing) === null)
          return keys.length > 0 ? `{${obj},__proto__:null}` : `{__proto__:null}`
        return `{${obj}}`
    }
  }
  const str = stringify(value)
  if (names.size) {
    /** @type {string[]} */
    const params = []
    /** @type {string[]} */
    const statements = []
    /** @type {string[]} */
    const values = []
    /** @type {string[]} */
    const reconstructions = []
    names.forEach((name, thing) => {
      params.push(name)
      if (custom.has(thing)) {
        values.push(custom.get(thing))
        return
      }
      if (is_primitive(thing)) {
        values.push(stringify_cached_primitive(thing))
        return
      }
      const type = get_type(thing)
      switch (type) {
        case 'Number':
        case 'String':
        case 'Boolean':
        case 'BigInt': {
          const primitive = thing.valueOf()
          if (names.has(primitive)) {
            values.push('{}')
            reconstructions.push(`${name}=Object(${stringify(primitive)})`)
          } else values.push(`Object(${stringify(primitive)})`)
          break
        }
        case 'RegExp':
          const { source, flags } = thing
          const regexp = flags
            ? `new RegExp(${stringify_string(source)},"${flags}")`
            : `new RegExp(${stringify_string(source)})`
          values.push(regexp)
          break
        case 'Date':
          values.push(`new Date(${thing.getTime()})`)
          break
        case 'URL':
          values.push(`new URL(${stringify_string(thing.toString())})`)
          break
        case 'URLSearchParams':
          values.push(`new URLSearchParams(${stringify_string(thing.toString())})`)
          break
        case 'Array': {
          const populated_keys = valid_array_indices(thing)
          values.push(
            thing.length > 32 + 2 * populated_keys.length
              ? stringify_sparse_array(thing.length)
              : `Array(${thing.length})`
          )
          for (const i of populated_keys) statements.push(`${name}[${i}]=${stringify(thing[i])}`)
          break
        }
        case 'Set': {
          values.push(`new Set`)
          const adds = Array.from(thing).map((v) => `.add(${stringify(v)})`)
          if (adds.length > 0) statements.push(name + adds.join(''))
          break
        }
        case 'Map': {
          values.push(`new Map`)
          const sets = Array.from(thing).map(([k, v]) => `.set(${stringify(k)}, ${stringify(v)})`)
          if (sets.length > 0) statements.push(name + sets.join(''))
          break
        }
        case 'Int8Array':
        case 'Uint8Array':
        case 'Uint8ClampedArray':
        case 'Int16Array':
        case 'Uint16Array':
        case 'Float16Array':
        case 'Int32Array':
        case 'Uint32Array':
        case 'Float32Array':
        case 'Float64Array':
        case 'BigInt64Array':
        case 'BigUint64Array': {
          if (is_buffer(thing)) thing = new Uint8Array(thing)
          let str = `new ${type}`
          if (!names.has(thing.buffer))
            str += `([${stringify_typed_array_elements(type, thing.buffer)}])`
          else str += `(${stringify(thing.buffer)})`
          if (thing.byteLength !== thing.buffer.byteLength) {
            const start = thing.byteOffset / thing.BYTES_PER_ELEMENT
            const end = start + thing.length
            str += `.subarray(${start},${end})`
          }
          values.push(`{}`)
          reconstructions.push(`${name}=${str}`)
          break
        }
        case 'DataView': {
          let str = `new DataView`
          if (!names.has(thing.buffer))
            str += `(new Uint8Array([${new Uint8Array(thing.buffer)}]).buffer`
          else str += `(${stringify(thing.buffer)}`
          if (thing.byteLength !== thing.buffer.byteLength)
            str += `,${thing.byteOffset},${thing.byteLength}`
          str += ')'
          values.push(`{}`)
          reconstructions.push(`${name}=${str}`)
          break
        }
        case 'ArrayBuffer':
          values.push(`new Uint8Array([${new Uint8Array(thing)}]).buffer`)
          break
        case 'Temporal.Duration':
        case 'Temporal.Instant':
        case 'Temporal.PlainDate':
        case 'Temporal.PlainTime':
        case 'Temporal.PlainDateTime':
        case 'Temporal.PlainMonthDay':
        case 'Temporal.PlainYearMonth':
        case 'Temporal.ZonedDateTime':
          values.push(`${type}.from(${stringify_string(thing.toString())})`)
          break
        default:
          values.push(Object.getPrototypeOf(thing) === null ? 'Object.create(null)' : '{}')
          Object.keys(thing).forEach((key) => {
            statements.push(`${name}${safe_prop(key)}=${stringify(thing[key])}`)
          })
      }
    })
    statements.push(`return ${str}`)
    const body = [...reconstructions, ...statements].join(';')
    if (params.length > 65534)
      return `(function(){var[${params.join(',')}]=arguments[0];${body}}([${values.join(',')}]))`
    return `(function(${params.join(',')}){${body}}(${values.join(',')}))`
  } else return str
}
/**
 * Emit an array whose storage is not proportional to its declared length.
 * As in the default parse operations, touching and deleting the largest valid
 * index forces V8 into dictionary-elements mode before setting the length.
 * Merely starting with [] and assigning .length still eagerly allocates.
 * @param {number} length
 */
function stringify_sparse_array(length) {
  return `(function(a){a[${MAX_ARRAY_INDEX}]=0;delete a[${MAX_ARRAY_INDEX}];a.length=${length};return a}([]))`
}
/**
 * Serialize the elements of `buffer`, read as `type`, as a comma-separated list.
 * The view is created from `type` rather than from the serialized value's own
 * constructor, which may be a subclass like Node's `Buffer` whose `toString`
 * decodes the bytes instead of listing them.
 * `BigInt64Array`/`BigUint64Array` elements are bigints and must be written
 * with an `n` suffix, otherwise the emitted `new BigInt64Array([...])` throws.
 * @param {string} type
 * @param {ArrayBufferLike} buffer
 */
function stringify_typed_array_elements(type, buffer) {
  const array = new globalThis[type](buffer)
  if (type === 'BigInt64Array' || type === 'BigUint64Array')
    return Array.from(array, (element) => `${element}n`).join(',')
  if (
    array instanceof Float32Array ||
    array instanceof Float64Array ||
    (typeof Float16Array !== 'undefined' && array instanceof Float16Array)
  )
    return Array.from(array, (element) => (Object.is(element, -0) ? '-0' : `${element}`)).join(',')
  return array.toString()
}
/** @param {number} num */
function get_name(num) {
  let name = ''
  do {
    name = chars[num % 54] + name
    num = ~~(num / 54) - 1
  } while (num >= 0)
  return reserved.test(name) ? `${name}0` : name
}
/** @param {string} c */
function escape_unsafe_char(c) {
  return escaped[c] || c
}
/** @param {string} str */
function escape_unsafe_chars(str) {
  return str.replace(unsafe_chars, escape_unsafe_char)
}
/** @param {string} key */
function safe_key(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escape_unsafe_chars(JSON.stringify(key))
}
/** @param {string} key */
function safe_prop(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key)
    ? `.${key}`
    : `[${escape_unsafe_chars(JSON.stringify(key))}]`
}
/** @param {any} thing */
function stringify_primitive(thing) {
  const type = typeof thing
  if (type === 'string') return stringify_string(thing)
  if (thing === void 0) return 'void 0'
  if (thing === 0 && 1 / thing < 0) return '-0'
  const str = String(thing)
  if (type === 'number') return str.replace(/^(-)?0\./, '$1.')
  if (type === 'bigint') return thing + 'n'
  return str
}
export {
  is_buffer as a,
  is_valid_array_len as c,
  valid_array_indices as d,
  MAX_ARRAY_INDEX as f,
  get_type as i,
  stringify_key as l,
  DevalueError as n,
  is_plain_object as o,
  enumerable_symbols as r,
  is_valid_array_index as s,
  uneval as t,
  stringify_string as u
}

//# sourceMappingURL=uneval.js.map
