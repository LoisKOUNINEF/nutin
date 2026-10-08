# How do I mock core services?

For services that shouldn't hit real state (event bus, HTTP, i18n, router),
`testin-nutin/mocks/` provides plain classes built from a shared factory,
`createMockMethod()`:

```js
fn.calls                        // recorded argument arrays
fn.mockReturnValue(value)       // always return value
fn.mockImplementation(implFn)   // delegate to implFn
fn.mockReset()                  // clear calls + both overrides
```

Each mock mirrors its real service's public API, and most of its methods have a
working default implementation (e.g. `MockEventBus` really dispatches), which
`mockReset()` keeps. `MockHttpClient`'s methods are bare: unconfigured, they
return `undefined`.

There's no auto-mocking or DI container — substitution is manual constructor
injection, since the core event-bus facades and similar services take their
dependency as a typed constructor param.

| Mock | File | Mocks (see NUTIN.md) | Notable methods |
|---|---|---|---|
| `MockEventBus` | `mocks/mock-event-bus.js` | `AppEventBus` | `subscribe`/`once`/`emit`/`off` form a real in-memory pub/sub; `onDestroy`; `reset()` |
| `MockHttpClient` | `mocks/mock-http-client.js` | `AppHttpClient` | `get`/`post`/`put`/`patch`/`delete`, `addRequestInterceptor`/`addResponseInterceptor`, `onDestroy`, all bare mocks; `reset()` |
| `MockI18n` | `mocks/mock-i18n.js` | `I18nService` | working `translate`/`getTranslationObject` lookup, `loadTranslations`, `setCurrentLanguage`, `onLanguageChange` (returns an unsubscribe function), `initTranslations`, `resetTranslations`; `currentLanguage`/`defaultLanguage`/`languages`/`localStorageKey` getters; `setTranslations()`/`setDefaultTranslations()` to seed state directly; `reset()` |
| `MockRouter` | `mocks/mock-router.js` | `Router`/`AppRouter` | `navigate`, `reload`, `getCurrentParams`, `getParam`, `removeEventListeners`, `onDestroy`; `setParams()` to seed params; `reset()` |

The shared spy factory itself lives at `mocks/create-mock-method.js`.

See [How do I use test coverage?](./HOWDOI_USE_TEST_COVERAGE.md).
