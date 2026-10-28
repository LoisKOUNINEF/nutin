// In-memory stand-in for the `chrome.*` APIs that src/app/services/chrome-api wraps (jsdom has no
// `chrome`). Install it as the global `chrome` before each test, and remove it after:
//
//   beforeEach(() => { fake = installFakeChrome({ url: 'https://example.com/a' }); });
//   afterEach(() => uninstallFakeChrome());
//
// Extend it along with the service when the app uses more of the API.

function createEvent() {
  const listeners = new Set();
  return {
    addListener: (fn) => listeners.add(fn),
    removeListener: (fn) => listeners.delete(fn),
    hasListeners: () => listeners.size > 0,
    dispatch: (...args) => listeners.forEach((fn) => fn(...args)),
  };
}

// Values are cloned in and out, like the real storage's JSON serialization.
const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

function createStorageArea(name, onChanged, quota = {}) {
  const data = new Map();

  const emit = (changes) => {
    if (Object.keys(changes).length > 0) onChanged.dispatch(changes, name);
  };

  return {
    ...quota,
    data,
    // Set it to an Error to make the next set() reject with it (e.g. a quota error).
    failNextSet: null,
    async get(keys) {
      const wanted = keys === null || keys === undefined ? [...data.keys()] : [].concat(keys);
      return Object.fromEntries(wanted.filter((key) => data.has(key)).map((key) => [key, clone(data.get(key))]));
    },
    async set(items) {
      if (this.failNextSet) {
        const error = this.failNextSet;
        this.failNextSet = null;
        throw error;
      }
      const changes = {};
      for (const [key, value] of Object.entries(items)) {
        changes[key] = { oldValue: clone(data.get(key)), newValue: clone(value) };
        data.set(key, clone(value));
      }
      emit(changes);
    },
    async remove(keys) {
      const changes = {};
      for (const key of [].concat(keys)) {
        if (!data.has(key)) continue;
        changes[key] = { oldValue: clone(data.get(key)) };
        data.delete(key);
      }
      emit(changes);
    },
  };
}

// `url` is the active tab's. `browser: 'firefox'` makes the extension's URLs moz-extension:// ones.
export function createFakeChrome({ url = 'https://example.com/', browser = 'chrome' } = {}) {
  const onChanged = createEvent();
  const activeTab = { id: 1, windowId: 1, active: true, url };

  const fake = {
    runtime: {
      getURL: (path) => `${browser === 'firefox' ? 'moz-extension' : 'chrome-extension'}://test/${path}`,
    },
    storage: {
      onChanged,
      local: createStorageArea('local', onChanged),
      session: createStorageArea('session', onChanged),
      sync: createStorageArea('sync', onChanged, { QUOTA_BYTES: 102400, QUOTA_BYTES_PER_ITEM: 8192, MAX_ITEMS: 512 }),
    },
    tabs: {
      onActivated: createEvent(),
      onUpdated: createEvent(),
      // Every create()/update() call, for assertions.
      created: [],
      updated: [],
      async query() {
        return [{ ...activeTab }];
      },
      async create(props) {
        fake.tabs.created.push(props);
        return { id: 2, ...props };
      },
      // Records the call, then navigates like the browser would.
      async update(tabId, props) {
        fake.tabs.updated.push({ tabId, ...props });
        if (props.url) fake.navigate(props.url);
        return { ...activeTab };
      },
    },
    // Test helpers: what the browser does when the user acts.
    activateTab(newUrl) {
      activeTab.url = newUrl;
      fake.tabs.onActivated.dispatch({ tabId: 1, windowId: 1 });
    },
    navigate(newUrl) {
      activeTab.url = newUrl;
      fake.tabs.onUpdated.dispatch(1, { url: newUrl }, { ...activeTab });
    },
  };
  return fake;
}

export function installFakeChrome(options) {
  const fake = createFakeChrome(options);
  globalThis.chrome = fake;
  return fake;
}

export function uninstallFakeChrome() {
  delete globalThis.chrome;
}
