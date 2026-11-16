// Node has no Web Storage; the migrated client-side storage helpers read and
// write localStorage/sessionStorage directly, so tests get a minimal in-memory
// implementation with the standard Storage surface.
function createMemoryStorage(): Storage {
  let values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => {
      values = new Map()
    },
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key)
    },
    setItem: (key, value) => {
      values.set(key, String(value))
    }
  }
}

// Client-side helpers gate on window being defined before touching storage.
// DOM test environments (happy-dom) already provide window and storage, so
// only stub them when the runner environment does not.
if (globalThis.window === undefined) {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis
  })
}
if (globalThis.localStorage === undefined) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: createMemoryStorage()
  })
}
if (globalThis.sessionStorage === undefined) {
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: createMemoryStorage()
  })
}
