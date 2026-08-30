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

Unlike `spyOn`, an unconfigured mock method returns `undefined` — there's no
"original" to fall back to.

There's no auto-mocking or DI container — substitution is manual constructor
injection, since the core event-bus facades and similar services take their
dependency as a typed constructor param.

| Mock | File | Mocks (see NUTIN.md) | Notable methods |
|---|---|---|---|
| `MockEventBus` | `mocks/mock-event-bus.js` | `AppEventBus` | `on`/`off`/`emit` form a real in-memory pub/sub; `subscribe` is a bare mock (doesn't actually register — asymmetric with `on`) |
| `MockHttpClient` | `mocks/mock-http-client.js` | `AppHttpClient` | `get`/`post`/`put`/`patch`/`delete`, all bare mocks |
| `MockI18n` | `mocks/mock-i18n.js` | `I18nService` | `translate`, `loadTranslations`, etc. (bare mocks, see gotcha above); real `currentLanguage` getter; `setTranslations()`/`setDefaultTranslations()` to seed state directly |
| `MockRouter` | `mocks/mock-router.js` | `Router`/`AppRouter` | `navigate`, `handlePopState`, `handleNotFound`, `handleGuards`, `initializeEventListeners` — names match the real class 1:1, though several are `private` there |

The shared spy factory itself lives at `mocks/create-mock-method.js`.

See [How do I use test coverage?](./HOWDOI_USE_TEST_COVERAGE.md).
